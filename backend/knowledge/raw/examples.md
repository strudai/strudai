# Strudel Examples

## Grimes – Music 4 Machines (cover)

```strudel
/*
  @title Grimes - Music 4 Machines (cover)
  @by KAIXI
  @details THIS IS MUSIC FOR MACHINES
           an intro to live coding on strudel
           ability to divide by 2 recommended
*/

// the song should be 135 beats per minute, in 4/4 time
// 1 beat = 1 quarter note
// 4 quarter notes = 1 measure = 1 "cycle"
// 135 quarter notes per minute = 135/4 cycles per min
let cpm = 135/4;

// load in the vocals
// these are just from the original song by grimes ai
samples({
  vox: 'vox_chorus.wav',
}, 'https://raw.githubusercontent.com/kai-xi/music4machines/main/samples/');

let drums = stack(
  // when you do sound() you are writing what goes in one cycle (measure)
  // you can write 4 quarter notes for the cycle like so:
  // sound("bd bd bd bd").bank("RolandTR909"),
  // or just writing it once and multiplying by 4
  // sound("<bd>*4").bank("RolandTR909"),
  // alternate between the sound and a rest using a '-'
  // sound("<- sd:10>*4").bank("RolandTR909"),
  // you could combine these like this
  // and layer a clap
  sound(`
    <bd>*4,
    <- sd>*4,
    <- cp:3>*4
  `).bank("RolandTR909"),
  // add a hihat on the off beat (8th note)
  sound("<- hh>*8").bank("LinnDrum").gain(.2),
  // add a shaker on every 8th note
  sound("<sh>*8").bank("RolandTR808").gain(.25)
);

// you can concatenate cycles to change up the notes on each measure
let bass = cat(
  "<c2>*4",
  "<g1>*4",
  // use flats with b and sharps with #
  "<eb1>*4",
  // !n will repeat the note n times
  // this is equivalent to "<eb1 eb1 f1 f1>*4"
  "<eb1!2 f1!2>*4",
  "<c2>*4",
  "<g1!2 bb1!2>*4",
  "<eb1>*4",
  "<f1>*4"
).note()
  .n(3).sound("gm_synth_bass_1")
  // use effects to modify a sound
  // low pass filter allows low frequencies to pass through
  .lpf(200).lpenv(5).lpa(.5).lps(.8).lpd(.1);

// you can also write notes based on a scale
// let scaleExample = cat(
//   "<3>*4",
//   "<0>*4",
//   "<-2>*4",
//   "<-2!2 -1!2>*4",
//   "<3>*4",
//   "<0!2 2!2>*4",
//   "<-2>*4",
//   "<-1!2>*4",
// ).n()
//   .scale("G:minor")
//   // lower by 2 octaves
//   .scaleTranspose(-7 * 2)
//   .n(3)
//   .sound("gm_synth_bass_1")
//   .lpf(200).lpenv(5).lpa(.5).lps(.8).lpd(.1);

let synth_arpeggio = cat(
  "<c3 c4 eb5 c3 c4 d5 c3 bb4>*8",
  "<g2 g3 bb4 g2 g3 a4 g2 g4>*8",
  "<eb2 eb3 g4 eb2 eb3 f4 eb2 g4>*8",
  "<eb2 eb3 g4 eb2 eb3 f4 f2 g4>*8",
  "<c3 c4 eb5 c3 c4 d5 c3 bb4>*8",
  "<g2 g3 bb4 g2 bb4 c5 bb2 g4>*8",
  "<eb2 eb3 g4 eb2 eb3 f4 eb2 g4>*8",
  "<f2 f3 g4 f2 f3 a4 f2 a4>*8",
).note()
  .n(1).sound("gm_pad_poly")
  .decay(.95).lpf(5000).lpenv(-3).lpa(.2)
  // add delay & reverb for an echo effect
  // format delay as "level:time:feedback"
  // delay level: relative volume (0 - 1)
  // delay time: in seconds
  // delay feedback: amt fed back into delay (0 - 1)
  .delay(".3:.225:.45")
  // room: reverb volume
  // rsize: reverb size
  .room(.8).rsize(2);

let synth_bass = cat(
  "<c3 c4 - c3 c4 - c3 ->*8",
  "<g2 g3 - g2 g3 - g2 ->*8",
  "<eb2 eb3 - eb2 eb3 - eb2 ->*8",
  "<eb2 eb3 - eb2 eb3 - f2 ->*8",
  "<c3 c4 - c3 c4 - c3 ->*8",
  "<g2 g3 - g2 g3 - bb2 ->*8",
  "<eb2 eb3 - eb2 eb3 - eb2 ->*8",
  "<f2 f3 - f2 f3 - f2 ->*8"
).note()
  .n(0).sound("gm_synth_bass_1")
  .attack(.1).decay(.25).release(.25)
  .lpf(2250).lpenv(2).lpa(.03).lpr(.2).lpd(.3)
  .gain(.5);

let synth_lead = cat(
  "<- - eb5 - - d5 - bb4>*8",
  "<- - bb4 - - a4 - g4>*8",
  "<- - g4 - - f4 - g4>*8",
  "<- - g4 - - f4 - g4>*8",
  "<- - eb5 - - d5 - bb4>*8",
  "<- - bb4 - bb4 c5 - g4>*8",
  "<- - g4 - - f4 - g4>*8",
  "<- - g4 - - a4 - a4>*8",
).note()
  .n(1).sound("gm_pad_metallic")
  .decay(.95).delay(".3:.225:.45")
  .room(.4).rsize(2).gain(.6);

// use custom samples based on the name you assigned them earlier
let intro_vocals = s("vox").room(.3).rsize(2);

// modify when the sample begins and ends
// this sample has 4 lines and we want the first one
// so start at 0 and cut it just after 1/4
let vocals01 = s("vox").begin(0).end(.25 + (.25 * .25 * .5))
  .attack(.25).delay(".25:.45:.4").room(.2).rsize(2);
// start the second one at 1/4 and cut it just after 2/4
let vocals02 = s("vox").begin(.25).end(.5 + (.25 * .25 * .5))
  .attack(.25).delay(".25:.45:.4").room(.2).rsize(2);

// create sections to divide up your song
let section00 = stack(
  intro_vocals.mask("<1 0 0 0 0 0 0 0>")
);

let section01 = stack(
  drums,
  bass,
  synth_arpeggio,
  synth_bass,
  synth_lead
);

let section02 = stack(
  drums,
  bass,
  synth_arpeggio,
  synth_bass,
  synth_lead,
  vocals01.mask("<1 0 0 0 0 0 0 0>"),
  vocals02.mask("<0 0 0 0 1 0 0 0>")
);

let end = stack(
  vocals01.mask("<1 0 0 0 0 0 0 0>")
);

// arrange the number of cycles for each section
arrange (
  [8, section00],
  [8, section01],
  [8, section02],
  [8, end]
).cpm(cpm);


// @version 1.0
```

