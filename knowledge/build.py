"""Run the full knowledge pipeline: fetch docs, fetch examples, compress.

Usage:
    python knowledge/build.py

Requires: ANTHROPIC_API_KEY env var, pip install anthropic python-dotenv
"""

from dotenv import load_dotenv

from fetch import fetch_docs, fetch_examples
from compress import main as compress


def main() -> None:
    load_dotenv()
    fetch_docs()
    fetch_examples()
    compress()


if __name__ == "__main__":
    main()
