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
 * Strudel visual output lives on two different canvases depending on the
 * visualization type:
 *
 *  - #test-canvas  — Strudel's shared 2D draw canvas (scope, pianoroll, etc.).
 *                    Created by getDrawContext() and prepended to document.body.
 *                    Full-viewport fixed overlay using a 2D context.
 *
 *  - Hydra canvas  — Hydra creates its own WebGL canvas (not #test-canvas)
 *                    and renders its generative visuals into it.
 *
 * Strategy:
 *  1. Prefer large WebGL canvases that are NOT #test-canvas — these are Hydra
 *     output canvases. canvas-intercept.ts ensures preserveDrawingBuffer: true
 *     so the last rendered frame is readable.
 *  2. Fall back to #test-canvas (full capture) for 2D visualizations.
 *  3. After rendering to the output canvas, sample a grid of pixels; if the
 *     result is all-black, return an informative error instead of a black image.
 */

const OUTPUT_SIZE = 200;
const MIN_AREA = 50 * 50;

export type VisualCaptureResult =
  | { base64: string; width: number; height: number; error?: undefined }
  | { error: string; base64?: undefined; width?: undefined; height?: undefined };

function hasWebGLContext(canvas: HTMLCanvasElement): boolean {
  // Calling getContext on a canvas that already holds a context of a given
  // type returns that same context. Returns null for a mismatched type.
  try {
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function isBlack(ctx: CanvasRenderingContext2D): boolean {
  // Sample a 10×10 grid across the output canvas to detect non-black pixels.
  const step = Math.max(1, Math.floor(OUTPUT_SIZE / 10));
  for (let y = step / 2; y < OUTPUT_SIZE; y += step) {
    for (let x = step / 2; x < OUTPUT_SIZE; x += step) {
      const [r, g, b, a] = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      if (a > 10 && (r > 10 || g > 10 || b > 10)) return false;
    }
  }
  return true;
}

function drawCrop(
  src: HTMLCanvasElement,
  srcX: number,
  srcY: number,
  srcW: number,
  srcH: number
): VisualCaptureResult {
  if (srcW <= 0 || srcH <= 0) return { error: "Crop region has zero size." };

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

  if (isBlack(ctx)) {
    return {
      error:
        "Canvas captured but the result is all black — " +
        "the visual may not be running yet, or preserveDrawingBuffer is not active for this context. " +
        "Try evaluating the pattern first (Ctrl+Enter) and call strudel_vision again.",
    };
  }

  const dataUrl = out.toDataURL("image/jpeg", 0.85);
  const base64 = dataUrl.split(",")[1];
  if (!base64) return { error: "toDataURL returned empty data." };

  return { base64, width: dstW, height: dstH };
}

export function captureVisual(): VisualCaptureResult {
  const all = Array.from(document.querySelectorAll<HTMLCanvasElement>("canvas")).filter(
    (c) => c.width * c.height >= MIN_AREA
  );

  if (all.length === 0) {
    return {
      error: "No visual canvas found. Make sure a pattern with visualizations is running.",
    };
  }

  // Prefer large WebGL canvases that are NOT #test-canvas.
  // Hydra outputs to its own full-viewport WebGL canvas.
  const webgl = all.filter((c) => c.id !== "test-canvas" && hasWebGLContext(c));
  if (webgl.length > 0) {
    const src = webgl.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
    return drawCrop(src, 0, 0, src.width, src.height);
  }

  // Fall back to Strudel's shared 2D draw canvas (scope, pianoroll, etc.).
  const testCanvas = document.querySelector<HTMLCanvasElement>("#test-canvas");
  if (testCanvas) {
    return drawCrop(testCanvas, 0, 0, testCanvas.width, testCanvas.height);
  }

  // Last resort: largest canvas in document.
  const src = all.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
  return drawCrop(src, 0, 0, src.width, src.height);
}
