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

import type { CardComponentProps } from "nextstepjs";

export function OnboardingCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
}: CardComponentProps) {
  const isLast = currentStep === totalSteps - 1;
  const isFirst = currentStep === 0;

  const btn =
    "px-4 py-1.5 rounded-md text-[0.8rem] font-bold cursor-pointer border-0 transition-colors duration-300";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        color: "var(--text-primary)",
        width: "320px",
        fontFamily: "inherit",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem 0",
        }}
      >
        <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>
          {step.icon && <span style={{ marginRight: "0.4rem" }}>{step.icon}</span>}
          {step.title}
        </span>
        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          margin: "0.5rem 1rem 0",
          height: "2px",
          borderRadius: "9999px",
          background: "var(--surface-border)",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "9999px",
            background: "var(--accent)",
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Body */}
      <div
        style={{
          padding: "0.75rem 1rem",
          fontSize: "0.85rem",
          lineHeight: 1.6,
          color: "var(--text-secondary)",
        }}
      >
        {step.content}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1rem 0.75rem",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={skipTour}
          className={btn}
          style={{
            background: "transparent",
            color: "var(--text-muted)",
            visibility: isLast ? "hidden" : "visible",
          }}
        >
          Skip
        </button>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {!isFirst && (
            <button
              onClick={prevStep}
              className={btn}
              style={{
                background: "var(--input-bg)",
                color: "var(--text-secondary)",
                border: "1px solid var(--surface-border)",
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={nextStep}
            className={btn}
            style={{
              background: "var(--accent)",
              color: "#000",
            }}
          >
            {isLast ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
