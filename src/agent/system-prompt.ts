import agent from "../../prompts/agent.md?raw";
import strudel from "../../prompts/strudel.md?raw";
import hydra from "../../prompts/hydra.md?raw";
import style from "../../prompts/style.md?raw";
import set from "../../prompts/set.md?raw";

const DIVIDER = "\n\n---\n\n";

/** Static system prompt — agent rules, generated Strudel reference, Hydra
 * reference, hand-curated style rules, then live-set instructions. Style is
 * near the end so it stays in attention; set rules sit after as they only
 * apply when the user invokes the set tools. Suitable for prompt caching. */
export const STATIC_PROMPT = [agent, strudel, hydra, style, set].join(DIVIDER);
