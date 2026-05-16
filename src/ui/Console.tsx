import { useEffect, useRef, useState } from "react";
import { recordConsole } from "../agent/error-buffer";

const MAX_LINES = 200;

type Level = "log" | "warn" | "error";
interface Line {
  level: Level;
  text: string;
}

function filterStyledArgs(args: unknown[]): unknown[] {
  let out = args;
  if (typeof out[0] === "string" && out[0].startsWith("%c")) {
    out = [
      (out[0] as string).split("%c").join(""),
      ...out.slice(1).filter(
        (a) => typeof a !== "string" || !a.includes("background-color")
      ),
    ];
  }
  return out.filter(
    (a) => typeof a !== "string" || !/^[\s;]*background-color:/.test(a)
  );
}

function format(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      // Error objects: JSON.stringify yields "{}" since fields aren't
      // enumerable — use the stack (or message) instead.
      if (a instanceof Error) return a.stack || `${a.name}: ${a.message}`;
      try {
        const json = JSON.stringify(a);
        return json === "{}" || json === undefined ? String(a) : json;
      } catch {
        return String(a);
      }
    })
    .join(" ");
}

/**
 * Strudel's production build logs `[query] error:` with only `e.message` —
 * a minified, near-meaningless string. Recognise the common cases and append
 * an actionable hint so the user (and the model, via strudel_read_console)
 * have something to work with.
 */
function annotateStrudelError(text: string): string {
  if (/\[query\]\s*error:.*\bis not a function\b/i.test(text)) {
    return (
      text +
      " — likely a higher-order combinator (every, off, jux, superimpose, when, " +
      "sometimes, ply, ...) was passed a value where it expects a function such as " +
      "`x => x.fast(2)`. Runtime error: the code parsed fine, so check the arguments " +
      "to those functions, not the syntax."
    );
  }
  return text;
}

export function Console() {
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    function push(level: Level, args: unknown[]) {
      const filtered = filterStyledArgs(args);
      if (filtered.length === 0) return;
      const text = annotateStrudelError(format(filtered));
      setLines((prev) => {
        const next = [...prev, { level, text }];
        return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
      });
      // Strudel logs some errors via console.log (e.g. "[getTrigger] error:"),
      // not console.error — promote any message mentioning "error" to error level.
      const effectiveLevel: Level =
        level === "error" || /error/i.test(text) ? "error" : level;
      if (effectiveLevel === "error") setHasErrors(true);
      recordConsole(effectiveLevel, text);
    }

    console.log = (...args: unknown[]) => {
      push("log", args);
      origLog.apply(console, args as []);
    };
    console.warn = (...args: unknown[]) => {
      push("warn", args);
      origWarn.apply(console, args as []);
    };
    console.error = (...args: unknown[]) => {
      push("error", args);
      origError.apply(console, args as []);
    };

    return () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
    };
  }, []);

  // Clear error indicator when user opens the panel
  useEffect(() => {
    if (open) setHasErrors(false);
  }, [open]);

  // Auto-scroll to bottom when new lines arrive
  useEffect(() => {
    if (!open) return;
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  return (
    <div
      data-open={open ? "" : undefined}
      className="retro-panel fixed bottom-4 left-4 z-20 flex flex-col overflow-hidden bg-[var(--surface)] border border-[var(--surface-border)] rounded-[var(--radius)] shadow-[var(--shadow)] w-[150px] h-[28px] data-[open]:w-[420px] data-[open]:h-[240px] transition-[width,height] duration-300 ease-out"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 flex justify-between items-center px-2 py-1 text-[0.75rem] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-0 cursor-pointer transition-colors duration-300 select-none w-full"
      >
        <span className="flex items-center gap-2">
          <span>&gt;_ console</span>
          {hasErrors && !open && (
            <span className="w-2 h-2 rounded-full bg-[#f87171]" />
          )}
        </span>
        <span className="text-[0.65rem] inline-block transition-transform duration-300 group-data-[open]:rotate-180 data-[open]:rotate-180">
          {open ? "−" : "+"}
        </span>
      </button>
      <div
        ref={bodyRef}
        className="flex-1 min-h-0 overflow-y-auto px-2 py-1 font-mono text-[0.75rem] border-t border-[var(--surface-border)]"
      >
        {lines.length === 0 ? (
          <div className="text-[var(--text-muted)] italic">No output yet.</div>
        ) : (
          lines.map((line, i) => (
            <div
              key={i}
              className={`py-[0.1rem] whitespace-pre-wrap break-all ${
                line.level === "error"
                  ? "text-[#f87171]"
                  : line.level === "warn"
                  ? "text-[#fbbf24]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
