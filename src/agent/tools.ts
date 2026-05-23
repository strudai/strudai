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

import type Anthropic from "@anthropic-ai/sdk";
import type { StrudelEditorHandle } from "./types";
import { getRecentConsole } from "./error-buffer";
import { analyzeAudio } from "./audio-analyzer";
import { captureVisual } from "./visual-capture";
import {
  setPlan as setActivePlan,
  startSet as activateSet,
  stopSet as deactivateSet,
  getPlan,
  totalBars,
  type SetPlan,
  type SetSong,
} from "./set-state";

const CONSOLE_READ_WAIT_MS = 1000;
const CONSOLE_READ_COUNT = 10;

async function readConsole(): Promise<string> {
  // Wait briefly so errors from a just-applied edit have time to surface.
  await new Promise((r) => setTimeout(r, CONSOLE_READ_WAIT_MS));
  const entries = getRecentConsole(CONSOLE_READ_COUNT);
  const lines = entries.map((e) => `[${e.level}] ${e.text}`);
  const errorCount = entries.filter((e) => e.level === "error").length;
  return JSON.stringify({ lines, errorCount });
}

export interface ToolMeta {
  name: string;
  label: string;
  description: string;
  category: string;
}

export const TOOL_META: ToolMeta[] = [
  { name: "strudel_edit_code", label: "Edit code", description: "Targeted search-and-replace edits", category: "Editor" },
  { name: "strudel_rewrite_code", label: "Rewrite code", description: "Replace the entire editor code", category: "Editor" },
  { name: "strudel_read_console", label: "Read console", description: "Check recent console output for errors", category: "Editor" },
  { name: "strudel_listen", label: "Listen", description: "Sample audio output: lows/mids/highs loudness, peak frequency", category: "Editor" },
  { name: "strudel_vision", label: "Vision", description: "Screenshot the current Strudel visual output (200×200 px)", category: "Editor" },
  { name: "strudel_docs_search", label: "Docs search", description: "Search the official Strudel documentation", category: "Research" },
  { name: "sample_search", label: "Sample search", description: "Find Strudel sample packs and sounds", category: "Research" },
  { name: "example_search", label: "Example search", description: "Literal text search across community Strudel patterns", category: "Research" },
  { name: "web_search", label: "Web search", description: "Search the web (server-side, billed)", category: "Research" },
  { name: "plan_set", label: "Plan set", description: "Define the structure of a live set", category: "Set" },
  { name: "start_set", label: "Start set", description: "Begin live set playback and bar-aligned triggers", category: "Set" },
  { name: "stop_set", label: "Stop set", description: "End the active live set", category: "Set" },
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
  {
    name: "strudel_listen",
    description:
      "Sample the current Strudel audio output and return frequency band levels. " +
      "Reports loudness in dB for lows (20–250 Hz), mids (250–4 kHz), and highs (4–20 kHz), " +
      "plus the dominant peak frequency and whether audio is playing. " +
      "Also returns the set BPM if a plan is active. " +
      "Use this to diagnose mix balance (e.g. too much bass, weak high-end), " +
      "verify that a pattern is actually making sound, or check frequency buildup.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "strudel_vision",
    description:
      "Take a 200×200 px screenshot of the current Strudel visual output and return it as an image. " +
      "Use this when the user asks about visuals, wants feedback on what the pattern looks like, " +
      "or when you want to verify that a visual effect (pianoroll, scope, animation) is working.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "strudel_read_console",
    description:
      "Read recent console output (logs, warnings, errors) from the running " +
      "Strudel REPL. Call this after writing or editing code to confirm it runs " +
      "cleanly — some errors (e.g. missing samples) only appear once the pattern plays.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "strudel_docs_search",
    description:
      "Search the official Strudel documentation for functions, effects, and techniques.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Search query" },
      },
      required: ["query"],
    },
  },
  {
    name: "sample_search",
    description:
      "Search Strudel sample packs by pack name or sound name. " +
      "Returns matching packs with their sounds and how to load them.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Sample or pack name to search for" },
      },
      required: ["query"],
    },
  },
  {
    name: "example_search",
    description:
      "Search the bundled community Strudel examples by literal " +
      "case-insensitive substring match across both titles and code. Use it " +
      "often when writing patterns — search for a function name or sound to " +
      "find idiomatic real-world usage. " +
      "Never copy-paste results directly; use them only as references for " +
      "syntax and patterns, then adapt to the user's request.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "Substring to search for (matches title and code, case-insensitive)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "plan_set",
    description:
      "Define the structure of a live set. Use when the user asks for a set, " +
      "mix, DJ session, or extended performance. Provide a list of songs, " +
      "each with a bar count, a foundation (sound palette / key / base " +
      "patterns), and bar-positioned sections with instructions for what " +
      "should change at that point. Calling this replaces any existing plan.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Title of the set" },
        genre: { type: "string", description: "Genre / vibe" },
        bpm: { type: "number", description: "Tempo in beats per minute" },
        songs: {
          type: "array",
          description: "Songs played in order",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              bars: {
                type: "number",
                description: "Total bars in the song (typical 32–64)",
              },
              foundation: {
                type: "string",
                description:
                  "Sound palette, key, samples, base patterns — set up at song start.",
              },
              sections: {
                type: "array",
                description:
                  "Section markers within the song. Bar offsets are 0-relative within the song. Typical: 3–6 sections every 8–16 bars.",
                items: {
                  type: "object",
                  properties: {
                    bar: {
                      type: "number",
                      description: "Bar offset within the song (0-relative)",
                    },
                    note: {
                      type: "string",
                      description:
                        "Instruction for what should happen at this bar (e.g. 'bring in kick', 'drop everything but bass').",
                    },
                  },
                  required: ["bar", "note"],
                },
              },
            },
            required: ["name", "bars", "foundation", "sections"],
          },
        },
      },
      required: ["title", "genre", "bpm", "songs"],
    },
  },
  {
    name: "start_set",
    description:
      "Activate the planned set. Bar-aligned trigger messages will start " +
      "arriving immediately (bar 0 first — establish the foundation and call " +
      "setcpm(bpm/4)). Only call this after plan_set, and ideally after the " +
      "user confirms they want to start.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "stop_set",
    description:
      "End the active live set. No more bar triggers will fire; the plan " +
      "stays visible but inactive.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

const ALGOLIA_URL =
  "https://SAZ71S8CLS-dsn.algolia.net/1/indexes/strudel-tidalcycles/query";
const ALGOLIA_HEADERS = {
  "X-Algolia-Application-Id": "SAZ71S8CLS",
  "X-Algolia-API-Key": "d5044f9d21b80e7721e5b0067a8730b1",
  "Content-Type": "application/json",
};

interface AlgoliaHit {
  hierarchy?: Record<string, string | null>;
  url?: string;
  content?: string | null;
}

async function docsSearch(query: string): Promise<string> {
  const resp = await fetch(ALGOLIA_URL, {
    method: "POST",
    headers: ALGOLIA_HEADERS,
    body: JSON.stringify({ query, hitsPerPage: 5 }),
  });
  if (!resp.ok) {
    return JSON.stringify({ ok: false, error: `Algolia ${resp.status}` });
  }
  const data: { hits?: AlgoliaHit[] } = await resp.json();
  const results = (data.hits ?? []).map((hit) => {
    const hierarchy = hit.hierarchy ?? {};
    const title = Object.keys(hierarchy)
      .sort()
      .map((k) => hierarchy[k])
      .filter((v): v is string => !!v)
      .join(" > ");
    return { title, url: hit.url ?? "", content: hit.content ?? "" };
  });
  return JSON.stringify({ query, results });
}

// Bundled at build time from strudel-samples.alternet.site (which lacks CORS headers).
// Refresh by re-downloading to public/strudel_samples.json.
const SAMPLE_INDEX_URL = "/strudel_samples.json";
const SAMPLE_USAGE_HINT =
  'Load external packs with samples("github:user/repo") then use s("soundname"). ' +
  'Builtin sounds don\'t need loading — just use s("bd sd hh"). ' +
  'Use :N for variants, e.g. s("sd:1").';

interface SamplePack {
  name: string;
  samples?: string[];
  builtin?: boolean;
}

let sampleIndexCache: SamplePack[] | null = null;

async function loadSampleIndex(): Promise<SamplePack[]> {
  if (sampleIndexCache) return sampleIndexCache;
  const resp = await fetch(SAMPLE_INDEX_URL);
  if (!resp.ok) throw new Error(`Sample index ${resp.status}`);
  sampleIndexCache = (await resp.json()) as SamplePack[];
  return sampleIndexCache;
}

async function sampleSearch(query: string): Promise<string> {
  try {
    const index = await loadSampleIndex();
    const q = query.toLowerCase();
    const matches: Array<{
      pack: string;
      sounds: string[];
      builtin: boolean;
      load_with?: string;
    }> = [];
    for (const pack of index) {
      const name = pack.name.toLowerCase();
      const samples = pack.samples ?? [];
      const matchingSamples = samples.filter((s) => s.toLowerCase().includes(q));
      if (name.includes(q) || matchingSamples.length > 0) {
        const entry = {
          pack: pack.name,
          sounds: name.includes(q) ? samples : matchingSamples,
          builtin: !!pack.builtin,
          ...(pack.builtin ? {} : { load_with: `samples("github:${pack.name}")` }),
        };
        matches.push(entry);
      }
    }
    return JSON.stringify({
      query,
      results: matches.slice(0, 10),
      usage: SAMPLE_USAGE_HINT,
    });
  } catch (err) {
    return JSON.stringify({
      ok: false,
      error: err instanceof Error ? err.message : "sample_search failed",
    });
  }
}

const EXAMPLES_URL = "/strudel_examples.md";
const MAX_EXAMPLE_RESULTS = 3;
const MAX_CODE_CHARS = 1500;

interface Example {
  title: string;
  code: string;
}

let examplesCache: Example[] | null = null;

async function loadExamples(): Promise<Example[]> {
  if (examplesCache) return examplesCache;
  const resp = await fetch(EXAMPLES_URL);
  if (!resp.ok) throw new Error(`Examples ${resp.status}`);
  const text = await resp.text();
  // The pipeline joins sections with "\n\n---\n\n"; the first chunk is the file header.
  const sections = text.split(/\n\n---\n\n/);
  const out: Example[] = [];
  for (const section of sections) {
    const titleMatch = section.match(/^##\s+(.+)$/m);
    const codeMatch = section.match(/```(?:strudel)?\n([\s\S]*?)```/);
    if (titleMatch && codeMatch) {
      out.push({ title: titleMatch[1].trim(), code: codeMatch[1].trim() });
    }
  }
  examplesCache = out;
  return out;
}

async function exampleSearch(query: string): Promise<string> {
  try {
    const examples = await loadExamples();
    const q = query.toLowerCase();
    const matches = examples.filter(
      (e) =>
        e.title.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)
    );
    const results = matches.slice(0, MAX_EXAMPLE_RESULTS).map((e) => ({
      title: e.title,
      code:
        e.code.length > MAX_CODE_CHARS
          ? e.code.slice(0, MAX_CODE_CHARS) + "\n// ...truncated"
          : e.code,
    }));
    return JSON.stringify({
      query,
      total_matches: matches.length,
      results,
      usage:
        "Reference only — do not copy/paste. Use to learn syntax and patterns, then adapt.",
    });
  } catch (err) {
    return JSON.stringify({
      ok: false,
      error: err instanceof Error ? err.message : "example_search failed",
    });
  }
}

export type ToolResultContent = string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam>;

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  editor: StrudelEditorHandle
): Promise<ToolResultContent> {
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
        return JSON.stringify({ ok: false, error: "old_string not found in current code" });
      }
      if (count > 1) {
        return JSON.stringify({ ok: false, error: `old_string found ${count} times, must match exactly once` });
      }
      editor.setCode(current.replace(oldStr, newStr));
      return JSON.stringify({ ok: true });
    }
    case "strudel_read_console": {
      return readConsole();
    }
    case "strudel_docs_search": {
      return docsSearch(input.query as string);
    }
    case "sample_search": {
      return sampleSearch(input.query as string);
    }
    case "example_search": {
      return exampleSearch(input.query as string);
    }
    case "plan_set": {
      return planSet(input);
    }
    case "start_set": {
      return startSetTool();
    }
    case "stop_set": {
      return stopSetTool();
    }
    case "strudel_listen": {
      const snap = await analyzeAudio();
      return JSON.stringify(snap);
    }
    case "strudel_vision": {
      const capture = captureVisual();
      if (capture.base64 === undefined) {
        return JSON.stringify({ ok: false, error: capture.error });
      }
      return [
        {
          type: "image" as const,
          source: {
            type: "base64" as const,
            media_type: "image/jpeg" as const,
            data: capture.base64,
          },
        },
        {
          type: "text" as const,
          text: `Visual snapshot captured (${capture.width}×${capture.height} px, scaled to fit 200×200).`,
        },
      ];
    }
    default:
      return JSON.stringify({ ok: false, error: `Unknown tool: ${name}` });
  }
}

