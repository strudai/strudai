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
        const el = document.getElementById("strudelEditor") as StrudelEditorElement | null;
        return el?.editor?.code ?? "";
      },
      setCode(code: string, evaluate = true) {
        const el = document.getElementById("strudelEditor") as StrudelEditorElement | null;
        if (el?.editor) {
          if (!code.includes('initHydra')) {
            clearHydra();
          } else {
            hushHydra();
          }
          el.editor.setCode(code);
          if (evaluate) el.editor.evaluate();
        }
      },
    }));

    return null;
  }
);
