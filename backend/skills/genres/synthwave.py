from backend.skills.base import Skill

synthwave = Skill(
    name="genre:synthwave",
    description="Synthwave style — detuned saws, arps, retro",
    prompt=(
        "Genre: Synthwave\n"
        "Characteristics: Detuned saw arpeggios, retro 80s aesthetic. "
        "100-120 BPM typical. Supersaw pads with detune. "
        "Arpeggiated sequences. Filter sweeps with perlin noise. "
        "Distortion for grit."
    ),
    knowledge=(
        "Synthwave example:\n"
        "```strudel\n"
        '$: n("0 2 4 6 7 6 4 2").scale("<c3:major>/2")\n'
        '  .s("supersaw").distort(.7)\n'
        '  .superimpose(x => x.detune("<0.5>"))\n'
        '  .lpf(perlin.slow(2).range(100,2000)).gain(.3)\n'
        '$: "<a1 e2>/8".clip(.8).struct("x*8")\n'
        '  .s("supersaw").note()\n'
        "```\n"
        "Recommended samples: supersaw for leads/pads/bass."
    ),
    priority=60,
)