function validatePlanInput(input: Record<string, unknown>): SetPlan | string {
  const title = input.title;
  const genre = input.genre;
  const bpm = input.bpm;
  const songsRaw = input.songs;
  if (typeof title !== "string" || !title.trim()) return "title required";
  if (typeof genre !== "string" || !genre.trim()) return "genre required";
  if (typeof bpm !== "number" || bpm <= 0) return "bpm must be > 0";
  if (!Array.isArray(songsRaw) || songsRaw.length === 0) return "songs must be a non-empty array";

  const songs: SetSong[] = [];
  for (let i = 0; i < songsRaw.length; i++) {
    const raw = songsRaw[i] as Record<string, unknown>;
    const name = raw?.name;
    const bars = raw?.bars;
    const foundation = raw?.foundation;
    const sectionsRaw = raw?.sections;
    if (typeof name !== "string" || !name.trim()) return `songs[${i}].name required`;
    if (typeof bars !== "number" || bars <= 0) return `songs[${i}].bars must be > 0`;
    if (typeof foundation !== "string") return `songs[${i}].foundation must be a string`;
    if (!Array.isArray(sectionsRaw) || sectionsRaw.length === 0) {
      return `songs[${i}].sections must be a non-empty array`;
    }
    const sections: { bar: number; note: string }[] = [];
    for (let j = 0; j < sectionsRaw.length; j++) {
      const sr = sectionsRaw[j] as Record<string, unknown>;
      const bar = sr?.bar;
      const note = sr?.note;
      if (typeof bar !== "number" || bar < 0 || bar >= bars) {
        return `songs[${i}].sections[${j}].bar must be in [0, ${bars})`;
      }
      if (typeof note !== "string" || !note.trim()) {
        return `songs[${i}].sections[${j}].note required`;
      }
      sections.push({ bar, note });
    }
    songs.push({ name, bars, foundation, sections });
  }
  return { title, genre, bpm, songs };
}

function planSet(input: Record<string, unknown>): string {
  const result = validatePlanInput(input);
  if (typeof result === "string") {
    return JSON.stringify({ ok: false, error: result });
  }
  setActivePlan(result);
  const total = totalBars();
  const minutes = (total * 240) / result.bpm / 60;
  return JSON.stringify({
    ok: true,
    summary: `${result.title} — ${result.songs.length} song${result.songs.length === 1 ? "" : "s"}, ${result.bpm} BPM, ${total} bars (~${minutes.toFixed(1)}m)`,
  });
}

function startSetTool(): string {
  if (!getPlan()) {
    return JSON.stringify({ ok: false, error: "no plan — call plan_set first" });
  }
  activateSet();
  return JSON.stringify({
    ok: true,
    summary: `Set started — bar 0 of ${totalBars()}`,
  });
}

function stopSetTool(): string {
  deactivateSet();
  return JSON.stringify({ ok: true });
}
