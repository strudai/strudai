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
console.error = (...args) => { const f = filterStyledArgs(args); if (f.length) appendConsoleLine('error', f.join(' ')); origError.apply(console, args); };
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

// --- Chat UI ---
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const stopBtn = document.getElementById('stopBtn');

function setAgentBusy(busy) {
  sendBtn.classList.toggle('hidden', busy);
  stopBtn.classList.toggle('hidden', !busy);
}

let statusEl = null;
const toolCallEls = new Map();

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
let ws;
function connectWS() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${location.host}/ws`);

  ws.onopen = () => origLog('[ws] connected');

  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.type === 'command') {
      handleCommand(msg);
    } else if (msg.type === 'event') {
      handleEvent(msg);
    }
  };

  ws.onclose = () => {
    origLog('[ws] disconnected, reconnecting in 2s...');
    setTimeout(connectWS, 2000);
  };
}

// --- Strudel editor helpers ---
function getStrudelEditor() {
  return document.getElementById('strudelEditor')?.editor;
}

function getStrudelCode() {
  const editor = getStrudelEditor();
  return editor ? editor.code : '';
}

async function setStrudelCode(code) {
  const editor = getStrudelEditor();
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

      case 'update_code':
        if (msg.params?.code != null) {
          consoleBuffer.splice(0);
          const ok = await setStrudelCode(msg.params.code);
          const logs = consoleBuffer.splice(0);
          responseData = { ok, logs };
        } else {
          responseData = { ok: false, error: 'Missing code param' };
        }
        break;

      case 'read_console':
        responseData = { logs: consoleBuffer.splice(0) };
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
    showToolCall(msg.data.tool, msg.data.input);
  } else if (msg.event === 'agent_tool_result') {
    resolveToolCall(msg.data.tool);
  } else if (msg.event === 'chat_response') {
    removeStatus();
    toolCallEls.clear();
    addMessage(msg.data.text, 'assistant');
    setAgentBusy(false);
  }
}

// --- Send chat message ---
function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  chatInput.value = '';
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'event', event: 'chat_message', data: { text } }));
    setAgentBusy(true);
  }
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSend();
});

// --- Model selector ---
const modelSelect = document.getElementById('modelSelect');
modelSelect.addEventListener('change', () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'event', event: 'set_model', data: { model: modelSelect.value } }));
  }
});

// --- Stop button ---
stopBtn.addEventListener('click', () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'event', event: 'stop_agent' }));
  }
  removeStatus();
  toolCallEls.clear();
  setAgentBusy(false);
});

// --- Chat panel toggle ---
const chatPanel = document.getElementById('chatPanel');
const chatToggle = document.getElementById('chatToggle');
const chatClose = document.getElementById('chatClose');

chatClose.addEventListener('click', () => {
  chatPanel.classList.add('hidden');
  setTimeout(() => chatToggle.classList.add('visible'), 200);
});

chatToggle.addEventListener('click', () => {
  chatPanel.classList.remove('no-transition');
  chatToggle.classList.remove('visible');
  chatPanel.classList.remove('hidden');
});

connectWS();
