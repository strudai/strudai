import { useState, useEffect, useMemo } from "react";
import * as store from "../store";
import { listModels, type ModelOption } from "../agent/api";
import { TOOL_META, type ToolMeta } from "../agent/tools";

interface SettingsDrawerProps {
  open: boolean;
  onApiKeyChange: (key: string | null) => void;
  usage: {
    cachedInputTokens: number;
    uncachedInputTokens: number;
    outputTokens: number;
    contextTokens: number;
  };
}

/** Format a token count compactly: 1234 → "1.2k", 2_500_000 → "2.5M". */
function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function SettingsDrawer({
  open,
  onApiKeyChange,
  usage,
}: SettingsDrawerProps) {
  const [apiKey, setApiKey] = useState(store.getApiKey() ?? "");
  const [saved, setSaved] = useState(!!store.getApiKey());
  const [model, setModel] = useState(store.getModel());
  const [models, setModels] = useState<ModelOption[]>([]);
  const [modelsState, setModelsState] = useState<"idle" | "loading" | "loaded" | "failed">(
    store.getApiKey() ? "loading" : "idle"
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "ok" | "fail">("idle");
  const [saveError, setSaveError] = useState<string>("");
  const [toolToggles, setToolToggles] = useState<Record<string, boolean>>(store.getToolToggles());
  const [autoFix, setAutoFixState] = useState<boolean>(store.getAutoFix());

  function handleToggleAutoFix(enabled: boolean) {
    setAutoFixState(enabled);
    store.setAutoFix(enabled);
  }
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [usageExpanded, setUsageExpanded] = useState(false);
  const [theme, setTheme] = useState<store.Theme>(store.getTheme());

  function handleThemeChange(next: store.Theme) {
    setTheme(next);
    store.setTheme(next);
    document.documentElement.classList.toggle("theme-retro", next === "retro");
  }

  function handleToggleTool(name: string, enabled: boolean) {
    store.setToolToggle(name, enabled);
    setToolToggles((prev) => ({ ...prev, [name]: enabled }));
  }

  function handleToggleCategory(tools: ToolMeta[], enable: boolean) {
    setToolToggles((prev) => {
      const next = { ...prev };
      for (const t of tools) {
        next[t.name] = enable;
        store.setToolToggle(t.name, enable);
      }
      return next;
    });
  }

  const toolsByCategory = useMemo(() => {
    const groups: Record<string, ToolMeta[]> = {};
    for (const t of TOOL_META) {
      (groups[t.category] ??= []).push(t);
    }
    return groups;
  }, []);

  const enabledCount = TOOL_META.filter((t) => toolToggles[t.name] !== false).length;

  useEffect(() => {
    store.setModel(model);
  }, [model]);

  // Fetch available models when API key is present
  useEffect(() => {
    if (!saved) {
      setModels([]);
      setModelsState("idle");
      return;
    }
    const key = store.getApiKey();
    if (!key) return;
    let cancelled = false;
    setModelsState("loading");
    listModels(key)
      .then((list) => {
        if (cancelled) return;
        setModels(list);
        setModelsState("loaded");
        if (list.length > 0 && !list.some((m) => m.id === model)) {
          setModel(list[0].id);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setModels([]);
        setModelsState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [saved]);

  async function handleSave() {
    const key = apiKey.trim();
    if (!key) return;
    setSaveState("saving");
    setSaveError("");
    store.saveApiKey(key);
    setSaved(true);
    onApiKeyChange(key);
    try {
      await listModels(key);
      setSaveState("ok");
    } catch (err) {
      setSaveState("fail");
      setSaveError(err instanceof Error ? err.message : "Request failed");
    }
    setTimeout(() => setSaveState("idle"), 2500);
  }

  function handleClear() {
    store.clearApiKey();
    setApiKey("");
    setSaved(false);
    setSaveState("idle");
    setSaveError("");
    onApiKeyChange(null);
  }

  function maskKey(key: string): string {
    if (key.length <= 8) return "****";
    return key.slice(0, 7) + "..." + key.slice(-4);
  }

  return (
    <div className="settings-drawer" data-open={open ? "" : undefined}>
      <div className="settings-drawer-inner">
        <label>
          <span>Theme</span>
          <select
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value as store.Theme)}
          >
            <option value="retro">Retro</option>
            <option value="classic">Classic</option>
          </select>
        </label>

        <label>
          <span>Model</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={models.length === 0}
          >
            {models.length === 0 ? (
              <option value={model}>
                {modelsState === "loading" ? "Loading..."
                  : modelsState === "failed" ? "Invalid key"
                  : "Set API key first"}
              </option>
            ) : (
              models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))
            )}
          </select>
        </label>

        <label>
          <span>API key</span>
          <span className={`api-key-field${saved ? " has-key" : ""}`}>
            <span className="api-key-mask">
              {saved ? maskKey(apiKey) : ""}
            </span>
            <button
              onClick={handleClear}
              className="api-key-clear"
            >
              &times;
            </button>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="sk-ant-..."
              className="api-key-input"
            />
            <button
              onClick={handleSave}
              className={`api-key-save ${saveState}`}
              disabled={saveState === "saving"}
              title={saveState === "fail" ? saveError : undefined}
            >
              {saveState === "saving" ? "..."
                : saveState === "ok" ? "Saved ✓"
                : saveState === "fail" ? "Invalid"
                : "Save"}
            </button>
          </span>
        </label>

        <label title="When the Strudel REPL throws an error, automatically ask Hans to fix it.">
          <span>Auto-fix</span>
          <span className="setting-control-right">
            <input
              type="checkbox"
              checked={autoFix}
              onChange={(e) => handleToggleAutoFix(e.target.checked)}
            />
          </span>
        </label>

        <div className="tools-section">
          <button
            type="button"
            className="tools-summary"
            onClick={() => setToolsExpanded((v) => !v)}
          >
            <span>Tools</span>
            <span className="tools-summary-meta">
              {enabledCount}/{TOOL_META.length} enabled
              <span className="tools-chevron">▸</span>
            </span>
          </button>
          <div className="tools-groups-wrapper" data-open={toolsExpanded ? "" : undefined}>
            <div className="tools-groups">
              {Object.entries(toolsByCategory).map(([category, tools]) => {
                const allOn = tools.every((t) => toolToggles[t.name] !== false);
                return (
                  <div key={category} className="tool-group">
                    <label className="tool-group-header">
                      <input
                        type="checkbox"
                        checked={allOn}
                        onChange={(e) => handleToggleCategory(tools, e.target.checked)}
                      />
                      <span>{category}</span>
                    </label>
                    <div className="tool-group-items">
                      {tools.map((t) => {
                        const enabled = toolToggles[t.name] !== false;
                        return (
                          <label key={t.name} className="tool-toggle" title={t.description}>
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => handleToggleTool(t.name, e.target.checked)}
                            />
                            <span>{t.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="tools-section">
          <button
            type="button"
            className="tools-summary"
            onClick={() => setUsageExpanded((v) => !v)}
          >
            <span>Usage</span>
            <span className="tools-summary-meta">
              {formatTokens(usage.uncachedInputTokens + usage.cachedInputTokens)} in
              {" · "}
              {formatTokens(usage.outputTokens)} out
              <span className="tools-chevron">▸</span>
            </span>
          </button>
          <div className="tools-groups-wrapper" data-open={usageExpanded ? "" : undefined}>
            <div className="tools-groups">
              <div className="usage-row">
                <span>In (uncached)</span>
                <span>{formatTokens(usage.uncachedInputTokens)}</span>
              </div>
              <div className="usage-row">
                <span>In (cached)</span>
                <span>{formatTokens(usage.cachedInputTokens)}</span>
              </div>
              <div className="usage-row">
                <span>Out</span>
                <span>{formatTokens(usage.outputTokens)}</span>
              </div>
              <div className="usage-row">
                <span>Context window</span>
                <span>{formatTokens(usage.contextTokens)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
