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

import { getPlan } from "./set-state";
import { getAllCaptures } from "./audio-intercept";

const SAMPLE_WAIT_MS = 2000;
const SILENCE_THRESHOLD = 4; // out of 255; below this → not playing

export interface AudioSnapshot {
  playing: boolean;
  overall_db: number | null;
  lows_db: number | null; // 20–250 Hz
  mids_db: number | null; // 250–4 000 Hz
  highs_db: number | null; // 4 000–20 000 Hz
  peak_hz: number | null; // frequency bin with highest energy
  bpm: number | null; // from active set plan, not audio-based
  error: string | null;
}

function binToDb(avg: number): number {
  // AnalyserNode byte values: 0 = −∞ dB, 255 = 0 dB (default minDecibels/maxDecibels)
  if (avg <= 0) return -60;
  return Math.max(-60, 20 * Math.log10(avg / 255));
}

function bandAvg(
  data: Uint8Array,
  sampleRate: number,
  fftSize: number,
  minHz: number,
  maxHz: number
): number {
  const binHz = sampleRate / fftSize;
  const minBin = Math.max(0, Math.floor(minHz / binHz));
  const maxBin = Math.min(data.length - 1, Math.ceil(maxHz / binHz));
  if (minBin > maxBin) return 0;
  let sum = 0;
  for (let i = minBin; i <= maxBin; i++) sum += data[i];
  return sum / (maxBin - minBin + 1);
}

export async function analyzeAudio(): Promise<AudioSnapshot> {
  const bpm = getPlan()?.bpm ?? null;
  const base: AudioSnapshot = {
    playing: false,
    overall_db: null,
    lows_db: null,
    mids_db: null,
    highs_db: null,
    peak_hz: null,
    bpm,
    error: null,
  };

  const allCaptures = getAllCaptures();
  if (allCaptures.length === 0) {
    return {
      ...base,
      error:
        "No audio context captured yet — press Ctrl+Enter in the editor to evaluate a pattern first.",
    };
  }

  // Find the first running AudioContext among all captures (newest first).
  // Strudel may create a new AudioContext on re-evaluation, so the most recent
  // running context is the one that's actually producing audio.
  let ctx: AudioContext | null = null;
  for (let i = allCaptures.length - 1; i >= 0; i--) {
    if (allCaptures[i].ctx.state === "running") {
      ctx = allCaptures[i].ctx;
      break;
    }
  }

  if (!ctx) {
    const lastState = allCaptures[allCaptures.length - 1].ctx.state;
    return {
      ...base,
      error: `Audio context is ${lastState} — press play in the editor first.`,
    };
  }

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;

  // Tap ALL output nodes from this context in parallel — connect() is additive
  // in Web Audio API, so this doesn't disturb existing output → destination
  // connections. Strudel may connect several nodes to destination (master gain,
  // compressor, re-evaluation creates a new gain, etc.), so we try all of them
  // and the analyser sees the combined signal.
  const connected: AudioNode[] = [];
  for (const { ctx: capCtx, output } of allCaptures) {
    if (capCtx !== ctx) continue;
    try {
      output.connect(analyser);
      connected.push(output);
    } catch {
      // Node may be in an invalid state (e.g. already garbage-collected), skip.
    }
  }

  await new Promise((r) => setTimeout(r, SAMPLE_WAIT_MS));

  const freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqData);

  for (const output of connected) {
    try {
      output.disconnect(analyser);
    } catch {
      // Safe to ignore
    }
  }

  const overallAvg = freqData.reduce((s, v) => s + v, 0) / freqData.length;
  const playing = overallAvg > SILENCE_THRESHOLD;

  // Find dominant frequency bin
  let peakIdx = 0;
  for (let i = 1; i < freqData.length; i++) {
    if (freqData[i] > freqData[peakIdx]) peakIdx = i;
  }
  const binHz = ctx.sampleRate / analyser.fftSize;

  const round1 = (n: number) => Math.round(n * 10) / 10;

  return {
    playing,
    overall_db: round1(binToDb(overallAvg)),
    lows_db: round1(binToDb(bandAvg(freqData, ctx.sampleRate, analyser.fftSize, 20, 250))),
    mids_db: round1(binToDb(bandAvg(freqData, ctx.sampleRate, analyser.fftSize, 250, 4000))),
    highs_db: round1(binToDb(bandAvg(freqData, ctx.sampleRate, analyser.fftSize, 4000, 20000))),
    peak_hz: playing ? Math.round(peakIdx * binHz) : null,
    bpm,
    error: null,
  };
}
