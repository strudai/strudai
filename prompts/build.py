# Copyright (C) 2025 Douwe van der Heijden
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
