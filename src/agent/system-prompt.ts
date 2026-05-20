// Copyright (C) 2025 Douwe van der Heijden
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

import agent from "../../prompts/agent.md?raw";
import strudel from "../../prompts/strudel.md?raw";
import hydra from "../../prompts/hydra.md?raw";
import style from "../../prompts/style.md?raw";
import set from "../../prompts/set.md?raw";

const DIVIDER = "\n\n---\n\n";

/** Base prompt — always included. Suitable for prompt caching. */
export const BASE_PROMPT = [agent, strudel, hydra, style].join(DIVIDER);

/** Set-mode instructions — only included when a live set is active. */
export const SET_PROMPT = set;

/** Combined prompt (backward compat). */
export const STATIC_PROMPT = [BASE_PROMPT, SET_PROMPT].join(DIVIDER);
