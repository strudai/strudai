import agent from "../../prompts/agent.md?raw";
import strudel from "../../prompts/strudel.md?raw";
import hydra from "../../prompts/hydra.md?raw";
import style from "../../prompts/style.md?raw";

const DIVIDER = "\n\n---\n\n";

/** Static system prompt — agent rules, generated Strudel reference, Hydra
 * reference, then hand-curated style rules. Style is last so it's freshest
 * in the model's attention. Suitable for prompt caching. */
export const STATIC_PROMPT = [agent, strudel, hydra, style].join(DIVIDER);