---

## Charli XCX – 360 (cover / remix)

```strudel
/*
  @title Charli xcx - 360 (cover / remix)
  @by KAIXI
  @details Brat  and it's  the same  but 
           we're live coding so it's not
*/

let cpm = 120/4;

samples({
  camera_flash: '360_camera_flash.wav',
  vox: '360_vocals.wav'
}, 'https://raw.githubusercontent.com/kai-xi/360/main/samples/');

// section 1: intro
let lead_synth = arrange(
  [3, "<[[e3,b3] - c4 -] [e3 - f3 c4] [- c4 a4 -] [- - - -]>*4"],
  [1, "<[- - [g3,b3] -] [g3 - a3 c4] [- c4 c5 -] [c4 - g4 -]>*4"]
)
  .note().sound("sawtooth")
  .attack(0).decay(.25).sustain(0).release(.3)
  .lpf(300).lpq(0).lpenv(3).lpa(0).lpd(.15).lps(0)
  .delay(.2).delaytime(.25).delayfeedback(.1);

let section_1 = lead_synth;

// section 2: i went my own way and i made it
let bass = arrange(
  [2, "<[e2 -] [- - e2 f2] [- f1] [-]>*4"],
  [1, "<[- e2] [e2 - e2 f2] [- f1] [-]>*4"],
  [1, "<[g2 -] [g2 - g2 a2] [-] [-]>*4"],
)
  .note().sound("gm_synth_bass_2:0")
  .attack(0).decay(.5).release(.3)
  .lpf(1800);

let sub_bass = bass.transpose(-12);

let bass_drum = arrange(
  [2, "<[bd -] [- - bd bd] [- bd] [-]>*4"],
  [1, "<[- bd] [bd - bd bd] [- bd] [-]>*4"],
  [1, "<[bd -] [bd - bd bd] [-] [-]>*4"],
)
  .sound().bank("RolandTR808").gain(1.5);

let clap = arrange(
  [4, "<[-] [cp] [-] [cp]>*4"]
)
  .sound().bank("RolandTR808").gain(1.15);

let drums = stack(bass_drum, clap);
 
let section_2 = stack(lead_synth, bass, sub_bass, drums);

// section 3: drop down, yeah
let lead_saw = arrange(
  [4, "<[g4 - g4 g4] [g4 g4@2 g4] [g4 g4 g4@2] [g4@2 g4 g4]>*4"]
)
  .note().sound("gm_lead_2_sawtooth:0")
  .attack(0).decay(.3).sustain(0).release(.15)
  .lpf(3000).lpenv(10).lpa(0).lpd(.25).lps(0).lpr(0)
  .gain(.25);

let camera_flash = s("<[- [- camera_flash] - -] [-]>/4");
let section_3 = stack(
  lead_synth, 
  bass,
  sub_bass,
  drums.mask("<[1 [1 0] 1 1] [1 1 1 [1 0]]>/4"),
  lead_saw.mask("<1 [1 1 1 [1 0]]>/4"),
  camera_flash
);

// section 4: yeah, 360
let section_4 = stack(
  lead_synth, 
  bass.lpf("<20000 [20000 20000 20000 500]>/4"), 
  sub_bass.lpf("<20000 [20000 20000 20000 500]>/4"), 
  drums.mask("<1 [1 1 1 [1 0]]>/4")
);

// section 5: bumpin' that
let bass_modified = arrange(
  [1, "<[e2 -] [- - e2 f2] [- f1] [-]>*4"],
  [1, "<[e2 -] [- - e2 f2] [- f1] [e2 e2 e2 -]>*4"],
  [1, "<[e2 e2] [- - e2 f2] [- f1] [-]>*4"],
  [1, "<[g2 -] [g2 - g2 a2] [-] [-]>*4"],
)
  .note().sound("gm_synth_bass_2:0")
  .attack(0).decay(.5).release(.3)
  .lpf(1800);

let sub_bass_modified = bass_modified.transpose(-12);

let bass_drum_modified = arrange(
  [1, "<[bd -] [- - bd bd] [- bd] [-]>*4"],
  [1, "<[bd -] [- - bd bd] [- bd] [bd bd bd -]>*4"],
  [1, "<[bd bd] [- - bd bd] [- bd] [-]>*4"],
  [1, "<[bd -] [bd - bd bd] [-] [-]>*4"],
)
  .sound().bank("RolandTR808").gain(1.5);

let section_5 = stack(
  lead_synth, 
  bass_modified,
  sub_bass_modified,
  bass_drum_modified,
  clap.mask("<1 [1 1 1 [1 0]]>/4"),
  lead_saw.mask("<[1 1 1 [1 0]]>/4")
);

// instrumental arrangement
let instrumental = arrange(
  [4, section_1],
  [8, section_2],
  [8, section_3],
  [8, section_4],
  [4, section_5]
).cpm(cpm);

// slicing the vocals so it stops playing after each cycle
let vocals = s("vox")
  .slice(32, 
         "<0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31>")
  .cpm(cpm);

// cover (1st half of the song)
let cover = stack(instrumental, vocals);

// WORKING IT OUT ON THE REMIX !!!
// extending section 5
let section_5_ext = stack(
  lead_synth, 
  bass,
  sub_bass,
  bass_drum,
  clap.mask("<1 [1 1 1 [1 0]]>/4"),
  lead_saw.mask("<1 [1 1 1 [1 0]]>/4")
);

// bumpin' that
let vox_chop_1 = s("vox").slice(32, "<30 30 30 30>");
// ah-ah ah-ah-ah
let vox_chop_2 = 
    s("<- - - vox>").begin((27*4 + 1)/(32 *4)).end("0.89").late(1/4).gain(.8);

let remix_vox = arrange(
  [4, stack(vox_chop_1.mask("<1 1 1 1 1 1 1 0>"), vox_chop_2.mask("<0 1>/4"))]
);

// section 6
let hihats = arrange(
  [4, "<[hh - hh hh] [hh hh@2 hh] [hh hh hh@2] [hh@2 hh hh]>*4"]
)
  .sound().bank("RolandTR808").gain(.85);

let section_6 = stack(
  bass_modified, 
  sub_bass_modified, 
  bass_drum_modified,
  clap.mask("<1 [1 1 1 [1 0]]>/4"),
  hihats.mask("<1 [1 1 1 [1 0]]>/4")
);

// section 7
let bass_modified_2 = arrange(
  [1, "<[e2 -] [- - e2 f2] [- - f1 -] [-]>*4"],
  [1, "<[e2 -] [- - e2 f2] [- - f1 -] [e2 e2 e2 -]>*4"],
  [1, "<[e2 e2] [- - e2 f2] [- - f1 - ] [-]>*4"],
  [1, "<[g2 -] [g2 - g2 a2] [-] [-]>*4"],
).transpose(24).gain(1.1)
  .note().sound("gm_fx_brightness:4")
  .attack(0).decay(.5).release(.3)
  .lpf(8000).lpa(0).lpd(.08).lpq(10);

let section_7 = stack(
  bass_modified_2,
  sub_bass_modified,
  clap.mask("<1 [1 1 1 [1 0]]>/4")
);

// section 8
let bass_modified_3 = arrange(
  [1, "<[e2 -] [- - e2 f2] [- f1] [-]>*4"],
  [1, "<[e2 -] [- - e2 f2] [- f1] [e2 e2 e2 -]>*4"],
  [1, "<[e2 e2] [- - e2 f2] [- f1] [-]>*4"],
  [1, "<[g2 -] [g2 - g2 a2] [-] [-]>*4"],
).transpose(24)
  .note().sound("gm_lead_2_sawtooth:0")
  .attack(0).decay(.4).release(.3)
  .lpf(500).lpa(0).lpd(.03).lpq(0);

// 360
let vox_chop_3 = s("<vox - - ->*4").begin(79 / (32 * 4)).end((0.630)).gain(.5);

let section_8 = stack(
  bass_modified_3.lpf("<500 600 700 [[800 [1000 1200]] 1200]>"),
  sub_bass_modified,
  clap.mask("<1 [1 1 1 [1 0]]>/4")
);

// section 9
let section_9 = stack(section_5, hihats.gain(.8).mask("<1 [1 1 1 [1 0]]>/4"));

// down
let vox_chop_4 = s("vox").slice(32 * 4, "<- 50 - 50 - 50 - 50>*4");
// bumping that beat
let vox_chop_5 = s("<- - - - vox@2 vox@2>*4").begin(99 / (32 * 4)).end(0.7852)
  .delay(.2).delaytime(.25).delayfeedback(.1);
// i'm everwhere, i'm so julia
let vox_chop_6 = s("vox").slice(32 * 4, "<- - - - 89 90 91 92>*4").gain(.8);

arrange(
  [32, cover],
  [8, stack(section_5_ext, remix_vox.lpf("<1500 1500 1500 1500 1500 1500 1500 2000>"))],
  [8, stack(section_6)],
  [4, stack(section_7)],
  [4, stack(section_8, vox_chop_3.lpf("<600 1000 1350 0>").mask("<1 1 1 0>"))],
  [8, stack(
    section_9, 
    vox_chop_4.mask("<[1 0] [1 0] [1 0] [1 0]>/2"), 
    vox_chop_5.mask("<[0 1] [0 1] [0 1] [0 0]>/2"), 
    vox_chop_6.lpf(1500).lpa(.25).lpd(.25).pan(sine).mask("<[0 0] [0 0] [0 0] [0 1]>/2"), 
    vox_chop_2.mask("<0 1>/4")
  )],
  [8, stack(section_5, remix_vox.mask("<1 1 1 0 1 1 1 1>"))],
  [4, vox_chop_1.delay(.25).delayt(.5).dfb(.2).mask("<1 0 0 0>")]
)
  .cpm(cpm)
  .theme("<[greenText whitescreen] [blackscreen whitescreen]>/2")
  .color("<[#99CC3E #FFFFFF] [#99CC3E #000000]>")
  .fontFamily("x3270")
  .punchcard({
    vertical: 1, flipTime: 1, fold: 0, stroke: 1,
    playheadColor: 'rgba(0, 0, 0, 0)'
  });

// @version 1.2
```

