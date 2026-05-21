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
 * Shared console buffer.
 *
 * Console.tsx records every console line here; the `strudel_read_console`
 * tool, the fix-attempt cap, and the auto-fix watcher all read from it.
 */

export type ConsoleLevel = "log" | "warn" | "error";

export interface ConsoleEntry {
  level: ConsoleLevel;
  text: string;
  timestamp: number;
}

const MAX_BUFFER = 200;
const buffer: ConsoleEntry[] = [];
const listeners = new Set<() => void>();

export function recordConsole(level: ConsoleLevel, text: string): void {
  buffer.push({ level, text, timestamp: Date.now() });
  if (buffer.length > MAX_BUFFER) buffer.shift();
  listeners.forEach((cb) => cb());
}

/** Last `count` console entries, oldest first. */
export function getRecentConsole(count: number): ConsoleEntry[] {
  return buffer.slice(-count);
}

/** Error-level entries since a timestamp (used by the auto-fix watcher). */
export function getErrorsSince(timestamp: number): string[] {
  return buffer
    .filter((e) => e.timestamp >= timestamp && e.level === "error")
    .map((e) => e.text);
}

export function subscribeToConsole(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
