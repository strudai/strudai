from backend.skills.base import Skill

techno = Skill(
    name="genre:techno",
    description="Techno style — 4-on-the-floor, driving, hypnotic",
    prompt=(
        "Genre: Techno\n"
        "Characteristics: 4-on-the-floor kick, driving, repetitive, hypnotic. "
        "128-135 BPM typical. Heavy use of TR-909 sounds. "
        "Filter sweeps for tension. Sparse melodic content. "
        "Build energy through layering and subtraction, not complexity."
    ),
    knowledge=(
        "Techno example:\n"
        "```strudel\n"
        '$: s("bd*4").gain(.8)\n'
        '$: s("[~ cp]*2").gain(.4)\n'
        '$: s("hh*16").gain(.1)\n'
        '$: note("<c2 eb2 g1 bb1>").s("sawtooth").lpf(800)\n'
        'all(x=>x.bank("RolandTR909").cpm(128/4))\n'
        "```\n"
        "Recommended samples: RolandTR909 for drums, sawtooth/supersaw for bass/leads."
    ),
    priority=60,
)