---

## Bug From Heaven (cover)

```strudel
// "Bug From Heaven (wip)"
// song @by Tim Smith
// script @by eefano
setcps(100/60/2)
const standardtuning = [40,45,50,55,59,64];
const fingering = 
{A:"0:0:2:2:2:0",Am:"0:0:2:2:1:0",A7:"x:0:2:0:2:0",D:"x:0:0:2:3:2",Dm:"x:0:0:2:3:1",D7:"x:0:0:2:1:2",
 E:"0:2:2:1:0:0",Em:"0:2:2:0:0:0",E7:"0:2:2:1:3:0",G7:"3:2:0:0:0:1",C:"x:3:2:0:1:0",Dx:"x:0:0:2:3:2",Ds:"x:0:0:1:3:0"
};
const gstrum = 
{u:"<[[1,[~ 3@10],4]@2 ~]!2 [1,4,5]>*3", 
 v:"<[[0,[~ 3@10],5]@2 ~]!2 [0,3,4]>*3", 
 w:"<[[1,[~ 3@10],4]@2 ~]!2 [1,2,3]>*3", 
 x:"<[1,[~ 2@50],[~ ~ 4@50]]>",
 z:"<[[3,4,5] ~]*2>"
};
const bstrum = {u:"<[1 2]>", v:"<[2 1]>", w:"<[1 0]>", x:"~", z:"~"};

const gString = register('gString', (n, pat) => 
  (pat.fmap((v) => { if(v[n]=='x') return note(0).velocity(0);
      return note(v[n]+standardtuning[n]); } 
  ).innerJoin()));
const guitar = (strums,fingers,tuning=standardtuning) => (strums.pickOut(
    [fingers.pickOut(fingering).gString(0),fingers.pickOut(fingering).gString(1),fingers.pickOut(fingering).gString(2)
    ,fingers.pickOut(fingering).gString(3),fingers.pickOut(fingering).gString(4),fingers.pickOut(fingering).gString(5)]));
const split = register('split', (deflt, callback, pat) => callback(deflt.map((d,i)=> pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }))));

gtr: "<~@2 [[0 1]!2]@16 2@3 3@8>".pickRestart(["<Am:u:6 E:v:5 Am:u:4 E:v:3>","<Am:u:2 A:w:7>","<Am:u:2 E:x A:x>","<Dx:z Ds:z>"])
  .split([0,0,0],s=>s[0].layer(
  x=>guitar(s[1].pick(gstrum),x).s("gm_acoustic_guitar_steel:1").release(.1).gain(.8).room(.5).hpf(300).lpf(5000).late(1/64),
  x=>guitar(s[1].pick(bstrum),x).s("gm_pizzicato_strings:1").transpose(-12).release(.1).gain(.65).room(.6).lpf(1000),
  x=>chord(x).anchor("g5").voicing().s("gm_string_ensemble_1").gain(.1).room(1).layer(p=>p.pan(1),p=>p.pan(0).late(.1))
    ).transpose(s[2]))

drm: "< 0@2 [0,1]@17 2 ~ 0@8>".pick([
     s("<rd>*2"),
     s("<~ sd>*2"),
     s("<rd>")
  ]).bank("BossDR110").room(1).lpf(1800).gain(.6)

uff: "<[gm_acoustic_guitar_steel:1,gm_string_ensemble_1,gm_pizzicato_strings:1] ~@1000>".gain(0)
// @version 1.2
```

