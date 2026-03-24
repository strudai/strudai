// --- Console log interception ---
const consoleBuffer = [];
const consoleBody = document.getElementById('consoleBody');
const consoleToggleBtn = document.getElementById('consoleToggle');
const MAX_CONSOLE_LINES = 200;

const origLog = console.log;
const origError = console.error;
const origWarn = console.warn;

function appendConsoleLine(level, text) {
  consoleBuffer.push({ level, text });
  const line = document.createElement('div');
  line.className = `console-line ${level}`;
  line.textContent = text;
  consoleBody.appendChild(line);
  while (consoleBody.children.length > MAX_CONSOLE_LINES) {
    consoleBody.firstChild.remove();
  }
  consoleBody.scrollTop = consoleBody.scrollHeight;
  if (level === 'error') {
    consoleToggleBtn.classList.add('has-errors');
  }
}

function filterStyledArgs(args) {
  if (typeof args[0] === 'string' && args[0].startsWith('%c')) {
    args = [args[0].replaceAll('%c', ''), ...args.slice(1).filter(a => typeof a !== 'string' || !a.includes('background-color'))];
  }
  return args.filter(a => typeof a !== 'string' || !a.match(/^[\s;]*background-color:/));
}

console.log = (...args) => { const f = filterStyledArgs(args); if (f.length) appendConsoleLine('log', f.join(' ')); origLog.apply(console, args); };
console.error = (...args) => { const f = filterStyledArgs(args); if (f.length) { appendConsoleLine('error', f.join(' ')); maybeQueueError(f.join(' ')); } origError.apply(console, args); };
console.warn = (...args) => { const f = filterStyledArgs(args); if (f.length) appendConsoleLine('warn', f.join(' ')); origWarn.apply(console, args); };

// --- Console panel toggle ---
const consolePanel = document.getElementById('consolePanel');
const consoleClose = document.getElementById('consoleClose');

consoleToggleBtn.addEventListener('click', () => {
  consolePanel.classList.remove('hidden');
  consoleToggleBtn.style.display = 'none';
  consoleToggleBtn.classList.remove('has-errors');
});

consoleClose.addEventListener('click', () => {
  consolePanel.classList.add('hidden');
  consoleToggleBtn.style.display = '';
});

