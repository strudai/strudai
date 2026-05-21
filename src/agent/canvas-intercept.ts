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
 * Patch HTMLCanvasElement.prototype.getContext to force preserveDrawingBuffer: true
 * on all WebGL contexts.
 *
 * By default WebGL clears its drawing buffer after every frame is composited,
 * so calling toDataURL() or drawImage() on the canvas returns a blank (black)
 * image. Setting preserveDrawingBuffer: true disables this optimisation and keeps
 * the last rendered frame available for readback at any time.
 *
 * Must be imported before any WebGL contexts are created — guaranteed when
 * imported as the first line of main.tsx, since Strudel defers context creation
 * until the user evaluates their first pattern.
 */

// eslint-disable-next-line @typescript-eslint/unbound-method
const _origGetContext = HTMLCanvasElement.prototype.getContext;

(HTMLCanvasElement.prototype.getContext as unknown as (
  contextId: string,
  options?: unknown
) => RenderingContext | null) = function (
  this: HTMLCanvasElement,
  contextId: string,
  options?: unknown
): RenderingContext | null {
  if (contextId === "webgl" || contextId === "webgl2") {
    options = { ...(options as WebGLContextAttributes), preserveDrawingBuffer: true };
  }
  return (
    _origGetContext as unknown as (
      contextId: string,
      options?: unknown
    ) => RenderingContext | null
  ).call(this, contextId, options);
};