---

## Stranger Things (Netflix Series)

```strudel
setcps(0.7);

p1: n("0 2 4 6 7 6 4 2")
  .scale("<c3:major>/2")
  .s("supersaw")
  .distort(0.7)
  .superimpose((x) => x.detune("<0.5>"))
  .lpenv(perlin.slow(3).range(1, 4))
  .lpf(perlin.slow(2).range(100, 2000))
  .gain(0.3);
p2: "<a1 e2>/8".clip(0.8).struct("x*8").s("supersaw").note();
// @version 1.2
```

---

## Radiohead – Pyramid Song

```strudel
// "Pyramid Song (wip)"
// song @by Radiohead
// script @by eefano
setcps(104/60/4)
const split = register('split', (deflt, callback, pat) => callback(deflt.map((d,i)=> pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }))));

let chr = {X:"f#2,c#3,a#3,c#4,f#4", Y:"g2,d3,b3,d4,f#4", Z:"a2,e3,a3,c#4,f#4", J:"g2,d3,b3,d4,g4", K:"f#2,c#3,a#3,c#4,g4",
           V:"f#2,c#3,a3,c#4,f#4", W:"e2,b2,g#3,b3,f#4"}

piano: "<[i1 i2 i3 i4] ooooh [v1 v2]!4 ooooh@2 [v1 v2]!3 [v1 v3] [v3 v2] [i1 i2 i3 i2] [i3 i2 i3 i2] end>/8".pickRestart(
 {i1:`<[[X:.6 X:.8]@3 Y:.5@2 [Z:.5 Z:.5]@3]>/2`, i2: `<[[Z:.4 Y:.4]@3 Y:.3@2 [J:.6 J:.9]@3]>/2`, 
  i3:`<[[K:.8 X:.6]@3 Y:.5@2 [Z:.5 Z:.5]@3]>/2`, i4: `<[[Z:.4 Y:.4]@3 Y:.4@2 [Y:.4 Y:.7]@3]>/2`,
  ooooh:`<[[X X]@3 Y@2 [Z Z]@3] [[Z Y]@3 Y@2 [X X]@3] [[X X]@3 Y@2 [Z Z]@3] [[Z Y]@3 Y@2 [Y Y]@3]>/2`,
  v1:`<[[X X]@3 Y@2 [Z Z]@3] [[Z Y]@3 Y@2 [X X]@3]>/2`,
  v2:`<[[V V]@3 W@2 [W W]@3] [[Y Y]@3 Y@2 [Y Y]@3]>/2`,
  v3:`<[[V V]@3 W@2 [W W]@3] [[Y Y]@3 X@2 [X X]@3]>/2`,
  end:`<X:1>/8`, 
 }).split([0,.5],(x)=>x[0].pickOut(chr).velocity(x[1])).note().piano().gain(0.8).room(.6)

ooooh: "<~ 0 ~@4 0@2 ~@8>/8".pickRestart([
  "<f#5@11 e5:-2 g#5:4 e5:-4 [f#5:2 ~] [~ g#5 e5] f#5@4 g#5 f#5 e5 d5 c#5@5 ~@3>*4"
  ]).split([0,0],(x)=>x[0].penv(x[1])).patt(0.04).s("triangle").attack(.08).release(.08).note().vmod(.1).vib(5).gain(0.3).lpf(2000).room(1.5)

drums: "<~@6 [~@15 0@15 1@2] [2,3]@8 3>/8".pick([
  "<[bd,rd] ~ [~ sf*3] [bd,rd] ~ [~ sf*3] [bd,rd] ~ ~ [~ sf*3] [bd,rd] ~ [~ sf*3] [bd,rd] ~ [~ sf*3]>*8",
  "<[sd sf bd] [sf sd sd]>*4",
  "<[rd*4],[<~ ~ ~ bd ~ bd ~ ~ bd ~ bd ~ ~ bd ~ bd> <~!14 sf!2> <~ sd bd ~ sd ~ sd bd ~ sd ~ ~ sd ~ sd sd>]*4>",
  "<cr,bd>/8",
]).pickOut({
  bd: s('bd').bank('Linn9000').lpf(1000),
  sd: s('sd').bank('RolandMT32').velocity(.5),
  sf: s('sd').bank('RolandMT32').velocity(.2),
  rd: s('rd').bank('Linn9000').velocity(0.3).hpf(8000),
  mt: s('mt').bank('RolandMT32'),
  lt: s('lt').bank('RolandMT32'),
  cr: s('cr').bank('Linn9000').speed(0.4).velocity(0.3).hpf(4000),
}).room(.2).gain(0.5)
// @version 1.2
```

---

## Corona – The Rhythm of the Night

