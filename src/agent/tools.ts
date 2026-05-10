import type Anthropic from "@anthropic-ai/sdk";
import type { StrudelEditorHandle } from "./types";

export interface ToolMeta {
  name: string;
  label: string;
  description: string;
  category: string;
}

export const TOOL_META: ToolMeta[] = [
  { name: "strudel_edit_code", label: "Edit code", description: "Targeted search-and-replace edits", category: "Editor" },
  { name: "strudel_rewrite_code", label: "Rewrite code", description: "Replace the entire editor code", category: "Editor" },
  { name: "web_search", label: "Web search", description: "Search the web (server-side, billed)", category: "Research" },
];

export function getActiveTools(enabled: Record<string, boolean>): Anthropic.ToolUnion[] {
  return TOOLS.filter((t) => enabled[t.name] !== false);
}

export const TOOLS: Anthropic.ToolUnion[] = [
  {
    type: "web_search_20260209",
    name: "web_search",
    max_uses: 3,
    allowed_callers: ["direct"],
  },
  {
    name: "strudel_rewrite_code",
    description:
      "Replace the entire Strudel editor code and evaluate it. " +
      "Use when writing code from scratch or rewriting most of the code.",
    input_schema: {
      type: "object" as const,
      properties: {
        code: {
          type: "string",
          description: "The complete Strudel code to put in the editor",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "strudel_edit_code",
    description:
      "Search-and-replace a section of the Strudel editor code. " +
      "Use for targeted edits — changing a sound, tweaking a value, adding a line. " +
      "The old_string must match exactly once in the current code.",
    input_schema: {
      type: "object" as const,
      properties: {
        old_string: {
          type: "string",
          description: "The exact substring to find in the current code",
        },
        new_string: {
          type: "string",
          description: "The replacement string",
        },
      },
      required: ["old_string", "new_string"],
    },
  },
];

export function executeTool(
  name: string,
  input: Record<string, unknown>,
  editor: StrudelEditorHandle
): string {
  switch (name) {
    case "strudel_rewrite_code": {
      const code = input.code as string;
      editor.setCode(code);
      return JSON.stringify({ ok: true });
    }
    case "strudel_edit_code": {
      const oldStr = input.old_string as string;
      const newStr = input.new_string as string;
      const current = editor.getCode();
      const count = current.split(oldStr).length - 1;
      if (count === 0) {
        return JSON.stringify({ ok: false, error: "old_string not found in current code", current_code: current });
      }
      if (count > 1) {
        return JSON.stringify({ ok: false, error: `old_string found ${count} times, must match exactly once` });
      }
      editor.setCode(current.replace(oldStr, newStr));
      return JSON.stringify({ ok: true });
    }
    default:
      return JSON.stringify({ ok: false, error: `Unknown tool: ${name}` });
  }
}
