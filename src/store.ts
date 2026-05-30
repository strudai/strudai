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

const API_KEY_KEY = "strudelgpt_api_key";
const MODEL_KEY = "strudelgpt_model";
const PERFORMER_MODEL_KEY = "strudelgpt_performer_model";
const TOOLS_KEY = "strudelgpt_tools";
const THEME_KEY = "strudelgpt_theme";
const AUTOFIX_KEY = "strudelgpt_autofix";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_PERFORMER_MODEL = "";

export type Theme = "classic" | "retro";

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

export function getPerformerModel(): string {
  return localStorage.getItem(PERFORMER_MODEL_KEY) ?? DEFAULT_PERFORMER_MODEL;
}

export function setPerformerModel(model: string): void {
  localStorage.setItem(PERFORMER_MODEL_KEY, model);
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

export function getTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === "classic" ? "classic" : "retro";
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function getAutoFix(): boolean {
  return localStorage.getItem(AUTOFIX_KEY) === "true";
}

export function setAutoFix(enabled: boolean): void {
  localStorage.setItem(AUTOFIX_KEY, String(enabled));
}