// --- DOM refs ---
const chatPanel = document.getElementById('chatPanel');
const chatToggle = document.getElementById('chatToggle');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const stopBtn = document.getElementById('stopBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsDrawer = document.getElementById('settingsDrawer');
const modelSelect = document.getElementById('modelSelect');
const performerModelSelect = document.getElementById('performerModelSelect');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeySaveBtn = document.getElementById('apiKeySaveBtn');
const apiKeyMask = document.getElementById('apiKeyMask');
const apiKeyClearBtn = document.getElementById('apiKeyClearBtn');
const apiKeyField = document.getElementById('apiKeyField');
const setStatusBar = document.getElementById('setStatusBar');
const setStatusLabel = document.getElementById('setStatusLabel');
const setStatusSection = document.getElementById('setStatusSection');
const setStopBtn = document.getElementById('setStopBtn');
const errorTriggerToggle = document.getElementById('errorTriggerToggle');

// --- State ---
let ws;
let statusEl = null;
const toolCallEls = new Map();

// --- Error trigger state ---
let errorDebounceTimer = null;
let pendingErrors = [];
let errorTriggerEnabled = false;
let lastFixerErrors = new Set();
let fixerRunning = false;

// --- Cycle tracking ---
let cycleOrigin = null;
let cycleCps = 0.5; // default 120 bpm → 0.5 cps (4 beats per cycle)
let cycleInterval = null;
let lastCycle = -1;
let totalBars = 0;
let barMarkers = []; // [{ bar: absoluteBar, song: string, note: string }]

function getAudioCtx() {
  return typeof getAudioContext === 'function' ? getAudioContext() : null;
}

function getCurrentCycle() {
  const ctx = getAudioCtx();
  if (!ctx || cycleOrigin === null) return { cycle: -1, cps: cycleCps, elapsed: 0 };
  const elapsed = ctx.currentTime - cycleOrigin;
  return { cycle: Math.floor(elapsed * cycleCps), cps: cycleCps, elapsed };
}

function buildBarMarkers(plan) {
  const markers = [];
  let offset = 0;
  for (const song of plan.songs) {
    for (const section of song.sections) {
      markers.push({ bar: offset + section.bar, song: song.name, note: section.note });
    }
    offset += song.bars;
  }
  totalBars = offset;
  return markers.sort((a, b) => a.bar - b.bar);
}

function getCurrentSection(cycle) {
  let current = null;
  for (const m of barMarkers) {
    if (m.bar <= cycle) current = m;
    else break;
  }
  return current;
}

function updateSetStatus(cycle) {
  setStatusLabel.textContent = `Set active — bar ${cycle}/${totalBars}`;
  const section = getCurrentSection(cycle);
  setStatusSection.textContent = section ? `${section.song}: ${section.note}` : '';
}

function checkBarMarkers(cycle) {
  for (const m of barMarkers) {
    if (m.bar > lastCycle && m.bar <= cycle) {
      console.log(`[set] bar ${m.bar} — ${m.song}: ${m.note}`);
    }
  }
  lastCycle = cycle;
}

// --- Error trigger debounce ---
function maybeQueueError(text) {
  if (!errorTriggerEnabled) return;
  if (fixerRunning) return;
  if (text.startsWith('[fixer]') || text.startsWith('[strudel]')) return;
  pendingErrors.push(text);
  if (errorDebounceTimer) clearTimeout(errorDebounceTimer);
  errorDebounceTimer = setTimeout(flushErrors, 2000);
}

function flushErrors() {
  if (pendingErrors.length === 0) return;
  const errorSet = new Set(pendingErrors);
  const signature = [...errorSet].sort().join('|||');
  const lastSignature = [...lastFixerErrors].sort().join('|||');
  if (signature === lastSignature) {
    console.log('[fixer] same errors as last run, skipping');
    pendingErrors = [];
    return;
  }
  lastFixerErrors = errorSet;
  const apiKey = getApiKey();
  if (!apiKey) {
    pendingErrors = [];
    return;
  }
  wsSend('console_errors', { errors: [...errorSet], api_key: apiKey });
  fixerRunning = true;
  console.log(`[fixer] triggered with ${errorSet.size} error(s)`);
  pendingErrors = [];
}

function getApiKey() {
  return localStorage.getItem('strudelgpt_api_key') || '';
}

function saveApiKey(key) {
  if (key) {
    localStorage.setItem('strudelgpt_api_key', key);
  } else {
    localStorage.removeItem('strudelgpt_api_key');
  }
  refreshApiKeyUI();
}

function refreshApiKeyUI() {
  const key = getApiKey();
  sendBtn.disabled = !key;
  apiKeyMask.textContent = key ? `sk-···${key.slice(-4)}` : '';
  apiKeyField.classList.toggle('has-key', !!key);
  chatInput.placeholder = key ? 'Describe a pattern...' : 'Set API key in settings to enable';
  chatInput.disabled = !key;
}

// --- Settings drawer ---
settingsBtn.addEventListener('click', () => {
  const open = settingsDrawer.hasAttribute('data-open');
  if (open) {
    settingsDrawer.removeAttribute('data-open');
    settingsDrawer.style.display = 'none';
    settingsBtn.classList.remove('active');
  } else {
    settingsDrawer.setAttribute('data-open', '');
    settingsDrawer.style.display = 'flex';
    settingsBtn.classList.add('active');
  }
});

modelSelect.addEventListener('change', () => {
  wsSend('set_model', { model: modelSelect.value });
  console.log(`[model] switched to ${modelSelect.value}`);
});

performerModelSelect.addEventListener('change', () => {
  wsSend('set_performer_model', { model: performerModelSelect.value });
  console.log(`[performer model] switched to ${performerModelSelect.value}`);
});

apiKeySaveBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;
  saveApiKey(key);
  apiKeyInput.value = '';
  console.log(`[api-key] saved (···${key.slice(-4)})`);
});

apiKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') apiKeySaveBtn.click();
});

apiKeyClearBtn.addEventListener('click', () => {
  saveApiKey('');
  apiKeyInput.focus();
  console.log('[api-key] removed');
});

errorTriggerToggle.addEventListener('change', () => {
  errorTriggerEnabled = errorTriggerToggle.checked;
  wsSend('set_error_trigger', { enabled: errorTriggerEnabled });
  console.log(`[fixer] error trigger ${errorTriggerEnabled ? 'enabled' : 'disabled'}`);
  if (!errorTriggerEnabled) {
    pendingErrors = [];
    lastFixerErrors = new Set();
    fixerRunning = false;
    if (errorDebounceTimer) clearTimeout(errorDebounceTimer);
  }
});

// --- Chat UI helpers ---
function setAgentBusy(busy) {
  sendBtn.classList.toggle('hidden', busy);
  stopBtn.classList.toggle('hidden', !busy);
}

