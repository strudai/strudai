/**
 * Shared error buffer.
 *
 * Console.tsx records each `console.error` here; tool executors and the
 * auto-fix watcher in ChatPanel query / subscribe to it.
 */

interface ConsoleError {
  text: string;
  timestamp: number;
}

const MAX_BUFFER = 100;
const buffer: ConsoleError[] = [];
const listeners = new Set<() => void>();

export function recordError(text: string): void {
  buffer.push({ text, timestamp: Date.now() });
  if (buffer.length > MAX_BUFFER) buffer.shift();
  listeners.forEach((cb) => cb());
}

export function getErrorsSince(timestamp: number): string[] {
  return buffer.filter((e) => e.timestamp >= timestamp).map((e) => e.text);
}

export function subscribeToErrors(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