```strudel
// "The Rhythm Of The Night" - Work In Progress
// song @by Corona
// script @by eeefano
setDefaultVoicings('legacy')
const as = register('as', (mapping, pat) => { mapping = Array.isArray(mapping) ? mapping : [mapping];
  return pat.fmap((v) => { v = Array.isArray(v) ? v : [v, 0];
    return Object.fromEntries(mapping.map((prop, i) => [prop, v[i]])); }); });

const crdpart = "<~ 0@10 1@24 0@19>".pickRestart(
["Ab Cm Bb F@2".slow(5)
,"Bb@3 Ab@3 Cm@2".slow(8)
]);
stack 
("<0 1@4 0 1@4 ~@8 2 3@7 2 3@7 0 1@4 0 1@4 0 1@4 0 1@4>".pickRestart(
  ["~ [4@3 ~]!3 7:5 6 4 3"
  ,"2:-1 0:-2 ~@4 6:1 4:-1 6 4:2 ~@4 [4:2 3]@3 ~@6 4 7:5 6 [4@2 ~] [3:-1 2@3]@2 0 ~@2".slow(4)
  ,"~@6 [6 ~]!2"
  ,"6 5@0.5 [5 ~] [4 ~]!2 [3 ~] 3:2@1.5 ~@7 6@2 6:2 [5 ~ ]!2 4 3@2 4 2 0:-2 ~@7 [0 2]@3 3@2 4 6:4 4:-4 ~ 0 2 0 4 ~ 0 0:2@2 ~@7".slow(7)
]).as("n:penv").scale("c4:minor").patt("0.07").s("gm_lead_1_square").room(0.4).delay(0.3).dfb(0.35).dt(60/128).gain(0.85)

,crdpart.chord().anchor("F4").voicing().s("gm_synth_strings_1").color("blue").gain(0.4)

,"<~@11 1@23 ~ 0@19>".pickRestart(
  ["2 ~@2 2 ~@2 2 ~@3 2 ~@3 2 ~"
  ,"[2 ~@2 2 ~@2 2 ~]!2"
]).n().chord(crdpart).anchor(crdpart.rootNotes(2)).voicing().s("gm_synth_bass_1").lpf(1500).room(0.5).color("green").gain(0.9)

,"<~@11 1@8 ~@16 0@19>".pickRestart(
  ["<5 7 6 3!2> ~ 9 ~ 10 ~ ~ 12 ~ 11 ~ 10 ~ 11 9 ~"
  ,"<6!3 5!3 7!2> ~ 9 ~ 10 ~ ~ 12 ~ 11 ~ 10 ~ 11 9 ~"
]).scale("c3:minor").note().s("gm_lead_2_sawtooth").room(0.3).delay(0.3).dfb(0.5).dt(60/128*2).color("red").gain(0.6)

,"<[2,3] ~@10 0@6 [0,1]@2 [0,2] 0@5 [0,1]@2 [0,2] 0@6 [2,3] 0@8 [0,1]@2 [0,2] 0@8>".pickRestart(
 [stack(s("bd*4").gain(0.8),s("[~ oh]*4").gain(0.14),s("hh*16").gain(0.09),s("[~ cp]*2").gain(0.4))
 ,s("[~ sd!3]!4 [sd*4]!4").slow(2).gain(run(32).slow(2).mul(1/31).add(0.1).mul(0.4))
 ,s("cr").gain(0.2)
 ,s("bd").gain(0.8)
 ]).bank("RolandTR909").room(0.2).color("yellow").velocity(1)
 
).cpm(128/4)
// @version 1.2
```

---

## Technotronic – Pump Up The Jam (cover)

```strudel
// "Pump Up The Jam" - Work In Progress
// song @by Technotronic
// script @by eefano
const pickRestart = register('pickRestart', (arr, pat) => pat.pick(arr.map((x)=>x.restart(pat.collect().fmap(v=>v+1)))))
const as = register('as', (mapping, pat) => { mapping = Array.isArray(mapping) ? mapping : [mapping];
  return pat.fmap((v) => { v = Array.isArray(v) ? v : [v, 0];
    return Object.fromEntries(mapping.map((prop, i) => [prop, v[i]])); }); });
stack("~"
,"<~@8 0@4 1@4 ~@8>".pickRestart(
  ["[u [u e] a [u i] [u ~] [a u] [i a] [o@3 i] ~ [a e] [a i] [o@3 i] [~ u@2 a] [e e] [o i] [o@3 i]]/4"
  ,"~ [u i] [u ~ ~ a] [i i@2 o]"
]).vowel().s("z_sawtooth").clip(0.8).gain(1.4)
             
,"<~@16 0@8>".pickRestart(
  ["[ ~@2 4 [5:1 ~] ~ [~ 0] [3:-1@5 3:1@2 2]@2 ~ [4@3:1 3 3@3 2 2@3 3 4:1@3 0 0@2 2:2@2]@5 [~ ~ 0@2 ~ 0@2 -2:-3]@2 ]/4"
]).as("n:penv").scale("c4:minor").clip(0.90).patt("0.15").s("square").delay(0.3).dfb(0.3).dt(60/128).gain(0.7)
            
,"<0@32>".pickRestart(
  ["[~@13 [[~@3 [0,-2,-4]@2 ~]@3 [0,-2,-4] [1,-1,-3]!2]@3 ]/4"
]).scale("c4:minor").note().clip(0.7).s("z_sawtooth").color("red").adsr("0.07:.1:0.6:0.1").gain(0.5)

,"<0@12 0 1 ~@2 3@8>".pickRestart(
  ["[0 ~@23]/2"
  ,"~@2 [~ [e2 ~]] [[0 2] ~]"
  ,"[0 ~ ~ 0 ~ ~ 0 ~] <[[~ [0 1]] [2 ~]] ~>"
]).scale("c2:minor").note().clip(0.9)
      .layer(x=>x.s("z_sawtooth").delay(0.6).dfb(0.5).dt(60/125*3/4).pan(0.55).gain(0.8)
            ,x=>x.s("z_square").lpf(300).lpe(2).lpa(-1.5).lpd(0.1).lpr(0.05).pan(0.45).gain(1)).color("green")

,"<0@4 [0,1]@12 [0,1,2]@4 [0,1,2,3]@4>".pickRestart(
 [stack(s("oh*16").pan(0.45).gain("[0.08 0.16]*4").release(0),s("hh*4").pan(0.7).gain(0.20))
 ,s("bd*4").lpf(150).gain(1)
 ,s("[~ cp]*2").gain(0.5).pan(0.25)
 ,s("[~ rd]*4").gain(0.15).release(0).hpf(1500).pan(0.75)
 ,s("[~ sd!3]!4 [sd*4]!4").slow(2).gain(run(32).slow(2).mul(1/31).add(0.1).mul(0.4))
 ,s("cr").gain(0.2)
 ,s("bd").gain(0.8)
 ]).bank("RolandTR909").color("yellow").velocity(0.7)
 
).cpm(124.5/4).room(0.3)


// @version 1.2
```

---

## Happy Birthday