function addMessage(text, role) {
  removeStatus();
  const msg = document.createElement('div');
  msg.className = `chat-message ${role}`;
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showStatus(label) {
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'chat-message status';
    chatMessages.appendChild(statusEl);
  }
  statusEl.innerHTML = `${label} <span class="dot-pulse"><span></span><span></span><span></span></span>`;
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeStatus() {
  if (statusEl) {
    statusEl.remove();
    statusEl = null;
  }
}

function showToolCall(toolName, input) {
  removeStatus();
  const el = document.createElement('div');
  el.className = 'chat-message tool-call';
  const inputStr = typeof input === 'object' ? JSON.stringify(input) : String(input);
  const truncated = inputStr.length > 80 ? inputStr.slice(0, 80) + '...' : inputStr;
  el.innerHTML = `<span class="tool-name">${toolName}</span> <span class="tool-status">running...</span>`;
  if (truncated && truncated !== '{}') {
    el.innerHTML += `<br>${truncated}`;
  }
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  toolCallEls.set(toolName, el);
}

function resolveToolCall(toolName) {
  const el = toolCallEls.get(toolName);
  if (el) {
    const statusSpan = el.querySelector('.tool-status');
    if (statusSpan) statusSpan.textContent = 'done';
    toolCallEls.delete(toolName);
  }
  showStatus('Thinking');
}

// --- WebSocket ---
function wsSend(event, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'event', event, data }));
  }
}

