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

/**
 * Pre-planned section code store for live set mode.
 *
 * The planning worker generates code N sections ahead so that when a bar
 * fires, the code is already ready to animate into the editor with no
 * model latency. Keyed by absoluteBar from set-state.
 */

export type PreplanToolName = "strudel_rewrite_code" | "strudel_edit_code";

export interface PreparedSection {
  code: string;
  toolName: PreplanToolName;
  status: "generating" | "ready" | "stale";
}

const store = new Map<number, PreparedSection>();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((cb) => cb());
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getPrepared(bar: number): PreparedSection | undefined {
  return store.get(bar);
}

export function setGenerating(bar: number): void {
  store.set(bar, { code: "", toolName: "strudel_rewrite_code", status: "generating" });
  emit();
}

export function setReady(bar: number, code: string, toolName: PreplanToolName): void {
  store.set(bar, { code, toolName, status: "ready" });
  emit();
}

export function markStale(bar: number): void {
  const entry = store.get(bar);
  if (entry) store.set(bar, { ...entry, status: "stale" });
  emit();
}

/** Mark this bar and all higher bars as stale (used when a section note is edited). */
export function markStaleFrom(bar: number): void {
  for (const [key, entry] of store.entries()) {
    if (key >= bar) store.set(key, { ...entry, status: "stale" });
  }
  emit();
}

export function clearAll(): void {
  store.clear();
  emit();
}

export function isReady(bar: number): boolean {
  return store.get(bar)?.status === "ready";
}

export function getCode(bar: number): string | null {
  const entry = store.get(bar);
  return entry?.status === "ready" ? entry.code : null;
}
