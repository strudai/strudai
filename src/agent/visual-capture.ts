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

const OUTPUT_SIZE = 200;
const MIN_CANVAS_DIM = 50;

export type VisualCaptureResult =
  | { base64: string; width: number; height: number; error?: undefined }
  | { error: string; base64?: undefined; width?: undefined; height?: undefined };

function collectCanvases(): HTMLCanvasElement[] {
  const seen = new Set<HTMLCanvasElement>();
  const out: HTMLCanvasElement[] = [];

  function add(c: HTMLCanvasElement) {
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }

  // Shadow DOM of the Strudel editor
  const editorEl = document.getElementById("strudelEditor");
  if (editorEl?.shadowRoot) {
    for (const c of editorEl.shadowRoot.querySelectorAll("canvas")) add(c);
  }

  // Main document (some Strudel visuals render outside the component)
  for (const c of document.querySelectorAll("canvas")) add(c);

  return out;
}

export function captureVisual(): VisualCaptureResult {
  const canvases = collectCanvases().filter(
    (c) => c.width >= MIN_CANVAS_DIM && c.height >= MIN_CANVAS_DIM
  );

  if (canvases.length === 0) {
    return {
      error:
        "No visual canvas found. Make sure a pattern with visualizations is running.",
    };
  }

  // Pick the canvas with the most pixels
  const src = canvases.reduce((a, b) =>
    a.width * a.height > b.width * b.height ? a : b
  );

  // Scale to fit within OUTPUT_SIZE × OUTPUT_SIZE, preserving aspect ratio
  const scale = Math.min(OUTPUT_SIZE / src.width, OUTPUT_SIZE / src.height);
  const w = Math.round(src.width * scale);
  const h = Math.round(src.height * scale);
  const x = Math.round((OUTPUT_SIZE - w) / 2);
  const y = Math.round((OUTPUT_SIZE - h) / 2);

  const out = document.createElement("canvas");
  out.width = OUTPUT_SIZE;
  out.height = OUTPUT_SIZE;
  const ctx = out.getContext("2d");
  if (!ctx) return { error: "Could not get 2D context for offscreen canvas." };

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  try {
    ctx.drawImage(src, x, y, w, h);
  } catch (e) {
    return {
      error: `Canvas draw failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const dataUrl = out.toDataURL("image/jpeg", 0.85);
  const base64 = dataUrl.split(",")[1];
  if (!base64) return { error: "toDataURL returned empty data." };

  return { base64, width: w, height: h };
}
