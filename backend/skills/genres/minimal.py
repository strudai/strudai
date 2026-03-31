from backend.skills.base import Skill

minimal = Skill(
    name="genre:minimal",
    description="Minimal style — sparse, filtered, hypnotic repetition",
    prompt=(
        "Genre: Minimal\n"
        "Characteristics: Sparse, filtered, hypnotic repetition. "
        "120-130 BPM typical. Less is more — few elements, lots of space. "
        "Heavy use of filters and subtle modulation. "
        "Micro-variations over long periods. Click-house aesthetics."
    ),
    knowledge=(
        "Minimal example:\n"
        "```strudel\n"
        '$: "<[-3,0] [-4,0] [-2,0]>/4"\n'
        '  .sub(7).struct("x*4").n()\n'
        '  .s("supersaw").clip(1).lpf(300).lpe(2).lpd(.15)\n'
        '$: s("[bd [~ <~ bd>] sd]")\n'
        '  .bank("linndrum").lpf(1000).gain(.7)\n'
        '$: s("rd*3").hpf(8000).gain(.1)\n'
        'all(x=>x.room(.8).scale("f3:minor"))\n'
        "```\n"
        "Recommended samples: linndrum for drums, supersaw for tonal elements."
    ),
    priority=60,
)
