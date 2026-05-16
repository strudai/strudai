import type Anthropic from "@anthropic-ai/sdk";
import type { StrudelEditorHandle } from "./types";
import { getRecentConsole } from "./error-buffer";

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
  { name: "strudel_docs_search", label: "Docs search", description: "Search the official Strudel documentation", category: "Research" },
  { name: "sample_search", label: "Sample search", description: "Find Strudel sample packs and sounds", category: "Research" },
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

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  editor: StrudelEditorHandle
): Promise<string> {
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
    case "strudel_read_console": {
      return readConsole();
    }
    case "strudel_docs_search": {
      return docsSearch(input.query as string);
    }
    case "sample_search": {
      return sampleSearch(input.query as string);
    }
    default:
      return JSON.stringify({ ok: false, error: `Unknown tool: ${name}` });
  }
}