function connectWS() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${location.host}/ws`);
  ws.onopen = () => origLog('[ws] connected');
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.type === 'command') handleCommand(msg);
    else if (msg.type === 'event') handleEvent(msg);
  };
  ws.onclose = () => {
    origLog('[ws] disconnected, reconnecting in 2s...');
    setTimeout(connectWS, 2000);
  };
}

// --- Strudel editor helpers ---
function getStrudelCode() {
  const editor = document.getElementById('strudelEditor')?.editor;
  return editor ? editor.code : '';
}

async function setStrudelCode(code) {
  const editor = document.getElementById('strudelEditor')?.editor;
  if (!editor) return false;
  editor.setCode(code);
  try {
    await editor.evaluate();
  } catch (err) {
    console.error('[strudel] evaluate failed:', err);
    return false;
  }
  return true;
}

// --- Command handlers (backend → frontend) ---
async function handleCommand(msg) {
  let responseData = {};
  try {
    switch (msg.action) {
      case 'read_code':
        responseData = { code: getStrudelCode() };
        break;
      case 'rewrite_code':
        if (msg.params?.code != null) {
          consoleBuffer.splice(0);
          const ok = await setStrudelCode(msg.params.code);
          const logs = consoleBuffer.splice(0);
          responseData = { ok, logs };
        } else {
          responseData = { ok: false, error: 'Missing code param' };
        }
        break;
      case 'edit_code': {
        const current = getStrudelCode();
        const { old_string, new_string } = msg.params || {};
        if (old_string == null || new_string == null) {
          responseData = { ok: false, error: 'Missing old_string or new_string param' };
        } else {
          const count = current.split(old_string).length - 1;
          if (count === 0) {
            responseData = { ok: false, error: 'old_string not found in current code', current_code: current };
          } else if (count > 1) {
            responseData = { ok: false, error: `old_string found ${count} times, must be unique`, current_code: current };
          } else {
            const newCode = current.replace(old_string, new_string);
            consoleBuffer.splice(0);
            const ok = await setStrudelCode(newCode);
            const logs = consoleBuffer.splice(0);
            responseData = { ok, logs };
          }
        }
        break;
      }
      case 'read_console':
        responseData = { logs: consoleBuffer.splice(0) };
        break;
      case 'read_cycle':
        responseData = getCurrentCycle();
        break;
      default:
        responseData = { error: `Unknown action: ${msg.action}` };
    }
  } catch (err) {
    responseData = { ok: false, error: String(err) };
  }
  ws.send(JSON.stringify({ id: msg.id, type: 'response', data: responseData }));
}

// --- Event handlers (backend → frontend) ---
function handleEvent(msg) {
  if (msg.event === 'agent_thinking') {
    showStatus('Thinking');
  } else if (msg.event === 'agent_tool_call') {
    const inputStr = typeof msg.data.input === 'object' ? JSON.stringify(msg.data.input) : String(msg.data.input);
    const truncated = inputStr.length > 120 ? inputStr.slice(0, 120) + '...' : inputStr;
    console.log(`[tool] ${msg.data.tool}(${truncated})`);
    showToolCall(msg.data.tool, msg.data.input);
  } else if (msg.event === 'agent_tool_result') {
    console.log(`[tool] ${msg.data.tool} done`);
    resolveToolCall(msg.data.tool);
  } else if (msg.event === 'start_set') {
    const ctx = getAudioCtx();
    if (ctx) {
      cycleCps = msg.data.cps || 0.5;
      cycleOrigin = ctx.currentTime;
      lastCycle = 0;
      barMarkers = msg.data.plan ? buildBarMarkers(msg.data.plan) : [];
      if (cycleInterval) clearInterval(cycleInterval);
      cycleInterval = setInterval(() => {
        const info = getCurrentCycle();
        if (info.cycle >= 0) checkBarMarkers(info.cycle);
        updateSetStatus(info.cycle);
        wsSend('cycle_update', { ...info, api_key: getApiKey() });
      }, 1000);
      setStatusBar.classList.remove('hidden');
      updateSetStatus(0);
      console.log(`[set] started — tracking cycles at ${msg.data.bpm || Math.round(cycleCps * 240)} bpm`);
    } else {
      console.error('[set] cannot start — no AudioContext available');
    }
  } else if (msg.event === 'stop_set') {
    if (cycleInterval) clearInterval(cycleInterval);
    cycleInterval = null;
    cycleOrigin = null;
    lastCycle = -1;
    barMarkers = [];
    setStatusBar.classList.add('hidden');
    console.log('[set] stopped');
  } else if (msg.event === 'plan_set') {
    const p = msg.data;
    console.log(`[set] ${p.title} — ${p.genre} @ ${p.bpm} bpm`);
    if (p.instructions) console.log(`[set] ${p.instructions}`);
    for (const song of p.songs) {
      console.log(`[set] ${song.name} (${song.bars} bars) — ${song.description}`);
      for (const s of song.sections) {
        console.log(`[set]   bar ${s.bar}: ${s.note}`);
      }
    }
  } else if (msg.event === 'performer_tool_call') {
    const inputStr = typeof msg.data.input === 'object' ? JSON.stringify(msg.data.input) : String(msg.data.input);
    const truncated = inputStr.length > 120 ? inputStr.slice(0, 120) + '...' : inputStr;
    console.log(`[performer] ${msg.data.tool}(${truncated})`);
  } else if (msg.event === 'performer_tool_result') {
    console.log(`[performer] ${msg.data.tool} done`);
  } else if (msg.event === 'fixer_tool_call') {
    const inputStr = typeof msg.data.input === 'object' ? JSON.stringify(msg.data.input) : String(msg.data.input);
    const truncated = inputStr.length > 120 ? inputStr.slice(0, 120) + '...' : inputStr;
    console.log(`[fixer] ${msg.data.tool}(${truncated})`);
  } else if (msg.event === 'fixer_tool_result') {
    console.log(`[fixer] ${msg.data.tool} done`);
  } else if (msg.event === 'fixer_done') {
    fixerRunning = false;
  } else if (msg.event === 'chat_response') {
    removeStatus();
    toolCallEls.clear();
    addMessage(msg.data.text, 'assistant');
    setAgentBusy(false);
  }
}

// --- Send chat message ---
function handleSend() {
  const apiKey = getApiKey();
  if (!apiKey) return;
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  chatInput.value = '';
  wsSend('chat_message', { text, api_key: apiKey });
  setAgentBusy(true);
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend();
});

// --- Stop button ---
stopBtn.addEventListener('click', () => {
  wsSend('stop_agent');
  removeStatus();
  toolCallEls.clear();
  setAgentBusy(false);
});

// --- Set stop button ---
setStopBtn.addEventListener('click', () => {
  wsSend('stop_set');
  if (cycleInterval) clearInterval(cycleInterval);
  cycleInterval = null;
  cycleOrigin = null;
  lastCycle = -1;
  barMarkers = [];
  setStatusBar.classList.add('hidden');
  console.log('[set] interrupted by user');
});

// --- Chat panel toggle ---
chatClose.addEventListener('click', () => {
  chatPanel.classList.add('hidden');
  setTimeout(() => chatToggle.classList.add('visible'), 200);
});

chatToggle.addEventListener('click', () => {
  chatPanel.classList.remove('no-transition');
  chatToggle.classList.remove('visible');
  chatPanel.classList.remove('hidden');
});

// --- Init ---
refreshApiKeyUI();
connectWS();
