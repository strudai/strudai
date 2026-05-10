import type Anthropic from "@anthropic-ai/sdk";
import type { StrudelEditorHandle } from "./types";

export const TOOLS: Anthropic.Tool[] = [
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
    default:
      return JSON.stringify({ ok: false, error: `Unknown tool: ${name}` });
  }
}
