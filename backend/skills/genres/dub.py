from backend.skills.base import Skill

dub = Skill(
    name="genre:dub",
    description="Dub / Reggae style — offbeat, heavy delay, spacious",
    prompt=(
        "Genre: Dub / Reggae\n"
        "Characteristics: Offbeat rhythms, heavy delay and reverb, spacious. "
        "70-90 BPM typical. Offbeat chords (skank). "
        "Deep bass. Delay throws on snare/percussion. "
        "Vibrato on melodic elements. Plenty of space."
    ),
    knowledge=(
        "Dub / Reggae example:\n"
        "```strudel\n"
        '$: n("<0*4 <[0 ~] [2 4]>>*2")\n'
        '  .s("supersaw").scale("<D#2:major>".toscale())\n'
        '  .attack(.1).clip(.95).gain(.5)\n'
        '$: s("<bd ~ sd ~ ~ bd sd ~>*8")\n'
        '  .bank("tr909").gain(.4)\n'
        '$: n("<[8 7] [7 ~] [7 6] [6 7]!2 ~>*4")\n'
        '  .scale("<D#2:major>".toscale())\n'
        '  .transpose(24).s("triangle").clip(.95)\n'
        '  .vib(10).vibmod(.5).gain(.5)\n'
        'all(x => x.room(.3))\n'
        "```\n"
        "Recommended samples: tr909 for drums, supersaw/triangle for melodic."
    ),
    priority=60,
)