```strudel
// HAPPY BIRTHDAY
setDefaultVoicings('legacy')

const chrds = "F@3 C@6 F@6 Bb@3 F@2 C F@3".slow(8);

stack(
"[C4@3 C4] D4 C4 F4 E4@2 [C4@3 C4] D4 C4 G4 F4@2 [C4@3 C4] C5 A4 F4 E4 D4 [Bb4@3 Bb4] A4 F4 G4 F4@2".slow(8).early(1/3).note().s("gm_harmonica").gain(0.4).color('green'),
chord(chrds).anchor("G4").struct("x*3").voicing().piano().gain(0.2).color('yellow'),
n("2 ~ ~ 2 1 ~").chord(chrds).anchor(chrds.rootNotes(2)).voicing().s("gm_electric_bass_finger").lpf(190).gain(1).color('blue'),

s("hh*3, <bd ~>, ~ ~ rim").bank("KorgDDM110").gain(0.2)
              
).cpm(120/4).room(0.3)//.pianoroll();
// @version 1.2
```

---

## Dmitri Shostakovich – Waltz #2

```strudel
// "Waltz #2" (cps function demo)
// composed @by Dmitri Shostakovich
// script @by eefano
setDefaultVoicings('legacy')

melody: "<~@4 0@16 1@7 2@11.5 ~@3.5>".pickRestart([
  `<4 [2@2 1] [0@4 0 1]@2 [2 0 2] [4@2 5] 4 3 
    3 [1@2 0] [0b@4 -3 0b]@2 [1 0b 1] [3 4 5] 4b 4>`,
    "<[9,7] [[8,6]@2 [7,5]] [[6,4]@2 [5,3]] [3,0] [8,6] [[7,5]@2 [6,4]] [6,4]>", 
  "<[~ [2 ~] [3 ~]] [[4 ~] [4 3] [4 5]] [[3 ~] [3 2] [3 4]] [[2 ~] ~ [4 ~]] > ".sub("<0 0 [0,2]>/4") ])
      .scale("c4:minor").note().s("gm_oboe:2").gain(0.7)._pianoroll({minMidi:10})
   
piano: "<0@28 1@10 0@4>".pickRestart([
     n("<<0 -1> [4,5]!2>*3").chord("<Cm@10 Fm@4 G@4 Cm@4 Fm@2 Bb@2 Eb Ab>"),
     n("<3 <[4,5] > ~>*3").chord("<G Ab Cm Ab>")
          ]).anchor('f2').mode('root').voicing().piano()._pianoroll()

tempochanges: cps(sine.segment(32).slow(16).mul(30).add(160).div(60*3)).gain(0)

all(x=>x
  //.ribbon(24,16)
  .room(0.6))
// @version 1.2
```

---

## Old McDonalds

```strudel
// old mcdonalds has bad samples
setDefaultVoicings('legacy')
const beast = ["crow","space","gm_bird_tweet","space:4","clash","space:1"]
const bsequ = "<~@2 0 ~@3 1 0 ~@3 2 1 0 ~@3 3 2 1 0 ~@3 4 3 2 1 0 ~@2>".pick(beast)
const chrds = "F [A# F] [F C] [F@3 ~]";
const strct = "[[x ~]!2] [[x ~]!2 x  ~]";
const bstrc = "[[~ x]!2] [[~ x]!2 ~  x]";
const trnsp = "<0!4 1!5 2!6 3!7 4!8 ~>";

"<[0,3] [0,1] 2 0!2 [0,1] [2,1] 2 0!2 [0,1] [2,1]!2 2 0!2 [0,1] [2,1]!3 2 0!2 [0,1] [2,1]!4 2 [0@7 ~] ~>".pick(
[stack(
  "F5*2 [F5 C5] D5*2 C5 A5*2 G5*2 F5@2".note().clip(0.9),
  chord(chrds).anchor("G4").voicing().struct("[~ x]*4 [[~ x]*2 [x@3 ~]]").gain(0.6),
  n("[2 1]*4").chord(chrds).anchor("F2").voicing().struct("[x ~]*8").gain(0.6),
 ).piano().add(note(trnsp))
,"~@7 [C5 D5]".note().clip(0.8).piano().add(note(trnsp)) 
,stack(
  stack(
  "[[F5*2 ~]!2] [[F5 ~]!2 F5*2 ~]".note(),
 chord("F").anchor("G4").voicing().struct(strct).gain(0.6),
  "F2".struct(strct).note().gain(0.6)
    ).clip(0.8).piano().add(note(trnsp)),
 "F".struct(bstrc).s(bsequ).release(0))
 
,"0,1,2,3,4,5".pick(beast).gain(0) // samples preload trick
]).cpm(140/8).room(0.4)
// @version 1.2
```

---

## New Order - Blue Monday

```strudel
/*
  @title New Order - Blue Monday (cover / remix)
  @by Lewis
*/

setcpm(130/4)

const kick1 = sound("<[bd bd [bd*4] [bd*4]] [bd*4]>").bank("linn").decay(0.15)
const kick2 = sound("[bd*4]").bank("linn").decay(.15)

const hats1 = sound("[oh oh*2]*4").bank("dmx").decay(.1).gain(.12)
const hats2 = sound("[- oh]*4").bank("dmx").decay(.2).sustain(0.1).gain(.12)

const snare = stack(
  sound("[- sd]*2").bank("linn").gain(.5),
  sound("[- cp]*2").bank("linn").gain(.1)
)

const drums1 = stack(kick1,hats1,snare)
const drums2 = stack(kick2,hats2,snare)

const drums3 = stack(
  sound("bd bd bd bd -").bank("linn").decay(0.15),
  sound("oh oh oh oh -").bank("dmx").decay(0.2).sustain(0.1).gain(0.2)
)

const bass1 = stack(
  note("<<[f1 f2*2]*2 [g1 g2*2]*2> [c1 c2*2]*2 [d1 d2*2]*2 [d1 d2*2]*2>*2"),
).sound("<sine, gm_synth_bass_1>").decay(.2).sustain(.1)

const bass2 = stack(
  note("<<[f1 f2]*2 [g1 g2]*2> [c1 c2]*2 [d1 d2]*2 [d1 d2]*2>*2"),
).sound("<sine, gm_synth_bass_1>").decay(.2).sustain(.4)

const synth = stack(
  n("<[[2 ~] [2 ~] 2 3] [[3 ~] [3 ~] 3 3]>@4 [-1 ~] -1 -1 [0 ~] 0 0 [0 ~] 0 0 [0 ~] 0 0"),
).sound("<gm_lead_2_sawtooth>").slow(2).scale("d4:minor").attack(.05).hpf("<1000 2000>*12").gain(".4")

stack(
  arrange([16,kick1],[16,drums1],[2,drums3],[16,drums2],[1,silence]).room(0.1),
  arrange([8,silence],[24,synth],[19,silence]).room(0.05),
  arrange([16,silence],[16,bass1],[2,silence],[16,bass2],[1,silence])
  )._pianoroll()
```

