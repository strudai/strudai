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

/**
 * Performer agent for live set mode.
 *
 * Stateless, minimal: one API call per section trigger, only edit/rewrite
 * tools, no conversation history. Designed to be fast.
 */

import strudel from "../../knowledge/strudel.md?raw";
import hydra from "../../knowledge/hydra.md?raw";
import style from "../../knowledge/style.md?raw";
import type Anthropic from "@anthropic-ai/sdk";
import { streamChat } from "./api";
import { executeTool, TOOLS } from "./tools";
import type { StrudelEditorHandle } from "./types";

const DIVIDER = "\n\n---\n\n";

const PERFORMER_INSTRUCTION = `\
You are a live coding performer for Strudel. You receive a section trigger and the current editor code.
Update the code to match the section, then check the console for errors and fix them. No explanation.

- Song starts (bar 0 of a song): strudel_rewrite_code — full program, setcpm(bpm) on line 1, all patterns, Hydra visuals.
- Mid-song sections: strudel_edit_code — one focused change. Prefer this.
- After every code change, call strudel_read_console. If there are errors, fix them.`;

const PERFORMER_SYSTEM_TEXT = [PERFORMER_INSTRUCTION, strudel, hydra, style].join(DIVIDER);

const PERFORMER_TOOLS: Anthropic.ToolUnion[] = TOOLS.filter(
  (t) =>
    t.name === "strudel_rewrite_code" ||
    t.name === "strudel_edit_code" ||
    t.name === "strudel_read_console"
);

export interface PerformerTurnParams {
  apiKey: string;
  model: string;
  code: string;
  sectionPrompt: string;
  editorHandle: StrudelEditorHandle;
  signal?: AbortSignal;
}

export async function runPerformerTurn(params: PerformerTurnParams): Promise<void> {
  const { apiKey, model, code, sectionPrompt, editorHandle, signal } = params;

  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: PERFORMER_SYSTEM_TEXT, cache_control: { type: "ephemeral", ttl: "1h" } },
  ];

  let userContent = sectionPrompt;
  if (code) userContent += `\n\n[Current code]\n\`\`\`\n${code}\n\`\`\``;

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userContent }];

  for (let i = 0; i < 5; i++) {
    if (signal?.aborted) return;

    const result = await streamChat({
      messages,
      model,
      system,
      apiKey,
      tools: PERFORMER_TOOLS,
      onText: () => {},
      signal,
    });

    messages.push({ role: "assistant", content: result.content });
    if (result.stopReason !== "tool_use") break;

    const toolUseBlocks = result.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const toolResult = await executeTool(
        block.name,
        block.input as Record<string, unknown>,
        editorHandle
      );
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: typeof toolResult === "string" ? toolResult : "[image]",
      });
    }

    messages.push({ role: "user", content: toolResults });
  }
}
