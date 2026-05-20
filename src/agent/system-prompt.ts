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
