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
