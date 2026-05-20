// Copyright (C) 2025 Douwe van der Heijden
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

import { useImperativeHandle, forwardRef } from "react";
import type { StrudelEditorElement, StrudelEditorHandle } from "../agent/types";

/**
 * The <strudel-editor> element lives in index.html (outside React)
 * because the web component reads its initial code from an HTML comment
 * child, which React cannot produce. This component simply exposes
 * getCode/setCode by grabbing the element by ID.
 */
export const StrudelEditor = forwardRef<StrudelEditorHandle>(
  function StrudelEditor(_props, ref) {
    useImperativeHandle(ref, () => ({
      getCode() {
        const el = document.getElementById("strudelEditor") as StrudelEditorElement | null;
        return el?.editor?.code ?? "";
      },
      setCode(code: string, evaluate = true) {
        const el = document.getElementById("strudelEditor") as StrudelEditorElement | null;
        if (el?.editor) {
          el.editor.setCode(code);
          if (evaluate) el.editor.evaluate();
        }
      },
    }));

    return null;
  }
);
