from backend.skills.base import Skill

idm = Skill(
    name="genre:idm",
    description="IDM / Glitch style — irregular, textured, experimental",
    prompt=(
        "Genre: IDM / Glitch\n"
        "Characteristics: Irregular rhythms, textured, experimental. "
        "Variable BPM. Complex time signatures and polyrhythms. "
        "Granular textures and noise. Unexpected pattern changes. "
        "White noise as rhythmic element."
    ),
    knowledge=(
        "IDM / Glitch example:\n"
        "```strudel\n"
        '$: n("<6 3> - [2 <1 0>] <0*2 ->")\n'
        '  .scale("c:major").s("kawai")\n'
        '  .lpf("<2000 1000 500>/2").gain(.5)\n'
        '$: s("white*16").clip(.5)\n'
        '  .speed("<<1@2 1 2> <2 3>>*16")\n'
        '  .hpf("<1000@2 2000 500>*8").gain(.4)\n'
        '$: s("<<bd bd*2> ~@14 <~@15 bd>>*8")\n'
        '  .lpf(1000).gain(.6).room(1)\n'
        "```\n"
        "Recommended samples: kawai for melodic, white noise for texture."
    ),
    priority=60,
)
