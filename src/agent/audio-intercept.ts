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
 * Intercept AudioNode.prototype.connect to discover Strudel's audio output.
 *
 * Strudel doesn't expose its AudioContext or output node through any documented
 * public API. Instead we patch connect() at startup: whenever any AudioNode
 * connects directly to its context's destination, that node IS the master
 * output. We store it alongside the AudioContext so analyzeAudio() can tap in.
 *
 * This must be imported before Strudel evaluates its first pattern (i.e. before
 * the user presses Ctrl+Enter), which is guaranteed when imported from main.tsx.
 */

interface Capture {
  ctx: AudioContext;
  output: AudioNode;
}

let _capture: Capture | null = null;

// Store the original connect before patching.
// eslint-disable-next-line @typescript-eslint/unbound-method
const _origConnect = AudioNode.prototype.connect;

// Replace connect with a version that records the last node wired to destination.
// The cast through `unknown` is necessary because our replacement satisfies both
// overload signatures at runtime but TypeScript can't prove it statically.
(AudioNode.prototype.connect as unknown as (
  dest: AudioNode | AudioParam,
  ...rest: number[]
) => AudioNode | void) = function (
  this: AudioNode,
  dest: AudioNode | AudioParam,
  ...rest: number[]
): AudioNode | void {
    const ctx = this.context;
    if (
      ctx instanceof AudioContext &&
      dest instanceof AudioNode &&
      dest === ctx.destination
    ) {
      _capture = { ctx, output: this };
    }
    return (_origConnect as (dest: AudioNode | AudioParam, ...rest: number[]) => AudioNode | void).apply(this, [dest, ...rest]);
  };

export function getCapturedAudio(): Capture | null {
  return _capture;
}
