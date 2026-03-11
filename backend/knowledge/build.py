"""Run the full knowledge pipeline: fetch docs, fetch examples, compress.

Usage:
    uv run python -m backend.knowledge.build
"""

from dotenv import load_dotenv

from backend.knowledge.compress import main as compress
from backend.knowledge.fetch import fetch_all
from backend.knowledge.fetch_examples import fetch_examples


def main() -> None:
    load_dotenv()
    fetch_all()
    fetch_examples()
    compress()


if __name__ == "__main__":
    main()
