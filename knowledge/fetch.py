# Copyright (C) 2026 Douwe van der Heijden
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

"""Fetch Strudel docs and community examples into raw markdown files.

Usage:
    python knowledge/fetch.py              # fetch docs + examples
    python knowledge/fetch.py docs         # fetch only docs
    python knowledge/fetch.py examples     # fetch only examples
"""

import base64
import json
import re
import sys
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import unquote, urlparse

KNOWLEDGE_DIR = Path(__file__).resolve().parent
RAW_DIR = KNOWLEDGE_DIR / "raw"
PUBLIC_DIR = KNOWLEDGE_DIR.parent / "public"

# ---------------------------------------------------------------------------
# Docs: Strudel MDX pages from Codeberg
# ---------------------------------------------------------------------------

BASE_RAW_URL = (
    "https://codeberg.org/uzu/strudel/raw/branch/main"
    "/website/src/pages"
)


@dataclass
class Source:
    path: str
    pages: list[str]


SOURCES: dict[str, Source] = {
    "workshop": Source(
        path="workshop",
        pages=[
            "recap",
            "first-sounds",
            "first-notes",
            "first-effects",
            "pattern-effects",
            "getting-started",
        ],
    ),
    "understand": Source(
        path="understand",
        pages=["cycles", "pitch", "voicings"],
    ),
    "recipes": Source(
        path="recipes",
        pages=["arpeggios", "microrhythms", "recipes", "rhythms"],
    ),
    "learn": Source(
        path="learn",
        pages=[
            "mini-notation",
            "sounds",
            "notes",
            "effects",
            "signals",
            "samples",
            "synths",
            "tonal",
            "time-modifiers",
            "random-modifiers",
            "conditional-modifiers",
            "stepwise",
            "factories",
            "code",
            "accumulation",
            "getting-started",
            "mondo-notation",
        ],
    ),
}


def _clean_mdx(text: str) -> str:
    """Strip MDX artifacts from content, returning clean Markdown."""
    text = re.sub(r"^---\n.*?\n---\n?", "", text, count=1, flags=re.DOTALL)
    text = re.sub(r"^import\s+.*$\n?", "", text, flags=re.MULTILINE)

    # <MiniRepl> inside table cells → inline code
    def _table_minirepl(m: re.Match) -> str:
        return f"{m.group(1)}`{m.group(2)}`"

    text = re.sub(
        r"(\|[^|]*?)<MiniRepl\s[^>]*?tune=\{`([^`]*?)`\}[^/]*/\s*>",
        _table_minirepl, text,
    )

    # <MiniRepl> backtick tune → fenced code block
    def _minirepl(m: re.Match) -> str:
        return f"\n```strudel\n{m.group(1)}\n```\n"

    text = re.sub(
        r"<MiniRepl\s[^>]*?tune=\{`(.*?)`\}[^/]*/\s*>",
        _minirepl, text, flags=re.DOTALL,
    )

    # <MiniRepl> single-quote tune (table context)
    def _table_minirepl_sq(m: re.Match) -> str:
        tune = m.group(2).replace("\\n", "\n").replace("\n", "; ")
        return f"{m.group(1)}`{tune}`"

    text = re.sub(
        r"(\|[^|]*?)<MiniRepl\s[^>]*?tune=\{'(.*?)'\}[^/]*/\s*>",
        _table_minirepl_sq, text,
    )

    # <MiniRepl> single-quote tune (non-table)
    def _minirepl_sq(m: re.Match) -> str:
        tune = m.group(1).replace("\\n", "\n")
        return f"\n```strudel\n{tune}\n```\n"

    text = re.sub(
        r"<MiniRepl\s[^>]*?tune=\{'(.*?)'\}[^/]*/\s*>",
        _minirepl_sq, text,
    )

    text = re.sub(r"<MiniRepl\s[^/]*/\s*>", "", text)
    text = re.sub(r"</?Box[^>]*>", "", text)
    text = re.sub(r"</?QA[^>]*>", "", text)
    text = re.sub(r"<img[^>]*/?\s*>", "", text)
    text = re.sub(r"<a[^>]*>(.*?)</a>", r"\1", text, flags=re.DOTALL)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip() + "\n"


def _fetch_source(name: str) -> None:
    """Fetch one source group's MDX files, clean them, write to raw/{name}.md."""
    source = SOURCES[name]
    sections: list[str] = []
    for page in source.pages:
        url = f"{BASE_RAW_URL}/{source.path}/{page}.mdx"
        print(f"  {url}")
        with urllib.request.urlopen(url) as resp:
            raw = resp.read().decode()
        sections.append(_clean_mdx(raw))

    RAW_DIR.mkdir(exist_ok=True)
    output = RAW_DIR / f"{name}.md"
    output.write_text("\n\n---\n\n".join(sections))
    print(f"  → {output.name} ({sum(len(s) for s in sections)} chars)")


def fetch_docs() -> None:
    """Fetch all doc sources."""
    for name in SOURCES:
        print(f"[docs] {name}")
        _fetch_source(name)


