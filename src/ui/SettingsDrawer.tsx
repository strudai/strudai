// Copyright (C) 2026 Douwe van der Heijden
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { useState, useEffect, useMemo } from "react";
import * as store from "../store";
import { listModels, detectProvider, type ModelOption } from "../agent/api";
import { TOOL_META, type ToolMeta } from "../agent/tools";

interface SettingsDrawerProps {
  open: boolean;
  onApiKeyChange: (key: string | null) => void;
  usage: {
    inputTokens: number;
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
  const [performerModel, setPerformerModel] = useState(store.getPerformerModel());
  const [modelSearch, setModelSearch] = useState("");
  const [priceTier, setPriceTier] = useState<"all" | "free" | "budget" | "premium">("all");
  const [performerModelSearch, setPerformerModelSearch] = useState("");
  const [performerPriceTier, setPerformerPriceTier] = useState<"all" | "free" | "budget" | "premium">("all");
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
  const [performerModelExpanded, setPerformerModelExpanded] = useState(false);
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

  const provider = saved && apiKey ? detectProvider(apiKey) : null;

  const filteredPerformerModels = useMemo(() => {
    if (provider !== "openrouter") return models;
    let result = models;
    if (performerModelSearch.trim()) {
      const q = performerModelSearch.toLowerCase();
      result = result.filter(
        (m) => m.id.toLowerCase().includes(q) || m.displayName.toLowerCase().includes(q),
      );
    }
    if (performerPriceTier !== "all") {
      result = result.filter((m) => {
        const p = m.inputPricePerM;
        if (p === undefined) return true;
        if (performerPriceTier === "free") return p === 0;
        if (performerPriceTier === "budget") return p > 0 && p < 1;
        if (performerPriceTier === "premium") return p >= 1;
        return true;
      });
    }
    return result;
  }, [models, performerModelSearch, performerPriceTier, provider]);

  const filteredModels = useMemo(() => {
    if (provider !== "openrouter") return models;
    let result = models;
    if (modelSearch.trim()) {
      const q = modelSearch.toLowerCase();
      result = result.filter(
        (m) => m.id.toLowerCase().includes(q) || m.displayName.toLowerCase().includes(q),
      );
    }
    if (priceTier !== "all") {
      result = result.filter((m) => {
        const p = m.inputPricePerM;
        if (p === undefined) return true; // unknown pricing — always show
        if (priceTier === "free") return p === 0;
        if (priceTier === "budget") return p > 0 && p < 1;
        if (priceTier === "premium") return p >= 1;
        return true;
      });
    }
    return result;
  }, [models, modelSearch, priceTier, provider]);

  useEffect(() => {
    store.setModel(model);
  }, [model]);

  useEffect(() => {
    store.setPerformerModel(performerModel);
  }, [performerModel]);

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
    setModelSearch("");
    setPriceTier("all");
    onApiKeyChange(null);
  }

  function formatInputPrice(pricePerM: number | undefined): string {
    if (pricePerM === undefined) return "";
    if (pricePerM === 0) return "free";
    if (pricePerM < 0.10) return `$${pricePerM.toFixed(3)}/M`;
    if (pricePerM < 10) return `$${pricePerM.toFixed(2)}/M`;
    return `$${Math.round(pricePerM)}/M`;
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
          <span className="model-field">
            {provider === "openrouter" && modelsState === "loaded" && (
              <>
                <input
                  type="text"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder="Filter models..."
                  className="model-search-input"
                />
                <div className="model-price-filter">
                  {(["all", "free", "budget", "premium"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      className={`price-tier-btn${priceTier === tier ? " active" : ""}`}
                      onClick={() => setPriceTier(tier)}
                    >
                      {tier === "all" ? "All" : tier === "free" ? "Free" : tier === "budget" ? "<$1/M" : ">$1/M"}
                    </button>
                  ))}
                </div>
              </>
            )}
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={filteredModels.length === 0}
            >
              {filteredModels.length === 0 ? (
                <option value={model}>
                  {modelsState === "loading"
                    ? "Loading..."
                    : modelsState === "failed"
                      ? "Invalid key"
                      : modelSearch || priceTier !== "all"
                        ? "No matches"
                        : "Set API key first"}
                </option>
              ) : (
                filteredModels.map((m) => {
                  const price = formatInputPrice(m.inputPricePerM);
                  return (
                    <option key={m.id} value={m.id}>
                      {price ? `${m.displayName}  ·  ${price}` : m.displayName}
                    </option>
                  );
                })
              )}
            </select>
          </span>
        </label>

        <div className="tools-section">
          {/* div instead of button so Y/N buttons can live inside without nesting <button> in <button> */}
          <div
            className="tools-summary"
            onClick={() => setPerformerModelExpanded((v) => !v)}
          >
            <span>Performer model</span>
            <span className="tools-summary-meta">
              <span style={{ fontStyle: "italic", opacity: 0.6 }}>same as main</span>
              <input
                type="checkbox"
                checked={performerModel === ""}
                title={performerModel === "" ? "Same as main model" : "Using a specific model"}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPerformerModel("");
                  } else {
                    setPerformerModel(model);
                    setPerformerModelExpanded(true);
                  }
                }}
              />
              <span className="tools-chevron">▸</span>
            </span>
          </div>
          <div className="tools-groups-wrapper" data-open={performerModelExpanded ? "" : undefined}>
            <div className="tools-groups">
              {provider === "openrouter" && modelsState === "loaded" && (
                <>
                  <input
                    type="text"
                    value={performerModelSearch}
                    onChange={(e) => setPerformerModelSearch(e.target.value)}
                    placeholder="Filter models..."
                    className="model-search-input"
                  />
                  <div className="model-price-filter">
                    {(["all", "free", "budget", "premium"] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        className={`price-tier-btn${performerPriceTier === tier ? " active" : ""}`}
                        onClick={() => setPerformerPriceTier(tier)}
                      >
                        {tier === "all" ? "All" : tier === "free" ? "Free" : tier === "budget" ? "<$1/M" : ">$1/M"}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <select
                value={performerModel}
                onChange={(e) => setPerformerModel(e.target.value)}
              >
                <option value="">Same as model</option>
                {filteredPerformerModels.map((m) => {
                  const price = formatInputPrice(m.inputPricePerM);
                  return (
                    <option key={m.id} value={m.id}>
                      {price ? `${m.displayName}  ·  ${price}` : m.displayName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

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
              placeholder="sk-ant-... or sk-or-..."
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

        {provider && (
          <span className="api-key-provider" data-provider={provider}>
            {provider === "anthropic" ? "Anthropic" : "OpenRouter"}
          </span>
        )}

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
              {formatTokens(usage.inputTokens)} in
              {" · "}
              {formatTokens(usage.outputTokens)} out
              <span className="tools-chevron">▸</span>
            </span>
          </button>
          <div className="tools-groups-wrapper" data-open={usageExpanded ? "" : undefined}>
            <div className="tools-groups">
              <div className="usage-row">
                <span>In</span>
                <span>{formatTokens(usage.inputTokens)}</span>
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
