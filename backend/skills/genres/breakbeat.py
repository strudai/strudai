from backend.skills.base import Skill

breakbeat = Skill(
    name="genre:breakbeat",
    description="Breakbeat style — chopped breaks, sample manipulation",
    prompt=(
        "Genre: Breakbeat\n"
        "Characteristics: Chopped breakbeat samples, sample manipulation. "
        "130-150 BPM typical. Use .fit(), .chop(), .slice() for breaks. "
        "Layer chopped breaks with effects. Scrub and glitch techniques. "
        "External break samples from github:switchangel/breaks."
    ),
    knowledge=(
        "Breakbeat example:\n"
        "```strudel\n"
        "samples('github:switchangel/breaks')\n"
        "setcpm(150/4)\n"
        "\n"
        "$: stack(\n"
        '  s("breaks/2").fit().scrub(irand(16).div(16).seg(8))'
        '.almostNever(ply("2"))\n'
        ")\n"
        "```\n"
        "Recommended samples: github:switchangel/breaks for breakbeat loops."
    ),
    priority=60,
)