# ---------------------------------------------------------------------------
# Examples: awesome-strudel, GitHub repos, strudel.cc Supabase
# ---------------------------------------------------------------------------

AWESOME_STRUDEL_URL = (
    "https://raw.githubusercontent.com/terryds/awesome-strudel/main/README.md"
)

GITHUB_REPOS = [
    {"owner": "eefano", "repo": "strudel-songs-collection"},
]

SUPABASE_URL = "https://pidxdsxphlhzjnzmifth.supabase.co"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpZHhkc3hwaGxoempuem1pZnRoIiwi"
    "cm9sZSI6ImFub24iLCJpYXQiOjE2NTYyMzA1NTYsImV4cCI6MTk3MTgwNjU1Nn0"
    ".bqlw7802fsWRnqU5BLYtmXk_k-D1VFmbkHMywWc15NM"
)


def _extract_strudel_links(markdown: str) -> list[tuple[str, str]]:
    """Extract (title, url) pairs for strudel.cc code links from markdown."""
    links: list[tuple[str, str]] = []
    for line in markdown.splitlines():
        url_match = re.search(r"\[([^\]]*)\]\((https://strudel\.cc/[?#][^)]+)\)", line)
        if not url_match:
            continue
        url = url_match.group(2)
        col_match = re.match(r"\|\s*(.+?)\s*\|", line)
        title = col_match.group(1).strip() if col_match else url_match.group(1)
        links.append((title, url))
    return links


def _fetch_hash_code(hash_id: str) -> str | None:
    """Fetch code from Supabase by short hash ID."""
    url = f"{SUPABASE_URL}/rest/v1/code_v1?hash=eq.{hash_id}&select=code"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    })
    with urllib.request.urlopen(req) as resp:
        rows = json.loads(resp.read().decode())
    return rows[0]["code"] if rows else None


def _decode_hash_fragment(fragment: str) -> str:
    """Decode base64-encoded code from a URL hash fragment."""
    fragment = unquote(fragment)
    padding = 4 - len(fragment) % 4
    if padding != 4:
        fragment += "=" * padding
    return base64.b64decode(fragment).decode("utf-8")


def _fetch_code(url: str) -> str | None:
    """Fetch strudel code from a strudel.cc URL (hash fragment or Supabase)."""
    parsed = urlparse(url)
    if parsed.fragment:
        try:
            return _decode_hash_fragment(parsed.fragment)
        except Exception as e:
            print(f"    Failed to decode hash: {e}")
            return None
    if parsed.query:
        hash_id = parsed.query.split("&")[0]
        try:
            return _fetch_hash_code(hash_id)
        except Exception as e:
            print(f"    Failed to fetch hash {hash_id}: {e}")
            return None
    return None


def _fetch_github_repo(owner: str, repo: str) -> list[str]:
    """Fetch .js files from a GitHub repo as example sections."""
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    req = urllib.request.Request(api_url, headers={"User-Agent": "StrudelGPT"})
    with urllib.request.urlopen(req) as resp:
        files = json.loads(resp.read().decode())

    sections: list[str] = []
    js_files = [f for f in files if f["name"].endswith(".js")]
    print(f"  Found {len(js_files)} .js files in {owner}/{repo}")

    for f in js_files:
        title = f["name"].removesuffix(".js")
        print(f"    {title}")
        try:
            with urllib.request.urlopen(f["download_url"]) as resp:
                code = resp.read().decode()
            sections.append(f"## {title}\n\n```strudel\n{code}\n```")
        except Exception as e:
            print(f"    Skipped: {e}")
    return sections


def fetch_examples() -> None:
    """Fetch all examples and write raw/examples.md."""
    sections: list[str] = []

    # awesome-strudel
    print(f"[examples] awesome-strudel")
    with urllib.request.urlopen(AWESOME_STRUDEL_URL) as resp:
        readme = resp.read().decode()
    links = _extract_strudel_links(readme)
    print(f"  Found {len(links)} strudel.cc links")
    for title, url in links:
        print(f"    {title}")
        code = _fetch_code(url)
        if code:
            sections.append(f"## {title}\n\n```strudel\n{code}\n```")

    # GitHub repos
    for repo in GITHUB_REPOS:
        print(f"[examples] {repo['owner']}/{repo['repo']}")
        sections.extend(_fetch_github_repo(repo["owner"], repo["repo"]))

    body = f"# Strudel Examples\n\n" + "\n\n---\n\n".join(sections) + "\n"
    RAW_DIR.mkdir(exist_ok=True)
    (RAW_DIR / "examples.md").write_text(body)
    # Also publish to public/ so the runtime can fetch the full set for the
    # example_search tool. (Same canonical content as raw/examples.md.)
    PUBLIC_DIR.mkdir(exist_ok=True)
    (PUBLIC_DIR / "strudel_examples.md").write_text(body)
    print(f"  → examples.md and public/strudel_examples.md ({len(sections)} examples)")


