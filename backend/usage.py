"""Token usage tracking and cost estimation.

Cost table is per million tokens.  Swap or extend the COST_TABLE dict
to support other providers or models.
"""

COST_TABLE: dict[str, dict[str, float]] = {
    # Anthropic — $/M tokens
    "claude-haiku-4-5-20251001": {"input": 0.80, "output": 4.00},
    "claude-sonnet-4-6":         {"input": 3.00, "output": 15.00},
    "claude-opus-4-6":           {"input": 15.00, "output": 75.00},
}


def estimate_cost(model: str, input_tokens: int, output_tokens: int) -> float | None:
    """Return estimated cost in USD, or None if model not in table."""
    prices = COST_TABLE.get(model)
    if not prices:
        return None
    return (input_tokens * prices["input"] + output_tokens * prices["output"]) / 1_000_000
