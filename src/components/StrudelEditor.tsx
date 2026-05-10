import { useRef, useImperativeHandle, forwardRef } from "react";
import type { StrudelEditorElement, StrudelEditorHandle } from "../types";

export const StrudelEditor = forwardRef<StrudelEditorHandle>(
  function StrudelEditor(_props, ref) {
    const editorRef = useRef<StrudelEditorElement>(null);

    useImperativeHandle(ref, () => ({
      getCode() {
        return editorRef.current?.editor?.code ?? "";
      },
      setCode(code: string) {
        const el = editorRef.current;
        if (el?.editor) {
          el.editor.setCode(code);
          el.editor.evaluate();
        }
      },
    }));

    return (
      <div className="h-full w-full">
        {/* @ts-expect-error strudel-editor is a custom element loaded from CDN */}
        <strudel-editor ref={editorRef} id="strudelEditor">
          {`note("c a f e").sound("piano")`}
          {/* @ts-expect-error closing custom element */}
        </strudel-editor>
      </div>
    );
  }
);
