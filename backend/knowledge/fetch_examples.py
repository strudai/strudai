"""Fetch Strudel code examples from awesome-strudel and strudel.cc.

Usage:
    uv run python -m backend.knowledge.fetch_examples
"""

import base64
import json
import re
import urllib.request
from urllib.parse import urlparse, unquote

from backend.knowledge.fetch import RAW_DIR

AWESOME_STRUDEL_URL = (
    "https://raw.githubusercontent.com/terryds/awesome-strudel/main/README.md"
)

SUPABASE_URL = "https://pidxdsxphlhzjnzmifth.supabase.co"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZHhkc3hwaGxoempuem1pZnRoIiwi"
    "cm9sZSI6ImFub24iLCJpYXQiOjE2NTYyMzA1NTYsImV4cCI6MTk3MTgwNjU1Nn0"
    ".bqlw7802fsWRnqU5BLYtmXk_k-D1VFmbkHMywWc15NM"
)


def _extract_strudel_links(markdown: str) -> list[tuple[str, str]]:
    """Extract (title, url) pairs for strudel.cc code links from markdown.

    Parses markdown table rows to get the song title from the first column
    and the strudel.cc URL from the link column.
    """
    links: list[tuple[str, str]] = []
    for line in markdown.splitlines():
        # Match table rows containing a strudel.cc link (skip header/separator rows)
        url_match = re.search(r"\[([^\]]*)\]\((https://strudel\.cc/[?#][^)]+)\)", line)
        if not url_match:
            continue
        url = url_match.group(2)
        # Extract song title from the first table column (if it's a table row)
        col_match = re.match(r"\|\s*(.+?)\s*\|", line)
        if col_match:
            title = col_match.group(1).strip()
        else:
            title = url_match.group(1)
        links.append((title, url))
    return links


def _fetch_hash_code(hash_id: str) -> str | None:
    """Fetch code from Supabase by short hash ID."""
    url = (
        f"{SUPABASE_URL}/rest/v1/code_v1"
        f"?hash=eq.{hash_id}&select=code"
    )
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    })
    with urllib.request.urlopen(req) as resp:
        rows = json.loads(resp.read().decode())
    if rows:
        return rows[0]["code"]
    return None


def _decode_hash_fragment(fragment: str) -> str:
    """Decode base64-encoded code from a URL hash fragment."""
    fragment = unquote(fragment)
    # Pad base64 if needed
    padding = 4 - len(fragment) % 4
    if padding != 4:
        fragment += "=" * padding
    return base64.b64decode(fragment).decode("utf-8")


def fetch_code(url: str) -> str | None:
    """Fetch strudel code from a strudel.cc URL."""
    parsed = urlparse(url)
    fragment = parsed.fragment
    query = parsed.query

    if fragment:
        try:
            return _decode_hash_fragment(fragment)
        except Exception as e:
            print(f"  Failed to decode hash: {e}")
            return None

    if query:
        hash_id = query.split("&")[0]
        try:
            return _fetch_hash_code(hash_id)
        except Exception as e:
            print(f"  Failed to fetch hash {hash_id}: {e}")
            return None

    return None


def fetch_examples() -> None:
    """Fetch all examples from awesome-strudel and write examples.md."""
    print(f"Fetching {AWESOME_STRUDEL_URL} ...")
    with urllib.request.urlopen(AWESOME_STRUDEL_URL) as resp:
        readme = resp.read().decode()

    links = _extract_strudel_links(readme)
    print(f"Found {len(links)} strudel.cc links")

    sections: list[str] = []
    for title, url in links:
        print(f"  Fetching: {title}")
        code = fetch_code(url)
        if code:
            sections.append(f"## {title}\n\n```strudel\n{code}\n```")
        else:
            print(f"  Skipped (no code found)")

    combined = "\n\n---\n\n".join(sections)
    RAW_DIR.mkdir(exist_ok=True)
    output = RAW_DIR / "examples.md"
    output.write_text(f"# Strudel Examples\n\n{combined}\n")
    print(f"Wrote {output} ({len(combined)} chars, {len(sections)} examples)")


if __name__ == "__main__":
    fetch_examples()
