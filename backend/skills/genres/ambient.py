from backend.skills.base import Skill

ambient = Skill(
    name="genre:ambient",
    description="Ambient style — slow pads, reverb, atmospheric",
    prompt=(
        "Genre: Ambient\n"
        "Characteristics: Slow evolving pads, heavy reverb, atmospheric. "
        "70-100 BPM typical. Warm pad sounds with long release. "
        "Melodic fragments over sustained chords. Space and silence matter. "
        "Use voicing() for smooth chord movement."
    ),
    knowledge=(
        "Ambient example:\n"
        "```strudel\n"
        '$: chord("<F C G F>/2").anchor("<F4 C4 G4 F4>/2")\n'
        '  .voicing().s("gm_pad_warm")\n'
        '  .release(2).room(.6).gain(.6)\n'
        '$: n("<0 1 2 [1 3 4] 5 4 [6 2 3] 1>")\n'
        '  .scale("g4:major").note()\n'
        '  .s("gm_piccolo").room(1).gain(.5)\n'
        'all(x=>x.cpm(88/4))\n'
        "```\n"
        "Recommended samples: gm_pad_warm for pads, gm_piccolo for melodic elements."
    ),
    priority=60,
)
