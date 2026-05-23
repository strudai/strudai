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

// All unique (ctx, output) pairs that have ever connected to their context's
// destination, in insertion order. Multiple nodes may connect to destination
// (e.g. Strudel's master gain plus a compressor or meter added later), so we
// keep all of them and try them all in analyzeAudio.
const _captures: Capture[] = [];

// Store the original connect before patching.
// eslint-disable-next-line @typescript-eslint/unbound-method
const _origConnect = AudioNode.prototype.connect;

// Replace connect with a version that records every node wired to destination.
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
      const alreadyTracked = _captures.some(c => c.ctx === ctx && c.output === this);
      if (!alreadyTracked) {
        _captures.push({ ctx, output: this });
      }
    }
    return (_origConnect as (dest: AudioNode | AudioParam, ...rest: number[]) => AudioNode | void).apply(this, [dest, ...rest]);
  };

/** All captured (ctx, output) pairs, oldest first. */
export function getAllCaptures(): Capture[] {
  return _captures;
}

/** Most recently captured pair, or null if none yet. */
export function getCapturedAudio(): Capture | null {
  return _captures.length > 0 ? _captures[_captures.length - 1] : null;
}
