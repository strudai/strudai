from backend.skills.base import Skill

hip_hop = Skill(
    name="genre:hip_hop",
    description="Hip Hop / Trap style — 808s, sparse kicks, bouncy",
    prompt=(
        "Genre: Hip Hop / Trap\n"
        "Characteristics: 808 bass, sparse kicks, snappy snares, bouncy. "
        "80-140 BPM typical (half-time feel common). "
        "TR-808 sounds are essential. Long 808 bass slides. "
        "Hi-hat rolls with varying subdivisions. Sparse arrangement."
    ),
    knowledge=(
        "Hip Hop / Trap example:\n"
        "```strudel\n"
        '$: s("<[bd -] [- - bd bd] [- bd] [-]>*4")\n'
        '  .bank("RolandTR808").gain(1.5)\n'
        '$: s("<[-] [cp] [-] [cp]>*4")\n'
        '  .bank("RolandTR808").gain(1.15)\n'
        '$: note("<[e2 -] [- - e2 f2] [- f1] [-]>*4")\n'
        '  .s("gm_synth_bass_2").decay(.5).lpf(1800)\n'
        'all(x=>x.cpm(120/4))\n'
        "```\n"
        "Recommended samples: RolandTR808 for drums, gm_synth_bass_2 for 808 bass."
    ),
    priority=60,
)
