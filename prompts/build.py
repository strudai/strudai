"""Run the full prompt pipeline: fetch + compress for Strudel and Hydra.

Usage:
    python prompts/build.py

Requires: ANTHROPIC_API_KEY env var, pip install anthropic python-dotenv
"""

from dotenv import load_dotenv

from fetch import fetch_docs, fetch_examples, fetch_hydra
from compress import compress_strudel, compress_hydra, STRUDEL_OUTPUT, HYDRA_OUTPUT


def main() -> None:
    load_dotenv()

    # Strudel
    fetch_docs()
    fetch_examples()
    print("Compressing Strudel...")
    result = compress_strudel()
    STRUDEL_OUTPUT.write_text(result)
    print(f"Wrote {STRUDEL_OUTPUT} ({len(result)} chars)")

    # Hydra
    fetch_hydra()
    print("Compressing Hydra...")
    result = compress_hydra()
    HYDRA_OUTPUT.write_text(result)
    print(f"Wrote {HYDRA_OUTPUT} ({len(result)} chars)")


if __name__ == "__main__":
    main()
