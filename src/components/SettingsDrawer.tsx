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

  if (!open) return null;

  return (
    <div className="border-b border-[var(--surface-border)] px-3 py-3 text-xs space-y-2">
      <label className="flex items-center justify-between">
        <span className="text-[var(--text-secondary)]">Model</span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2 py-1 text-[var(--text-primary)] text-xs"
        >
          <option value="claude-haiku-4-5-20251001">Haiku</option>
          <option value="claude-sonnet-4-6">Sonnet</option>
          <option value="claude-opus-4-6">Opus</option>
        </select>
      </label>

      <label className="flex items-center justify-between gap-2">
        <span className="text-[var(--text-secondary)] shrink-0">API key</span>
        {saved ? (
          <span className="flex items-center gap-1">
            <span className="text-[var(--text-muted)] font-mono">
              {maskKey(apiKey)}
            </span>
            <button
              onClick={handleClear}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              &times;
            </button>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="sk-ant-..."
              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2 py-1 text-[var(--text-primary)] text-xs w-32 focus:border-[var(--accent)] outline-none"
            />
            <button
              onClick={handleSave}
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs"
            >
              Save
            </button>
          </span>
        )}
      </label>

      <div className="flex items-center justify-between">
        <span className="text-[var(--text-secondary)]">Usage</span>
        <span className="text-[var(--text-muted)]">
          {(usage.inputTokens + usage.outputTokens).toLocaleString()} tokens
        </span>
      </div>
    </div>
  );
}