# ---------------------------------------------------------------------------
# Hydra: Strudel integration page, zachkrall examples, hydra-synth docs
# ---------------------------------------------------------------------------

HYDRA_RAW_DIR = RAW_DIR / "hydra"

STRUDEL_HYDRA_PAGE = (
    "https://codeberg.org/uzu/strudel/raw/branch/main"
    "/website/src/pages/learn/hydra.mdx"
)
ZACHKRALL_OWNER = "zachkrall"
ZACHKRALL_REPO = "hydra-examples"
ZACHKRALL_PATH = "examples"
HYDRA_DOCS_OWNER = "hydra-synth"
HYDRA_DOCS_REPO = "hydra-docs-v2"
HYDRA_DOCS_PATH = "content/docs/learning"


def _fetch_strudel_hydra_page() -> None:
    """Fetch the Strudel × Hydra integration page, clean MDX, save."""
    print(f"[hydra] strudel integration")
    print(f"  {STRUDEL_HYDRA_PAGE}")
    with urllib.request.urlopen(STRUDEL_HYDRA_PAGE) as resp:
        raw = resp.read().decode()
    cleaned = _clean_mdx(raw)
    HYDRA_RAW_DIR.mkdir(parents=True, exist_ok=True)
    output = HYDRA_RAW_DIR / "strudel-integration.md"
    output.write_text(cleaned)
    print(f"  → {output.name} ({len(cleaned)} chars)")


def _fetch_github_dir(owner: str, repo: str, path: str, ext: str) -> list[dict]:
    """List files in a GitHub repo directory (recursive). Returns list of dicts
    with 'name', 'path', 'download_url' for files matching ext."""
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    req = urllib.request.Request(api_url, headers={"User-Agent": "StrudelGPT"})
    with urllib.request.urlopen(req) as resp:
        items = json.loads(resp.read().decode())

    files: list[dict] = []
    for item in items:
        if item["type"] == "file" and item["name"].endswith(ext):
            files.append(item)
        elif item["type"] == "dir":
            files.extend(_fetch_github_dir(owner, repo, item["path"], ext))
    return files


def _fetch_zachkrall_examples() -> None:
    """Fetch hydra examples from zachkrall/hydra-examples/examples."""
    print(f"[hydra] {ZACHKRALL_OWNER}/{ZACHKRALL_REPO}")
    files = _fetch_github_dir(ZACHKRALL_OWNER, ZACHKRALL_REPO, ZACHKRALL_PATH, ".js")
    print(f"  Found {len(files)} .js examples")

    sections: list[str] = []
    for f in sorted(files, key=lambda x: x["name"]):
        title = f["name"].removesuffix(".js")
        print(f"    {title}")
        try:
            with urllib.request.urlopen(f["download_url"]) as resp:
                code = resp.read().decode()
            sections.append(f"## {title}\n\n```hydra\n{code.strip()}\n```")
        except Exception as e:
            print(f"    Skipped: {e}")

    HYDRA_RAW_DIR.mkdir(parents=True, exist_ok=True)
    output = HYDRA_RAW_DIR / "examples.md"
    output.write_text("# Hydra Examples\n\n" + "\n\n---\n\n".join(sections) + "\n")
    print(f"  → {output.name} ({len(sections)} examples)")


def _fetch_hydra_docs() -> None:
    """Fetch hydra-synth/hydra-docs-v2 learning content (recursive)."""
    print(f"[hydra] {HYDRA_DOCS_OWNER}/{HYDRA_DOCS_REPO}")
    files = _fetch_github_dir(HYDRA_DOCS_OWNER, HYDRA_DOCS_REPO, HYDRA_DOCS_PATH, ".md")
    print(f"  Found {len(files)} .md pages")

    sections: list[str] = []
    for f in sorted(files, key=lambda x: x["path"]):
        rel_path = f["path"].removeprefix(HYDRA_DOCS_PATH + "/")
        print(f"    {rel_path}")
        try:
            with urllib.request.urlopen(f["download_url"]) as resp:
                content = resp.read().decode()
            # Strip Hugo frontmatter if present
            content = re.sub(r"^---\n.*?\n---\n?", "", content, count=1, flags=re.DOTALL)
            sections.append(f"## {rel_path}\n\n{content.strip()}")
        except Exception as e:
            print(f"    Skipped: {e}")

    HYDRA_RAW_DIR.mkdir(parents=True, exist_ok=True)
    output = HYDRA_RAW_DIR / "learning.md"
    output.write_text("# Hydra Learning Docs\n\n" + "\n\n---\n\n".join(sections) + "\n")
    print(f"  → {output.name} ({len(sections)} pages)")


def fetch_hydra() -> None:
    """Fetch all Hydra sources into raw/hydra/."""
    _fetch_strudel_hydra_page()
    _fetch_zachkrall_examples()
    _fetch_hydra_docs()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or "docs" in args:
        fetch_docs()
    if not args or "examples" in args:
        fetch_examples()
    if not args or "hydra" in args:
        fetch_hydra()
