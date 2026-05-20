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

/**
 * Strudel's draw system creates a single full-viewport fixed canvas (#test-canvas)
 * and renders all visualizations (scope, pianoroll, etc.) onto it. The canvas
 * matches the physical pixel dimensions of the screen (innerWidth × devicePixelRatio).
 *
 * Strategy:
 * 1. Find #test-canvas (the Strudel draw canvas).
 * 2. Crop to the Strudel editor container's viewport bounds — the editor is a div
 *    inserted as nextElementSibling of <strudel-editor> by connectedCallback().
 * 3. Scale the crop to fit within OUTPUT_SIZE × OUTPUT_SIZE.
 *
 * If #test-canvas is not found (no visual pattern has run), fall back to the
 * largest canvas heuristic.
 */

const OUTPUT_SIZE = 200;
const MIN_CANVAS_DIM = 50;

export type VisualCaptureResult =
  | { base64: string; width: number; height: number; error?: undefined }
  | { error: string; base64?: undefined; width?: undefined; height?: undefined };

function drawCrop(
  src: HTMLCanvasElement,
  srcX: number,
  srcY: number,
  srcW: number,
  srcH: number
): VisualCaptureResult {
  if (srcW <= 0 || srcH <= 0) {
    return { error: "Crop region has zero size." };
  }

  const scale = Math.min(OUTPUT_SIZE / srcW, OUTPUT_SIZE / srcH);
  const dstW = Math.round(srcW * scale);
  const dstH = Math.round(srcH * scale);
  const dstX = Math.round((OUTPUT_SIZE - dstW) / 2);
  const dstY = Math.round((OUTPUT_SIZE - dstH) / 2);

  const out = document.createElement("canvas");
  out.width = OUTPUT_SIZE;
  out.height = OUTPUT_SIZE;
  const ctx = out.getContext("2d");
  if (!ctx) return { error: "Could not get 2D context for offscreen canvas." };

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  try {
    ctx.drawImage(src, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
  } catch (e) {
    return { error: `Canvas draw failed: ${e instanceof Error ? e.message : String(e)}` };
  }

  const dataUrl = out.toDataURL("image/jpeg", 0.85);
  const base64 = dataUrl.split(",")[1];
  if (!base64) return { error: "toDataURL returned empty data." };

  return { base64, width: dstW, height: dstH };
}

export function captureVisual(): VisualCaptureResult {
  const dpr = window.devicePixelRatio || 1;

  // Primary path: Strudel's fixed full-viewport draw canvas.
  const testCanvas = document.querySelector<HTMLCanvasElement>("#test-canvas");
  if (testCanvas) {
    // The Strudel editor container is the nextElementSibling of <strudel-editor>.
    // connectedCallback() inserts it with parentElement.insertBefore(container, this.nextSibling).
    const editorEl = document.getElementById("strudelEditor");
    const container = editorEl?.nextElementSibling as HTMLElement | null;

    if (container) {
      const rect = container.getBoundingClientRect();
      // test-canvas is position:fixed at physical pixel resolution, so
      // viewport CSS pixels map 1:1 to canvas pixels after DPR scaling.
      const srcX = Math.round(rect.left * dpr);
      const srcY = Math.round(rect.top * dpr);
      const srcW = Math.round(rect.width * dpr);
      const srcH = Math.round(rect.height * dpr);
      return drawCrop(testCanvas, srcX, srcY, srcW, srcH);
    }

    // Container not found — capture full test-canvas as a fallback.
    return drawCrop(testCanvas, 0, 0, testCanvas.width, testCanvas.height);
  }

  // Fallback: pick the largest non-trivial canvas in the document / shadow DOM.
  const canvases: HTMLCanvasElement[] = [];
  const seen = new Set<HTMLCanvasElement>();

  function add(c: HTMLCanvasElement) {
    if (!seen.has(c)) { seen.add(c); canvases.push(c); }
  }

  const editorEl = document.getElementById("strudelEditor");
  if (editorEl?.shadowRoot) {
    for (const c of editorEl.shadowRoot.querySelectorAll("canvas")) add(c);
  }
  for (const c of document.querySelectorAll("canvas")) add(c);

  const viable = canvases.filter((c) => c.width >= MIN_CANVAS_DIM && c.height >= MIN_CANVAS_DIM);
  if (viable.length === 0) {
    return { error: "No visual canvas found. Make sure a pattern with visualizations is running." };
  }

  const src = viable.reduce((a, b) => a.width * a.height > b.width * b.height ? a : b);
  return drawCrop(src, 0, 0, src.width, src.height);
}
