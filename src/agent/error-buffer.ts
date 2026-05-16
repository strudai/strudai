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