---

## Birds of a Feather - Billie Eilish (Remake)

```strudel
/*
@title BIRDS OF A FEATHER (REMAKE)
@by saga_3k <https://linktr.ee/saga3k>
@license CC BY-NC-SA
*/

setcps(105/60/4) 

// melody (1 bar loop)
let m1 = 
note("<[D@3 A@2 ~ D@2] [Cs@2 ~ A@2 ~ Cs@2]>".add("12,24")).s("gm_kalimba:3").legato(1.5).fast(2)
.attack(.025).release(.2).lp(1000)
.room(".6:2").postgain(1.5).color('#4dbcf4')._pitchwheel({edo:12,hapRadius:3,thickness:3,circle:1})

// melody with guitar layer (1 bar loop)
let m2 = 
note("<[D@3 A@2 ~ D@2] [Cs@2 ~ A@2 ~ Cs@2]>".add("12,24"))
.layer(
x=>x.s("gm_kalimba:3").legato(1.5).attack(.025).release(.2).lp(1000).room(".6:2").postgain(2),
x=>x.s("gm_acoustic_guitar_steel:6").clip(1.5).release(.2).room(".6:2").postgain(1)
).fast(2)

// drum pattern (1 bar loop)
let dr =
stack( s("[bd:<1 0>(<3 1>,8,<0 2>:1.3)] , [~ sd:<15>:2.5]").note("B1").bank("LinnDrum")
.decay(.3).room(".3:2").fast(2),

s("[LinnDrum_hh(<3 2>,8)]").hp("1000").lp("9000").decay(.3).velocity([".8 .6"]).room(".3:2").fast(2),
s("sh*8").note("B1").bank("RolandTR808").room(".6:2").velocity("[.8 .5]!4").postgain(1.5).fast(2))._pianoroll({vertical:0,flipTime:1,fill:0,labels:1})

// chord progression (8 bar loop)
let chord =
n(`<[[0,2,4,6] ~!3] ~ ~ ~
[[-1,0,2,4] ~!3] ~ ~ ~ 
[[1,3,5,7] ~!3]  ~ ~ ~
[[-2,0,1,3] ~!3]  ~ [[-2,-1,1,3] ~!3] ~ 
>`).scale("D:major").s("gm_epiano1:6")  //gm_epiano1:6 or gm_bandoneon:6
.decay(1.5).release(.25).lp(2500).delay(".45:.1:.3").room(".6:2")
.postgain(1.5).fast(2)

// bass root note (8 bar loop)
let bass1note =
n("<0 -1 1 -2>/2").scale("D1:major").s("gm_lead_8_bass_lead:1")
.lp(800).clip(.1).attack(.2).release(.12)
.delay(".45:.1:.3").room(".6:2")
.postgain(1.3)._pianoroll({labels:1})

// bassline fast guitar (8 bar loop)
let bassline =
note("<[D2!28 Cs2!4] B1*32 [E2!28 D2!4] A1*32>/2").s("gm_electric_bass_pick")
.decay(.5).velocity(rand.range(.7,1).fast(4))
.lp(1000).compressor("-20:20:10:.002:.02").room(".6:2")
.postgain(1.5).color('white')._scope({thickness:2})

// chord progession organ layer (8 bar loop)
let chordOrg =
n(`<[0,2,4,6]
[-1,0,2,4]
[1,3,5,7]
[-2,0,1,3]
>/2`).scale("D2:major").s("gm_church_organ:4")
.legato(1).delay(".45:.1:.3").room(".6:2")
.postgain(.6)._pianoroll({labels:1,fill:0,strikeActive:1})

// chord progession arp layer (8 bar loop)
let chordArp =
n(`<[0 2 4 6]*8
[-1 0 2 4]*8
[1 3 5 7]*8
[-2 0 1 3]*8
>/2`).scale("D4:major").s("gm_electric_guitar_jazz:<2 3>")
.legato(.08).delay(".45:.1:.3").room(".6:2").velocity(saw.range(.8,1).fast(4))
.juxBy(1,rev())
.postgain(1.8)

// arrangement
$:arrange(
  [2,stack(m1,dr)],
  [8,s_polymeter(m1,dr,chord,bass1note)],
  [8,s_polymeter(m1,dr,chord,bass1note,bassline)],
  [8,s_polymeter(m2,dr,chord,bass1note,bassline,chordArp)],
  [8,s_polymeter(m2,dr,chord,bass1note,bassline,chordOrg,chordArp)],
  [4,s_polymeter(m2,dr,chord,bass1note,bassline,chordOrg,chordArp)],
  [4,s_polymeter(m2,arrange([2,dr],[2,silence]).fast(4),bass1note,bassline,chordOrg)]
  )
//.color("<pink cyan green orange>").punchcard({labels:1,vertical:1,flipTime:1,fill:0,strokeActive:1,filpValue:1,fontFamily:'teletext'})

                                                                                                   


// `7MM"""Mq.`7MM"""YMM        db       .g8"""bgd `7MM"""YMM        .g8""8q. `7MMF'   `7MF'MMP""MM""YMM 
//   MM   `MM. MM    `7       ;MM:    .dP'     `M   MM    `7      .dP'    `YM. MM       M  P'   MM   `7 
//   MM   ,M9  MM   d        ,V^MM.   dM'       `   MM   d        dM'      `MM MM       M       MM      
//   MMmmdM9   MMmmMM       ,M  `MM   MM            MMmmMM        MM        MM MM       M       MM      
//   MM        MM   Y  ,    AbmmmqMA  MM.           MM   Y  ,     MM.      ,MP MM       M       MM      
//   MM        MM     ,M   A'     VML `Mb.     ,'   MM     ,M     `Mb.    ,dP' YM.     ,M       MM      
// .JMML.    .JMMmmmmMMM .AMA.   .AMMA. `"bmmmd'  .JMMmmmmMMM       `"bmmd"'    `bmmmmd"'     .JMML.    
                                                                                                     
                                                                                                     

