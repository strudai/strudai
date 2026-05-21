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

// Light German accent transformation. Ported from v1 backend/accent.py.
// Only the most recognisable swaps; runs on plain text and skips code blocks.

const RULES: Array<[RegExp, string | ((m: string) => string)]> = [
  // "th" at word start → "z" (the → ze, that → zat, this → zis)
  [/\b[Tt]h/g, (m) => (m[0] === m[0].toUpperCase() ? "Z" : "z")],
  // "w" at word start → "v" (with → viz, was → vas, what → vat)
  [/\bW/g, "V"],
  [/\bw/g, "v"],
];

export function germanise(text: string): string {
  // Preserve code blocks (``` ... ```) and inline code (` ... `)
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/);
  return parts
    .map((part) => {
      if (part.startsWith("`")) return part;
      let out = part;
      for (const [pattern, repl] of RULES) {
        out =
          typeof repl === "function"
            ? out.replace(pattern, repl)
            : out.replace(pattern, repl);
      }
      return out;
    })
    .join("");
}
