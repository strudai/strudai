import { useEffect, useReducer, useState } from "react";
import {
  activeMarker,
  clearPlan,
  currentBar,
  getPlan,
  isActive,
  startSet,
  stopSet,
  subscribe,
  totalBars,
  updateSectionNote,
} from "../agent/set-state";

/** Subscribe to set-state changes and re-render on any update. */
function useSetState() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribe(force), []);
}

export function SetPanel() {
  useSetState();
  const plan = getPlan();
  const active = isActive();
  const [expanded, setExpanded] = useState(false);

  // Tick the bar counter once per 250ms while a set is playing. Doesn't fire
  // triggers (ChatPanel does); it only nudges the component to re-render.
  const [, tickRender] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(tickRender, 250);
    return () => clearInterval(t);
  }, [active]);

  if (!plan) return null;

  const bar = currentBar();
  const total = totalBars();
  const marker = active ? activeMarker(bar) : null;
  const currentSong = marker ? plan.songs[marker.songIndex] : null;

  return (
    <div className="set-panel">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="set-panel-summary"
      >
        <span className="set-panel-title">
          {plan.title}
        </span>
        <span className="set-panel-meta">
          {active ? (
            <>
              <span className="set-panel-bar">
                bar {bar}/{total}
              </span>
              <span className="set-panel-current">
                {currentSong ? `· ${currentSong.name}` : ""}
              </span>
            </>
          ) : (
            <span className="set-panel-bar">
              {plan.bpm} BPM · {total} bars
            </span>
          )}
          <span className="tools-chevron">▸</span>
        </span>
      </button>

      <div className="set-panel-body-wrapper" data-open={expanded ? "" : undefined}>
        <div className="set-panel-body">
          <div className="set-panel-controls">
            <span className="set-panel-genre">
              {plan.genre} · {plan.bpm} BPM
            </span>
            <div className="set-panel-actions">
              {active ? (
                <button
                  type="button"
                  onClick={stopSet}
                  className="set-panel-btn"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startSet}
                  className="set-panel-btn set-panel-btn-primary"
                >
                  Start
                </button>
              )}
              <button
                type="button"
                onClick={clearPlan}
                disabled={active}
                className="set-panel-btn set-panel-btn-delete"
              >
                Delete
              </button>
            </div>
          </div>

          <ol className="set-panel-songs">
            {plan.songs.map((song, songIdx) => {
              const isCurrentSong = marker?.songIndex === songIdx;
              return (
                <li key={songIdx} className={isCurrentSong ? "set-song current" : "set-song"}>
                  <div className="set-song-header">
                    <span className="set-song-name">{song.name}</span>
                    <span className="set-song-bars">{song.bars} bars</span>
                  </div>
                  {song.foundation && (
                    <div className="set-song-foundation">{song.foundation}</div>
                  )}
                  <ul className="set-sections">
                    {song.sections.map((section, secIdx) => {
                      const isCurrent =
                        marker?.songIndex === songIdx &&
                        marker?.sectionIndex === secIdx;
                      return (
                        <li
                          key={secIdx}
                          className={isCurrent ? "set-section current" : "set-section"}
                        >
                          <span className="set-section-bar">@{section.bar}</span>
                          <span
                            className="set-section-note"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              updateSectionNote(
                                songIdx,
                                secIdx,
                                e.currentTarget.textContent ?? ""
                              )
                            }
                          >
                            {section.note}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
