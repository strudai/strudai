from backend.skills.base import Skill

house = Skill(
    name="genre:house",
    description="House style — groovy, offbeat hats, warm bass",
    prompt=(
        "Genre: House\n"
        "Characteristics: Groovy, offbeat hi-hats, warm bass, soulful. "
        "120-128 BPM typical. 4-on-the-floor kick with swing. "
        "Offbeat open hats are essential. Warm synth bass with movement. "
        "Room reverb for depth."
    ),
    knowledge=(
        "House example:\n"
        "```strudel\n"
        '$: s("bd*4").lpf(150).gain(1)\n'
        '$: s("[~ cp]*2").gain(.5)\n'
        '$: s("oh*16").gain(.08).release(0)\n'
        '$: note("<c2 [~ ~ c2 d2] [~ f1] ~>*4")\n'
        '  .s("gm_synth_bass_2").decay(.5).lpf(1800)\n'
        'all(x=>x.bank("RolandTR909").cpm(124/4).room(.3))\n'
        "```\n"
        "Recommended samples: RolandTR909 for drums, gm_synth_bass_2 for bass."
    ),
    priority=60,
)
