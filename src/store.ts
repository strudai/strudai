const API_KEY_KEY = "strudelgpt_api_key";
const MODEL_KEY = "strudelgpt_model";
const TOOLS_KEY = "strudelgpt_tools";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_KEY);
}

export function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY_KEY, key);
}

export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_KEY);
}

export function getModel(): string {
  return localStorage.getItem(MODEL_KEY) ?? DEFAULT_MODEL;
}

export function setModel(model: string): void {
  localStorage.setItem(MODEL_KEY, model);
}

export function getToolToggles(): Record<string, boolean> {
  const raw = localStorage.getItem(TOOLS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function setToolToggle(name: string, enabled: boolean): void {
  const current = getToolToggles();
  current[name] = enabled;
  localStorage.setItem(TOOLS_KEY, JSON.stringify(current));
}
