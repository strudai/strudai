from backend.skills.base import Skill

dnb = Skill(
    name="genre:dnb",
    description="Drum & Bass style — fast breaks, sub-bass, high energy",
    prompt=(
        "Genre: Drum & Bass\n"
        "Characteristics: Fast breakbeats, heavy sub-bass, high energy. "
        "170-180 BPM typical. Syncopated kick/snare patterns. "
        "Rolling hi-hats. Deep sub-bass lines. Reese bass is classic. "
        "Breaks can be chopped from samples."
    ),
    knowledge=(
        "Drum & Bass example:\n"
        "```strudel\n"
        '$: s("<bd ~ bd ~!2 bd!2 ~!2 bd ~!2 bd>*2").gain(.8)\n'
        '$: s("<~!3 sd ~!6 sd ~!5 sd>*2").gain(1)\n'
        '$: s("hh*16").gain(.15)\n'
        '$: n("<0 0 [0 3] [-2 0]>*2")\n'
        '  .scale("c2:minor").s("sawtooth").lpf(500).decay(.2)\n'
        'all(x=>x.bank("RolandTR909").cpm(170/4).room(.2))\n'
        "```\n"
        "Recommended samples: RolandTR909 for drums, sawtooth for reese bass."
    ),
    priority=60,
)
