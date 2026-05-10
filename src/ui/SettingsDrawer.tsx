import { useState, useEffect } from "react";
import * as store from "../store";

interface SettingsDrawerProps {
  open: boolean;
  onApiKeyChange: (key: string | null) => void;
  usage: { inputTokens: number; outputTokens: number };
}

export function SettingsDrawer({
  open,
  onApiKeyChange,
  usage,
}: SettingsDrawerProps) {
  const [apiKey, setApiKey] = useState(store.getApiKey() ?? "");
  const [saved, setSaved] = useState(!!store.getApiKey());
  const [model, setModel] = useState(store.getModel());

  useEffect(() => {
    store.setModel(model);
  }, [model]);

  function handleSave() {
    if (!apiKey.trim()) return;
    store.saveApiKey(apiKey.trim());
    setSaved(true);
    onApiKeyChange(apiKey.trim());
  }

  function handleClear() {
    store.clearApiKey();
    setApiKey("");
    setSaved(false);
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
          <span>Model</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="claude-haiku-4-5-20251001">Haiku</option>
            <option value="claude-sonnet-4-6">Sonnet</option>
            <option value="claude-opus-4-6">Opus</option>
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
              className="api-key-save"
            >
              Save
            </button>
          </span>
        </label>

        <label>
          <span>Usage</span>
          <span className="usage-value">
            {(usage.inputTokens + usage.outputTokens).toLocaleString()} tokens
          </span>
        </label>
      </div>
    </div>
  );
}
