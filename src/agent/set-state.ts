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
 * Runtime state for live set mode.
 *
 * Holds the active set plan and play-state; emits to subscribers when either
 * changes so the SetPanel and the ChatPanel bar-watcher stay in sync. Not
 * persisted — a set is session-scoped.
 */

export interface SetSection {
  bar: number;
  note: string;
}

export interface SetSong {
  name: string;
  bars: number;
  foundation: string;
  sections: SetSection[];
}

export interface SetPlan {
  title: string;
  genre: string;
  bpm: number;
  songs: SetSong[];
}

export interface SetMarker {
  absoluteBar: number;
  songIndex: number;
  sectionIndex: number;
  isFirstSectionOfSong: boolean;
}

interface SetState {
  plan: SetPlan | null;
  active: boolean;
  startedAtMs: number | null;
  lastFiredBar: number;
}

const state: SetState = {
  plan: null,
  active: false,
  startedAtMs: null,
  lastFiredBar: -1,
};

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((cb) => cb());
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

type SectionEditCb = (songIndex: number, sectionIndex: number, absoluteBar: number) => void;
const sectionEditListeners = new Set<SectionEditCb>();

export function subscribeToSectionEdits(cb: SectionEditCb): () => void {
  sectionEditListeners.add(cb);
  return () => {
    sectionEditListeners.delete(cb);
  };
}

export function getPlan(): SetPlan | null {
  return state.plan;
}

export function isActive(): boolean {
  return state.active;
}

export function getStartedAtMs(): number | null {
  return state.startedAtMs;
}

export function setPlan(plan: SetPlan): void {
  state.plan = plan;
  state.lastFiredBar = -1;
  if (state.active) state.startedAtMs = performance.now();
  emit();
}

export function clearPlan(): void {
  state.plan = null;
  state.active = false;
  state.startedAtMs = null;
  state.lastFiredBar = -1;
  emit();
}

export function startSet(): void {
  if (!state.plan) return;
  state.active = true;
  state.startedAtMs = performance.now();
  state.lastFiredBar = -1;
  emit();
}

export function stopSet(): void {
  state.active = false;
  state.startedAtMs = null;
  emit();
}

export function updateSectionNote(
  songIndex: number,
  sectionIndex: number,
  note: string
): void {
  const plan = state.plan;
  if (!plan) return;
  const song = plan.songs[songIndex];
  if (!song) return;
  const section = song.sections[sectionIndex];
  if (!section) return;
  section.note = note;
  emit();
  // Notify preplan invalidation listeners with the absolute bar of this section.
  const marker = allMarkers().find(
    (m) => m.songIndex === songIndex && m.sectionIndex === sectionIndex
  );
  if (marker) {
    sectionEditListeners.forEach((cb) => cb(songIndex, sectionIndex, marker.absoluteBar));
  }
}

export function totalBars(): number {
  if (!state.plan) return 0;
  return state.plan.songs.reduce((sum, s) => sum + s.bars, 0);
}

export function currentBar(): number {
  if (!state.plan || !state.active || state.startedAtMs === null) return 0;
  const elapsedMs = performance.now() - state.startedAtMs;
  return Math.floor((elapsedMs * state.plan.bpm) / 240_000);
}

/**
 * All marker offsets for the current plan, in absolute bar order. Builds a
 * fresh list each call — cheap (≤ ~30 entries) and avoids cache invalidation
 * after live edits to song.bars / section.bar.
 */
export function allMarkers(): SetMarker[] {
  if (!state.plan) return [];
  const markers: SetMarker[] = [];
  let songStart = 0;
  state.plan.songs.forEach((song, songIndex) => {
    const sorted = [...song.sections]
      .map((s, idx) => ({ ...s, originalIndex: idx }))
      .sort((a, b) => a.bar - b.bar);
    sorted.forEach((s, i) => {
      markers.push({
        absoluteBar: songStart + s.bar,
        songIndex,
        sectionIndex: s.originalIndex,
        isFirstSectionOfSong: i === 0,
      });
    });
    songStart += song.bars;
  });
  return markers.sort((a, b) => a.absoluteBar - b.absoluteBar);
}

/**
 * Returns markers whose absoluteBar is in (lastFiredBar, bar] and advances
 * lastFiredBar. The bar watcher calls this each tick to drain pending markers.
 */
export function markersUpTo(bar: number): SetMarker[] {
  const due = allMarkers().filter(
    (m) => m.absoluteBar > state.lastFiredBar && m.absoluteBar <= bar
  );
  if (due.length > 0) {
    state.lastFiredBar = due[due.length - 1].absoluteBar;
  }
  return due;
}

/**
 * Marker whose range contains the given bar (used for "currently playing"
 * highlight in SetPanel). Returns null before the first marker.
 */
export function activeMarker(bar: number): SetMarker | null {
  const markers = allMarkers();
  let active: SetMarker | null = null;
  for (const m of markers) {
    if (m.absoluteBar <= bar) active = m;
    else break;
  }
  return active;
}

export function getLastFiredBar(): number {
  return state.lastFiredBar;
}

/** Advance lastFiredBar to at least bar without going backwards. */
export function advanceLastFiredBar(bar: number): void {
  if (bar > state.lastFiredBar) {
    state.lastFiredBar = bar;
    emit();
  }
}
