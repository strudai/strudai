import { useImperativeHandle, forwardRef } from "react";
import type { StrudelEditorElement, StrudelEditorHandle } from "../types";

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
      setCode(code: string) {
        const el = document.getElementById("strudelEditor") as StrudelEditorElement | null;
        if (el?.editor) {
          el.editor.setCode(code);
          el.editor.evaluate();
        }
      },
    }));

    return null;
  }
);
