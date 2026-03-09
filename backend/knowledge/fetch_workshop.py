"""Fetch and clean Strudel workshop MDX files into a single Markdown reference.

Usage:
    uv run python -m backend.knowledge.fetch_workshop
"""

import re
import urllib.request
from pathlib import Path

BASE_URL = (
    "https://codeberg.org/uzu/strudel/raw/branch/main"
    "/website/src/pages/workshop"
)

# Ordered for maximum usefulness as context
PAGES = [
    "recap",
    "first-sounds",
    "first-notes",
    "first-effects",
    "pattern-effects",
    "getting-started",
]

OUTPUT = Path(__file__).resolve().parent / "workshop.md"


def clean_mdx(text: str) -> str:
    """Strip MDX artifacts from workshop content, returning clean Markdown."""
    # Remove YAML frontmatter
    text = re.sub(r"^---\n.*?\n---\n?", "", text, count=1, flags=re.DOTALL)

    # Remove import lines
    text = re.sub(r"^import\s+.*$\n?", "", text, flags=re.MULTILINE)

    # Handle <MiniRepl ... /> inside table cells FIRST
    # In tables, render as inline code to preserve table structure
    def _replace_table_minirepl(m: re.Match) -> str:
        prefix = m.group(1)  # everything before the MiniRepl in the cell
        tune = m.group(2)
        return f"{prefix}`{tune}`"

    text = re.sub(
        r"(\|[^|]*?)<MiniRepl\s[^>]*?tune=\{`([^`]*?)`\}[^/]*/\s*>",
        _replace_table_minirepl,
        text,
    )

    # Handle remaining <MiniRepl ... /> components (single or multiline)
    def _replace_minirepl(m: re.Match) -> str:
        tune = m.group(1)
        return f"\n```strudel\n{tune}\n```\n"

    text = re.sub(
        r"<MiniRepl\s[^>]*?tune=\{`(.*?)`\}[^/]*/\s*>",
        _replace_minirepl,
        text,
        flags=re.DOTALL,
    )

    # Handle MiniRepl with single-quote tune (e.g. tune={'...'})
    # Table context: inline code
    def _replace_table_minirepl_sq(m: re.Match) -> str:
        prefix = m.group(1)
        tune = m.group(2).replace("\\n", "\n")
        # For table cells, use inline code (collapse newlines to semicolons)
        inline = tune.replace("\n", "; ")
        return f"{prefix}`{inline}`"

    text = re.sub(
        r"(\|[^|]*?)<MiniRepl\s[^>]*?tune=\{'(.*?)'\}[^/]*/\s*>",
        _replace_table_minirepl_sq,
        text,
    )

    # Non-table single-quote tune
    def _replace_minirepl_sq(m: re.Match) -> str:
        tune = m.group(1).replace("\\n", "\n")
        return f"\n```strudel\n{tune}\n```\n"

    text = re.sub(
        r"<MiniRepl\s[^>]*?tune=\{'(.*?)'\}[^/]*/\s*>",
        _replace_minirepl_sq,
        text,
    )

    # Remove any remaining MiniRepl tags (e.g. tunes={...} variant)
    text = re.sub(r"<MiniRepl\s[^/]*/\s*>", "", text)

    # Strip <Box>, </Box>, <QA ...>, </QA> wrapper tags (keep inner content)
    text = re.sub(r"</?Box[^>]*>", "", text)
    text = re.sub(r"</?QA[^>]*>", "", text)

    # Strip <img ... /> tags
    text = re.sub(r"<img[^>]*/?\s*>", "", text)

    # Strip <a ...>...</a> tags (keep inner text)
    text = re.sub(r"<a[^>]*>(.*?)</a>", r"\1", text, flags=re.DOTALL)

    # Collapse 3+ consecutive blank lines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip() + "\n"


def fetch_and_save() -> None:
    """Fetch workshop MDX files from Codeberg, clean them, and write workshop.md."""
    sections: list[str] = []
    for page in PAGES:
        url = f"{BASE_URL}/{page}.mdx"
        print(f"Fetching {url} ...")
        with urllib.request.urlopen(url) as resp:
            raw = resp.read().decode()
        cleaned = clean_mdx(raw)
        sections.append(cleaned)

    combined = "\n\n---\n\n".join(sections)
    OUTPUT.write_text(combined)
    print(f"Wrote {OUTPUT} ({len(combined)} chars)")


if __name__ == "__main__":
    fetch_and_save()