// @version 1.1
```

---

## Determination - Toby Fox (cover)

```strudel
/*@Determination · Toby Fox(cover)
  @by Claffystic
  @details: This is an unofficial fanmade content. I made this to learn about Strudel and that's it.
            Reference: https://soundcloud.com/radixan/undertale-determination-midi-in-description
            Pulled from YouTube description below. (https://www.youtube.com/watch?v=sRLQnlglfrI)
            
  Determination · Toby Fox
  UNDERTALE Soundtrack
  ℗ Toby Fox under license to Materia Collective
  Released on: 2015-09-15
  Producer: Toby Fox
  Music  Publisher: Materia Collective Music Publishing
  Composer: Toby Fox
*/

setcpm(115 / 4)

$lead: note(`<
[F#5 F5 D#5 C#5 D#5 A#4 C5 ~]
[G#4 ~ D#5 F5 F#5 ~ G#5 ~]
[C#6 ~ A#5@5 ~]
[F#5 F5 D#5 C#5 D#5 A#4 C5 ~]
[G#4 ~ D#4 F4 F#4 ~ F4 ~]
[C#4 ~ D#4@5 ~]

[F#5 F5 D#5 C#5 D#5 A#4 C5 ~]
[G#4 ~ D#5 F5 F#5 ~ G#5 ~]
[C#6 ~ A#5@5 ~]
[F#5 F5 D#5 C#5 D#5 A#4 C5 ~]
[G#4 ~ D#4 F4 F#4 ~ F4 ~]
[C#4 ~ D#4@5 ~] 

[[G#5,F5] [F#5,D#5] [E5,C#5] [D#5,B4] [C#5,A#4] [E5,C#5] [D#5,A#4] ~]
[[A#4,F#4] ~ [A#4,F#4] [D#5,A#4] [G#5,E5] [F#5,D#5] [E5,C#5] [D#5,B4]]
[[C#5,A#4] [E5,C#5] [D#5,A#4]@3 ~ [D#4,A#3] [G#4,D#4]]
[[C#5,A#4] [C5,G#4] [A#4,F#4] [G#4,F4] [A#4,F#4] [C5,G#4] [A#4,F#4] ~]
[[D#4,A#3] ~ [D#4,A#3] [F4,C#4] [F#4,D#4] ~ [B4,F#4] ~]
[[D#5,B4]@2 [D5,A#4]@4 ~@2]

[[G#5,F5] [F#5,D#5] [E5,C#5] [D#5,B4] [C#5,A#4] [E5,C#5] [D#5,A#4] ~]
[[A#4,F#4] ~ [A#4,F#4] [D#5,A#4] [G#5,E5] [F#5,D#5] [E5,C#5] [D#5,B4]]
[[C#5,A#4] [E5,C#5] [D#5,A#4]@3 ~ [D#4,A#3] [G#4,D#4]]
[[C#5,A#4] [C5,G#4] [A#4,F#4] [G#4,F4] [A#4,F#4] [C5,G#4] [A#4,F#4] ~]
[[D#4,A#3] ~ [D#4,A#3] [F4,C#4] [F#4,D#4] ~ [F4,C#4] ~]
[[C#4,G#3]@2 [D#4,A#3]@4 ~@2]

[~@8]
>`).sound("square").room(.5).roomsize(6).gain(.25).detune("[-5, 5]")

$harmony: note(`<
[~ D#4 F#4 G#4 A#4 F#4 ~ G#4]
[C5 D#5 C5 G#4 ~ D#4 F4 D#4]
[G#4 F4 F#4 F4 D#4 C#4 D#4 A#3]
[~ D#4 F#4 G#4 A#4 F#4 ~ D#4] 
[F#4 G#4 A#4 F#4 ~ D#4 F4 A#4]
[F4 C#4 F#4 F4 D#4 C#4 D#4 F4]

[~ D#4 F#4 G#4 A#4 F#4 ~ G#4]
[C5 D#5 C5 G#4 ~ D#4 F4 D#4]
[G#4 F4 F#4 F4 D#4 C#4 D#4 A#3]
[~ D#4 F#4 G#4 A#4 F#4 ~ D#4] 
[F#4 G#4 A#4 F#4 ~ D#4 F4 A#4]
[F4 C#4 F#4 F4 D#4 C#4 D#4 A#3]

[G#3 D#4 G#4 F#4 A#4 G#4 F#4 G#4]
[D#4 F#4 C#4 D#4 G#3 D#4 G#4 F#4]
[A#4 G#4 F#4@3 ~@3]
[~ D#3 C#4 A#3 G#4 F4 D#4 F4]
[F#4 F4 d#4 F4 F#4 ~@3]
[B4 ~ G#4 F#4 F4 D#4 D4 F4]

[G#3 D#4 G#4 F#4 A#4 G#4 F#4 G#4]
[D#4 F#4 C#4 D#4 G#3 D#4 G#4 F#4]
[A#4 G#4 F#4@3 ~@3]
[~@8]
[~@2 D#4 F4 F#4 ~ F4 ~]
[C#4@2 D#4@4 ~@2]

[~@8]
>`).sound("triangle").gain(.35).shape(.2)

$bass: note(`<
[D#2@4 F#2@2 G#2@2]
[G#2@2 G#1@2 B1@2 C#2@2]
[F#2@2 D#2@4 C#2@2]
[D#2@4 F#2@2 G#2@2]
[G#2@2 D#2@2 F#2@2 F2@2]
[C#2@2 D#2@4 C#2@2]

[D#2@4 F#2@2 G#2@2]
[G#2@2 G#1@2 B1@2 C#2@2]
[F#2@2 D#2@4 C#2@2]
[D#2@4 F#2@2 G#2@2]
[G#2@2 D#2@2 F#2@2 F2@2]
[C#2@2 D#2@4 ~@2]

[F2@4 C#2@2 D#2@2]
[D#2 ~ D#2@2 E2@4]
[C#2@2 D#2@3 ~@3]
[A#1@4 C#2@2 D#2@2]
[D#2@2 C#2@2 B1@2 ~@2]
[D#3 ~ D3@2 B2@2 A#2@2]

[E2@4 C#2@2 D#2@2]
[D#2 ~ D#2@2 E2@4]
[C#2@2 D#2@3 ~@3]
[G#2@4 ~@2 D#2@2]
[D#2@2 ~@2 F#2 ~ F2 ~]
[C#2@2 D#2@6]

[~@8]
>`).sound("square").gain(.3)
```
