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

import { useImperativeHandle, useEffect, forwardRef } from "react";
import type { StrudelEditorElement, StrudelEditorHandle } from "../agent/types";

let animTimer: ReturnType<typeof setTimeout> | null = null;
let pendingCode: string | null = null;

function hushHydra() {
  const hush = (globalThis as any).hush;
  if (typeof hush === 'function') {
    try { hush(); } catch { /* not initialized */ }
  }
}

function clearHydra() {
  hushHydra();
  document.getElementById('hydra-canvas')?.remove();
}

/**
 * The <strudel-editor> element lives in index.html (outside React)
 * because the web component reads its initial code from an HTML comment
 * child, which React cannot produce. This component simply exposes
 * getCode/setCode by grabbing the element by ID.
 */
export const StrudelEditor = forwardRef<StrudelEditorHandle>(
  function StrudelEditor(_props, ref) {
    useEffect(() => {
      const handleStrudelLog = (e: Event) => {
        if ((e as CustomEvent).detail?.message === '[cyclist] stop') {
          clearHydra();
        }
      };
      document.addEventListener('strudel.log', handleStrudelLog);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'Enter') {
          const el = document.getElementById("strudelEditor") as StrudelEditorElement | null;
          const code = el?.editor?.code ?? '';
          if (!code.includes('initHydra')) {
            clearHydra();
          } else {
            hushHydra();
          }
        } else if (e.ctrlKey && e.key === '.') {
          clearHydra();
        }
      };
      // Capture phase so we run before CodeMirror's keymap handler
      document.addEventListener('keydown', handleKeyDown, true);

      return () => {
        document.removeEventListener('strudel.log', handleStrudelLog);
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      getCode() {
        // Return the intended final code immediately if animation is in progress
        if (pendingCode !== null) return pendingCode;
        const el = document.getElementById("strudelEditor") as StrudelEditorElement | null;
        return el?.editor?.code ?? "";
      },
      evaluate() {
        const el = document.getElementById("strudelEditor") as StrudelEditorElement | null;
        el?.editor?.evaluate();
      },
      setCode(code: string, evaluate = true, typingOffset = 0, typingEnd = code.length, maxDurationMs?: number) {
        const el = document.getElementById("strudelEditor") as StrudelEditorElement | null;
        if (!el?.editor) return;

        if (animTimer !== null) {
          clearTimeout(animTimer);
          animTimer = null;
        }

        if (!code.includes('initHydra')) {
          clearHydra();
        } else {
          hushHydra();
        }

        // Typing animation — fast but visible.
        // Only the range [typingOffset, typingEnd) types character by character;
        // everything outside that range is shown instantly on every frame.
        // maxDurationMs caps the animation: CHUNK is scaled up so it finishes within that window.
        const DELAY = 16;
        const rangeLen = typingEnd - typingOffset;
        const CHUNK = maxDurationMs !== undefined
          ? Math.max(12, Math.ceil(rangeLen / (maxDurationMs / DELAY)))
          : 12;
        pendingCode = code;
        let pos = typingOffset;
        const suffix = code.slice(typingEnd);

        const tick = () => {
          pos = Math.min(pos + CHUNK, typingEnd);
          el.editor!.setCode(code.slice(0, pos) + suffix);
          if (pos < typingEnd) {
            animTimer = setTimeout(tick, DELAY);
          } else {
            animTimer = null;
            pendingCode = null;
            if (evaluate) el.editor!.evaluate();
          }
        };

        tick();
      },
    }));

    return null;
  }
);
