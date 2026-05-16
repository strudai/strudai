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

---

## Super mario bros. main theme (cover)

```strudel
/*
    @title Mario theme 
    @by Flowhacker
    Original song composed by Koji Kondo
*/

setcpm(200/4)

const muteSquare1 = false;
const muteSquare2 = false;
const muteTriangle = false;
const muteNoise = false;

let whitenoise = 
  stack(
    sound("pink").decay(.03).velocity(3.2),
    sound("white").struct("- x").fast(2).decay(.02),
    sound("white").struct("- - - x").lpf(2000).fast(2).decay(.01),
    sound("white").struct("- - x -").hpf(400).decay(.12)
    )

let whitenoise_bridge = 
  stack(
    sound("white").struct("- <- x> <<x -> <- x>> <- <- x>>").fast(2).decay(.04),
    sound("white").struct("x [- x] - <x ->").hpf(400).decay(.14)
    )

if (muteNoise) {
  whitenoise = whitenoise.postgain(0)
  whitenoise_bridge = whitenoise_bridge.postgain(0)
}

// === === === === === === === === === === === === === === === === === === ===
// Intro
// === === === === === === === === === === === === === === === === === === ===
const square1_intro = `<
[[E E] [- E] [- C] [E -]]
  [[G -] [- -] [G2 -] [- -]] 
>`.add("24")

const square2_intro = `<
  [[Gb2 Gb2] [- Gb2] [- Gb2] [Gb2 -]]
  [[B2 -] [- -] [- -] [- -]] 
>`.add("24")

const triangle_intro = `<
  [[D D] [- D] [- D] [D -]]
  [[G4 -] [- -] [G -] [- -]] 
>`

// === === === === === === === === === === === === === === === === === === ===
// PART A
// === === === === === === === === === === === === === === === === === === ===
const square1_A = `<
  [[C4 -] [- G] - [E -]]
  [[- A] [- B] [- Bb] [A -]] 
  [[G E4 G4] [[A4@3 -] [F4 G4]]]
  [[- E4] [- C4] [D4 B] -]
>`.add("12")


const square2_A = `<
  [[E -] [- C] - [G2 -]]
  [[- C] [- D] [- Db] [C -]]
  [[C G B] [[C4@3 -] [A B]]]
  [[- A] [- E] [F D] -]
>`.add("12")

const triangle_A = `<
  [[G -] [- E] - [C -]]
  [[- F] [- G] [- Gb] [F -]] 
  [[E C4 E4] [[F4@3 -] [D4 E4]]]
  [[- C4] [- A] [B G] -]
>`

// === === === === === === === === === === === === === === === === === === ===
// PART B-1
// === === === === === === === === === === === === === === === === === === ===
const square1_B = `<
  [- [G F#] [F D#] [- E]]
  [[- Ab2] [A2 C] [- A2] [C D]] 
  [- [G F#] [F D#] [- E]]
  [[- C4] [- C4] [C4 -] -]
>`.add("24")

const square2_B = `<
  [- [E Eb] [D B2] [- C]]
  [[- E2] [F2 G2] [- C2] [E2 F2]] 
  [- [E Eb] [D B2] [- C]]
  [[- F] [- F] [F -] -]
>`.add("24")

const triangle_B = `<
  [[C -] [- G] [- -] [C4 -]]
  [[F -] [- C4] [C4 -] [F -]] 
  [[C -] [- G] [- B] [C4 -]]
  [[- G5] [- G5] [G5 -] [G -]]
>`

// === === === === === === === === === === === === === === === === === === ===
// PART B-2
// === === === === === === === === === === === === === === === === === === ===
const square1_B2 = `<
  [- [G F#] [F D#] [- E]]
  [[- Ab2] [A2 C] [- A2] [C D]] 
  [[- -] [D# -] [- D] -]
  [C - - -]
>`.add("24")

const square2_B2 = `<
  [- [E Eb] [D B2] [- C]]
  [[- E2] [F2 G2] [- C2] [E2 F2]] 
  [[- -] [G#2 -] [- F2] -]
  [E2 - - - ]
>`.add("24")

const triangle_B2 = `<
  [[C -] [- G] [- -] [C4 -]]
  [[F -] [- C4] [C4 -] [F -]] 
  [[C -] [Ab -] [- Bb] -]
  [[C4 -] [- G] [G -] [C -]]
>`

// === === === === === === === === === === === === === === === === === === ===
// PART C (bridge)
// === === === === === === === === === === === === === === === === === === ===
const square1_C = `<
  [[C C] [- C] [- C] [D -]]
  [[E C] [- A2] [G2 -] [- -]] 
  [[C C] [- C] [- C] [D E]]
  [-]
>`.add("24")

const square2_C = `<
  [[Ab2 Ab2] [- Ab2] [- Ab2] [Bb2 -]]
  [[G2 E2] [- E2] [C2 -] [- -]] 
  [[Ab2 Ab2] [- Ab2] [- Ab2] [Bb2 G2]]
  [-]
>`.add("24")

const triangle_C = `<
  [[Ab2 -] [- Eb] [- -] [Ab -]]
  [[G -] [- C] [- -] [G2 -]] 
  [[Ab2 -] [- Eb] [- -] [Ab -]]
  [[G -] [- C] [- -] [G2 -]] 
>`


// === === === === === === === === === === === === === === === === === === ===
// PART C-2 (bridge)
// === === === === === === === === === === === === === === === === === === ===
const square1_C2 = `<
  [[C C] [- C] [- C] [D -]]
  [[E C] [- A2] [G2 -] [- -]] 
  [[E E] [- E] [- C] [E -]]
  [[G -] [- -] [G2 -] [- -]] 
>`.add("24")

const square2_C2 = `<
  [[Ab2 Ab2] [- Ab2] [- Ab2] [Bb2 -]]
  [[G2 E2] [- E2] [C2 -] [- -]] 
  [[Gb2 Gb2] [- Gb2] [- Gb2] [Gb2 -]]
  [[B2 -] [- -] [- -] [- -]] 
>`.add("24")

const triangle_C2 = `<
  [[Ab2 -] [- Eb] [- -] [Ab -]]
  [[G -] [- C] [- -] [G2 -]] 
  [[D D] [- D] [- D] [D -]]
  [[G4 -] [- -] [G -] [- -]] 
>`

// === === === === === === === === === === === === === === === === === === ===
// PART D => Same as Part A
// === === === === === === === === === === === === === === === === === === ===

// === === === === === === === === === === === === === === === === === === ===
// PART E
// === === === === === === === === === === === === === === === === === === ===

const square1_E = `<
  [[E C] [- G2] [- -] [G#2 -]]
  [[A2 F] [- F] [A2 -] [- -]] 
  [[B2 A] [- A@2 -] [A@4 G@2] [- F]]
  [[E C] [- A2] [G2 -] [- -]] 
>`.add("24")

const square2_E = `<
  [[C G2] [- E2] [- -] [E2 -]]
  [[F2 C] [- C] [F2 -] [- -]] 
  [[G2 F] [- F@2 -] [F@4 E@2] [- D]]
  [[C A2] [- F2] [E2 -] [- -]] 
>`.add("24")

const triangle_E = `<
  [[C -] [- F#] [G -] [C4 -]]
  [[F -] [F -] [C4 C4] [F -]] 
  [[D -] [- F] [G -] [B -]]
  [[G -] [G -] [C4 C4] [G -]] 
>`

// === === === === === === === === === === === === === === === === === === ===
// PART E2
// === === === === === === === === === === === === === === === === === === ===

const square1_E2 = `<
  [[E C] [- G2] [- -] [G#2 -]]
  [[A2 F] [- F] [A2 -] [- -]] 
  [[B2 F] [- F] [F@4 E@2] [- D]]
  [[C -] [- -] [- -] [- -]] 
>`.add("24")

const square2_E2 = `<
  [[C G2] [- E2] [- -] [E2 -]]
  [[F2 C] [- C] [F2 -] [- -]] 
  [[G2 D] [- D] [D@4 C@2] [- B2]]
  [[G2 E2] [- E2] [C2 -] [- -]] 
>`.add("24")

const triangle_E2 = `<
  [[C -] [- F#] [G -] [C4 -]]
  [[F -] [F -] [C4 C4] [F -]] 
  [[G -] [- G] [G - A] [- B@2]]
  [[C4 -] [G -] [C -] [- -]] 
>`

// === === === === === === === === === === === === === === === === === === ===
// STRUCTURE
// === === === === === === === === === === === === === === === === === === ===
$: arrange(
  // === Intro ===
   [2, stack(
      sqr1Sound(square1_intro),
      sqr2Sound(square2_intro),
      triangleSound(triangle_intro),
      whitenoise_bridge)._scope()],
  // === Part A ===
   [8, stack(
      sqr1Sound(square1_A),
      sqr2Sound(square2_A),
      triangleSound(triangle_A),
      whitenoise)._scope()],
  // === Part B-1 ===
   [4, stack(
      sqr1Sound(square1_B),
      sqr2Sound(square2_B),
      triangleSound(triangle_B),
      whitenoise)._scope()],
  // === Part B-2 ===
   [4, stack(
      sqr1Sound(square1_B2),
      sqr2Sound(square2_B2),
      triangleSound(triangle_B2),
      whitenoise
   )._scope()],
  // === Part B-3 (same as B) ===
   [4, stack(
      sqr1Sound(square1_B),
      sqr2Sound(square2_B),
      triangleSound(triangle_B),
      whitenoise)._scope()],
  // === Part B-4 (same as B-2) ===
   [4, stack(
      sqr1Sound(square1_B2),
      sqr2Sound(square2_B2),
      triangleSound(triangle_B2),
      whitenoise
   )._scope()],
  // === Part C (bridge) ===
   [4, stack(
      sqr2Sound(square1_C),
      sqr2Sound(square2_C),
      triangleSound(triangle_C),
      whitenoise_bridge)._scope()],
  // === Part C-2 (bridge) ===
   [4, stack(
      sqr1Sound(square1_C2),
      sqr2Sound(square2_C2),
      triangleSound(triangle_C2),
      whitenoise_bridge)._scope()],
  // === Part D (same as A) ===
   [8, stack(
      sqr1Sound(square1_A),
      sqr2Sound(square2_A),
      triangleSound(triangle_A),
      whitenoise)._scope()],
  // === Part E ===
   [4, stack(
      sqr1Sound(square1_E),
      sqr2Sound(square2_E),
      triangleSound(triangle_E),
      whitenoise)._scope()],
  // === Part E-2 ===
   [4, stack(
      sqr1Sound(square1_E2),
      sqr2Sound(square2_E2),
      triangleSound(triangle_E2),
      whitenoise)._scope()],
  // === Part E-3 (same as E) ===
   [4, stack(
      sqr1Sound(square1_E),
      sqr2Sound(square2_E),
      triangleSound(triangle_E),
      whitenoise)._scope()],
  // === Part E-4 (same as E-2) ===
   [4, stack(
      sqr1Sound(square1_E2),
      sqr2Sound(square2_E2),
      triangleSound(triangle_E2),
      whitenoise)._scope()],
  // === Part F (brige, same as C) ===
   [4, stack(
      sqr1Sound(square1_C),
      sqr2Sound(square2_C),
      triangleSound(triangle_C),
      whitenoise_bridge)._scope()],
  // === Part F-2 (brige, same as C-2) ===
   [4, stack(
      sqr1Sound(square1_C2),
      sqr2Sound(square2_C2),
      triangleSound(triangle_C2),
      whitenoise_bridge)._scope()],
  // === Part G (same as E) ===
   [4, stack(
      sqr1Sound(square1_E),
      sqr2Sound(square2_E),
      triangleSound(triangle_E),
      whitenoise)._scope()],
  // === Part G-2 (same as E-2) ===
   [4, stack(
      sqr1Sound(square1_E2),
      sqr2Sound(square2_E2),
      triangleSound(triangle_E2),
      whitenoise)._scope()],
)

function sqr1Sound(x){
  if (muteSquare1) return note(x).gain(0);
  return note(x).s("square").clip("0.7").release(0).crush(4).gain(0.3);
}

function sqr2Sound(x){
  if (muteSquare2) return note(x).gain(0);
  return note(x).s("square").clip("0.7").release(0).crush(4).gain(0.3);
}

function triangleSound(x){
  if (muteTriangle) return note(x).gain(0);
  return note(x).s("triangle").clip("0.7").decay(0.9).crush(8).gain(0.8);
}

```

---

## Radiohead - Everything in its right place

```strudel
setcpm(120)

// MELODY + VISUALIZER
let melody = 
  note("<[c ab] [g c] [fb, g, c, c] [fb, g, c, c, c] [fb, g, c, c,c] [f, g, c, db, db] [f, g, c, db, db] [eb, g, c] [eb, g, c]>")
  .sound("piano")

// DRUMS
let drums = 
  sound("bd ~")
  .bank("RolandTR909")

// FM SYNTH LAYER + VISUALIZER
let fmLayer = 
  note("<[c ab] [g c]>")
  .fm("<0 1 2 8>")
  .gain(0.6)

// STACK THEM
stack(
  melody,
  drums,
  fmLayer
)._punchcard()

```

---

## acertainbuzz

```strudel
// "A Certain Buzz"
// a silly song @by eefano

setcps(175 / 60 / 4)

const toscale = register('toscale', (pat) => pat.withValue((v) =>
  v.endsWith('m') ? [v.substring(0, v.length - 1), 'minor'] : [v, 'major']));

const song = "<0@6 1@6>/4";

const ch0rds = song.pickRestart(["< D#2 <E2m F#2m> >", "< F#2 B1 A1m A#1>"]);

$: n(song.pickRestart(["<0*4 <[0 ~] [2 4]>>*2", "<2*2 1*2 0*2 3*2>*2"]))
  .s('supersaw').scale(ch0rds.toscale()).attack(.1).clip(.95).gain(.5).early(.01)

$: s("<[~@3 1] 0@4 [0 1] 0@5 [0@3 1]>/4"
  .pickRestart(["<bd ~ sd ~ ~ bd sd ~>*8", "<[sd bd]!2>*4"])).bank("tr909").gain(.4)

$: s("rd:3*4").gain(.5)

$: n(song.pickRestart(["<~ ~ 0 ~ 1 ~ >/4", "<~ 0 2@2>/4"])
  .pickRestart(["<~ [9 8] [9 ~ ] >*4", "<11*2 10*3 ~>*2", "<[8 7] [7 ~] [7 6] [6 7]!2 ~>*4"]))
  .scale(ch0rds.toscale()).transpose(24).s('triangle').clip(.95).vib(10).vibmod(.5).gain(.5)

all(x => x.room(.3))

```

---

## ameliewaltz

```strudel

setDefaultVoicings('legacy')
stack(
  n("[0@2 ~, ~ [[1,2,3] ~]!2]")
  .chord("<[Dm Am]!2 [F C]!2>/4")
  .anchor("<[B3 G3]!2 [C4 B3]!2>/4")
  .voicing().velocity(0.5)
  ,
  n("<[3@5.5 2@0.5 1@3 0@3] [3@3.5 [4 3 2 1 2]@2.5 1@3 0@3] [2@5.5 1@0.5 -3@6]!2>/4")
  .scale("a4:minor")
  
).s("gm_harmonica").lpf(4000).clip(1)
  .attack(0.1).release(0.1)
  .room(1.5)
  .cpm(64).gain(.6)
  .pianoroll()
```

---

## anniesroom

```strudel
// "Up In Annie's Room" (work in progress)
// song @by The Sea Nymphs
// script @by eefano
setcps(90/60)

const split = register('split', (deflt, callback, pat) => 
  callback(deflt.map((d,i)=>pat.withValue((v)=>Array.isArray(v)?(i<v.length?v[i]:d):(i==0?v:d)))));

c: "<0@32 1@24>/2".pickRestart([
"<Bm@3 G Em A Em D G@2 A Em D G A Em>/2",
"<C#m G A# F E B Em G@3 D# Dm A C#m G B A G A G A G A G>/2"])
 .layer(x=>x.chord().anchor('b4').voicing().s("gm_reed_organ").attack(0.1).release(1.5).room(1).rsize(4).gain(0.4),
        x=>n("<0!32 [0,1,2,3,4]!24>/2").chord(x).anchor('c3').mode('root').voicing().s("gm_church_organ").room(1).rsize(4).gain(0.4),
        x=>n("<[0,[~ 1@20],[~@2 2@20],[~@3 3@20],[~@4 4@20]]>/2").chord(x).anchor('e4').voicing().s("gm_acoustic_guitar_nylon").room(0.6).gain(0.5))

v: "<0@16 1@16 2@24>/2".pickRestart([
  "<f#3 ~ d3 e3 ~ e3 ~ f#3 ~ f3:-2 ~ d3@7 ~@14 d3@2 ~ b3 ~ b3 ~ e3@7 ~@18>*2",
  "<f#4 ~ d4 e4 ~ e4 ~ f#4@4 d4:-4@7 ~@14 d4@2 ~ b4 ~ b4 ~ e4@7 ~@18>*2","<~>*2"])
  .split([0,0],(x)=>note(x[0]).penv(x[1]))
  .patt('0.4').s("gm_choir_aahs:5").room(1).gain(1)

//d: s("<hh>")


```

---

## anothersatellite

```strudel
// "Another Satellite" (work in progress)
// song @by XTC
// script @by eefano
setcps(119/60)
samples({'gtr': {'g3': 'https://cdn.freesound.org/previews/705/705412_11110011-lq.mp3'}})
const split = register('split', (deflt, callback, pat) => callback(deflt.map((d,i)=> pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }))));

gtr: "<~ 0:.6@2 1:.6@8 2@2 3@2.5 1:.6!2>/16".split([0,1],(y)=>y[0].pickRestart([
  "<bb2@7 eb3>/2",
  "<[bb2@3 eb3]!2 [c#3 f#3] [e3 d3] [g2@3 f3] [bb2@3 eb3] g2@2 >/8",
  "<a3 g3 a3 f3 g3 f3 g3 e3>/4",
  "<a3 g3 a3 f3 g3 f3 c3@4>/4"
]).s('gtr').begin(.045).end(.5).clip(1).note().gain(.9).room(2).gain(.8).velocity(y[1]))

vox: "<~@3 0:0.6@8 1 2 1 3@1.5 ~!2>/16".split([0,1],(y)=>y[0].pickRestart([
  `<~ d4:.7!3 d4:1 c4:.7!4 ~ f4 ~ d4@2:1 c4:1 bb3 ~ d4:.7!3 d4:1 c4:.7!4 d4!2 f4 d4!2 d4:1 db4 db4@3:1 ab3 ab3@2 ~@2
  [db4!3]@6 db4 db4@2:1 d4 d4 ~ d4 ~@3 d4@2 d4 d4@2 d4 e4 d4@3 b3 b3@2:1 a3:1 g3@2 ~
  ~ d4 d4@2 c4!3 c4@2 f4 d4@2:1 c4:1 bb3@3:1 g3:1 f3@2:1 c4@4:1:4 c#4@10:1 ~@22>*2`,
  `<~@4 e4@4 e4@3 d4 db4@2:1 b3@2:1 a3@4:1 a4@3 a4!2 e4 e4@3:1 d4:1 c4@2>*2`,
  `<~@4 d4@4 d4@3:1 c4:1 b3@2 a3@2:1 c4@4:1:4 b3@4:1:-1 ~@4>*2`,
  `<~@4 [d4:1 e4:1 d4:1 c4:1 b3:1 a3]@12 c4:1:4@8 d4:1:2@8 a3:1:-4@8 ~@8>*2`,
]).split([0, .9, 0], (x) => note(x[0]).clip(x[1]).penv(x[2])).patt('.2').s('gm_oboe').lpf(30000).room(.5).gain(1.7).velocity(y[1]))
  .superimpose(x=>x.late(2).gain(0.5).pan("<0 1>/16").room(1.5))

faf: "<~@62 [0,1]@8 >/4".pickRestart([
  `<~ d4:.5!2 d4@2:1 c4:.5!3 c4 ~ f4 ~ d4@2:1 c4:1 bb3 ~@2 d4:0.5 d4@2:1 c4:.5 c4:1 bb3:.5 bb3@2:1 f3@2:1 c4:1:4@3 ~ >*2`.pan(.3),
  `<~ f4:.5!2 f4@2:1 eb4:.5!3 eb4 ~ bb4 ~ f4@2:1 eb4:1 d4 ~@2 f4:0.5 f4@2:1 eb4:.5 eb4:1 d4:.5 d4@2:1 bb3@2:1 eb4:1:4@3 ~ >*2`.pan(.7),
]).split([0,.9,0],(x)=>note(x[0]).clip(x[1]).penv(x[2])).patt('.2').s('triangle').lpf(30000).room(.5).gain(0.2)

$: s("<hh*2>").bank("RolandMT32").gain(.05).room(.2)
$: s("<bd ~ ~ <bd ~>>*2").bank("RolandMT32").gain("<0.4 0.2>").room(.2)
$: s("<[[~ ~ rim]!5]@15 ~>*2").bank("RolandMT32").gain(.2).room(.2)


```

---

## appealingtovenus

```strudel
// "Appealing to Venus" 
// song @by The Sea Nymphs
// script @by eefano
setDefaultVoicings('legacy')
const chords = `<Cm@2 Ab@2 Db@2 Cm F Bb C@2 F Bb C@2 F Bb Eb Dm [Cm Dm] [Eb ~] Eb Dm [Cm Dm] [Eb ~]
                C@2 Ab Eb Ab A E B Db Cm [Bbm Cm] [Db ~] Db Cm [Bbm Cm] [Db ~]>/2`
stack( 
  // melody
  `<
     ~@2 c5 d5@2 eb5 d5@3 c5@2 g#4@3 eb5@8 ~@2
   ~@2 c#5 d#5@2 f5 d#5@3 c#5@2 d#5@3
   d#5@3 f5@3 a5@3 a#5@3 a#5@3 g5@6 f5 e5@4 
   ~ e5 f5@2 a5@3 a#5@3 a#5@3 g5@6 f5 e5@4 
   ~ e5 f5@2 a5@3 a#5@3 a#5@3 
   g5@7 f5@6 d#5@3 f5@3 g5@6
   ~@24

    e5@2 e5@3 f5@3 g5@3 g#5@3 g5@3 g5@3 c6@3
    c6@3 c6@3 c#6@3 b5@3 [f#5 g#5 f#5@3]@3 e5@3 b5@3 b5@3
    g#5@7 d#5@6 c#5@3 d#5@3 f5@6
    ~@24
   >*3`.note().clip(0.95).s('gm_oboe').gain(0.5)
  ,
  // second voice
  `<
    ~@150
  
    c5@2 c5@3 d5@3 e5@3 d#5@3 d#5@3 c5@3 g5@3
    g5@3 g5@3 g#5@3 e5@3 [c#5 d#5 c#5@3]@3 b4@3 f#5@3 f#5@3
    c#5@7 c5@6 a#4@3 c5@3 c#5@6
    ~@24
   >*3`.note().clip(0.95).s('gm_oboe').gain(0.5)
  ,
  chords.rootNotes(2).note().s('gm_bassoon').lpf(400).gain(0.5),
  chord(chords).anchor("C5").voicing().struct("x").piano().gain(0.4),
  chord(chords).anchor("E5").voicing().s('gm_drawbar_organ').gain(0.15),
  
).cpm(120).room(0.5)//.pianoroll()
```

---

## aztecchallenge

```strudel
// "Aztec Challenge"
// song @by Paul Norman
// script @by eefano
setcps(180/60)
let parts = 
{a1:n("<0>/32")
,a2:n("<-7>/32")
,a3:n("<-14@5 [4 7]*5 4@2 >/4")
,b:n("<0 ~@3 0 ~ 0 ~>*4".sub(7))
,c1:n("<0@2 2 1 1b@2 3 2>")
,c2:n("<<0 1b> 5 4 3 4 5 4 3>*2")
,d1:n("<0@2 2 1 1b@2 3 2>/2")
,d2:n("<<-7 -6b> -2 -3 -4 -3 -2 -3 -4>")
,e1:n("<0 ~ 0 1 0 ~ 0 1 0 ~ 0 1 2 1 0 -1 1 ~ 1 2 1 ~ 1 2 1 ~ 1 2 1 0 -1 -2#>*2")
,e2:n("<-2@2 4b ~ 2@2 4b 5 >*2")
,e3:n("<2@3 3 3#@3 4 7@2 6 5# 3#@3 4 7@2 6 5# 3#@3 1 0@8>/2")
}
sid1: "<a1@2 ~ b c1@2 b a1@2 e1@3 e2 e1@3 e2 e1@3 e2 e1@3 e2>/16".pickRestart(parts).scale('a1:minor').s('gm_lead_2_sawtooth').lpf(4000).color('yellow').gain(0.9)._scope()
sid2: "<a2@2 b@2 c2@2 d1 a2@2 e1@3 e2 e1@3 e2 e1@3 e2 e1@3 e2>/16".pickRestart(parts).scale('a2:minor').s('sawtooth').lpf(3000).color('cyan')._scope()
sid3: "<a3@2 ~@2 b@2 d2 a3@2 ~@4 e3@4 e3@4 e3@4>/16".pickRestart(parts).scale('a4:minor').s("<triangle@17 sawtooth@8>/16").color('magenta')._scope()

```

---

## bennington

```strudel
// "Bennington" (work in progress)
// composed @by John Maus
// script @by eefano
setcps(135 / 60 / 4)

bass: "<0@3 1 0 1@2 0@2 0*4 [2@25 3@7]@2 0 [0 ~@31]>/8".pickRestart([
  n("<7!3 [4 6] 7*2 7!2 6 9!3 [6 9] 11*2 11!2 10>*4"),
  n("<[9*2 9!2 [6 7]]!2 [11*2 11!2 [6 7]] [11 12# 13 14] >"),
  n("<[~ 9 12!2]!2 [~ 9 10!2] [~ 7 10!2] [7!2 14!2] [~ 7 11!2]!2>*2"),
  n("<[~ 6 13!2]!3>*2")
]).scale('c1:minor').s('sawtooth').clip(.95).lpf(300).lpe(1).gain(.9).room(.2)

gneeow: "<0 ~@3 0 ~@4 ~ ~@2 0 1>/8".pickRestart([
  n("<~ [4,7,9]@3 ~@4>*2"),n("<[4,7,9]@2 ~@6>")
]).scale('c5:minor').s('sawtooth').vib(4.5).vibmod(.4).gain(.55).room(.8)

dindin: "<~ 0@2 ~@4 0@2 ~@5>/8".pickRestart([
  n("[1 2]*4").pan("[.45 .55]*4")
]).scale('c6:minor').s('square').att(0).dec(.5).rel(.3).gain(.15)

pads: "<5 ~@2 0 1 0@2 ~@2 2 [3@25 4@7]@2 ~@2>/8".pickRestart([
  n("<[2,4,6] [-3,-1,1]>/2").lpf(1500).att(.4).rel(.5).gain(.7),
  n("<~@4 11 [9 10] 8 -1 [0@3 ~]@2 ~@2 11 [9 10] 8 13 >*2").lpf(1500).att(.4).rel(.5).gain(1.2),
  n("<[-3,0,2] [-3,-1,1]>/2").lpf(1500).gain(.5),
  n("<[5,7,9]@2 [5,7,10]@2 [[4,7,9] [4,7,8] [4,6]]@3>*2").gain(.9),
  n("<[6,8,10]@3 ~@4>*2").gain(.9),
  n("<0>").gain(0) // preload
]).scale('c4:minor').s('gm_pad_warm').room(.4)

voice: "<~ 0 1 2 ~ 2 2*2 0 1 ~ [3@27 ~@5]@2 ~@2>/8".pickRestart([
  n("<~@3 [2 2@3]@2 3 4 [5 6@3]@2 7 [8 6] [~ 4@3]@2 ~@9 [4 3@3]@2 4 3 4 [5 6@3]@2 [7 8@3]@2 ~>*4").gain(.4),
  n("<~@5 4 [4 ~] [3 ~] [4 6@2 4@5]@4 ~@7 [2 2@3]@2 3 4 [5 6@3]@2 ~@4 >*4").gain(.4),
  n("<~@4 6 7 8 [6 4@3]@2 ~@10 4 [6 7@2 8@2 6@2 4@3]@5 ~@7>*4").gain(.5),
  n("<9 ~ 7 ~ 11 8 ~ ~ [9 10 9] 7 ~ 11 8 ~>*2").gain(.9).delay(.4).dt(.3).dfb(.75)
]).scale('c3:minor').s('pulse').clip(.9).layer(x=>x.pan(.3),x=>x.late(.02).pan(.7)).room(.5)

drums: "<[0,1,2] 2@2 [0,2] [0,1,2] [0,2]@2 2@2 [2,[~ 1*2]] 2@2 [0,1,2] ~>/8".pickRestart([
  "<[~ <~@3 bd ~@4>]>*4",  "<~ <cp ~> ~@6>*4",  "<bd sd>*4"
]).pickOut({
  bd:s('linndrum_bd').lpf(3000).room(.25).gain(.75),
  sd:s('linndrum_sd').room(.25).gain(.65),
  cp:s('cp').velocity(.65).room(.8)
})

all(x=>x
    //.ribbon(13*8,1*8)
   )

```

---

## bigship

```strudel
// "Big Ship (Coda)"
// song @by Cardiacs
// script @by eefano
setDefaultVoicings('legacy')
const progr = "<Am!2 D F Am D@2 Am!2 A# Am E@2 C F Am D@4>".fast(2);
const anchr = "<A5 F5 F5 F5 F5 G5@2 A5 F5 G#5 F5 E5@2 E5 F5 F5 G5@4>".fast(2);

stack(
 n("-2 -1 0 2 0 1").chord(progr).anchor("G5").voicing().s('gm_violin').clip(1).gain(0.3).room(0.1)
, chord(progr).anchor(anchr).voicing().s('gm_drawbar_organ').clip(1).gain(0.9).room(0.3)
, chord(progr).rootNotes(1).struct("x*2").s('gm_electric_bass_finger').clip(1).gain(1)
  
, s("[bd!2 ~ bd]*2").bank("AkaiLinn").lpf(200).gain(0.35)
, s("[~ <[sd ~ ~ sd] sd>]*2").bank("AkaiLinn").hpf(250).lpf(4000).gain(0.30)
, s("oh*4").gain(0.15) 

).cpm(120/4).room(0.3)//.pianoroll()

```

---

## bluemonday

```strudel

stack(
  s("bd!2 [bd*4]!2 bd!4").slow(8).bank("SequentialCircuitsDrumtracks"), 
  s("~ hh").bank("SequentialCircuitsDrumtracks"), 
  n("<[[2 ~] [2 ~] 2 3] [[3 ~] [3 ~] 3 3]>@4 [-1 ~] -1 -1 [0 ~] 0 0 [0 ~] 0 0 [0 ~] 0 0").slow(8).scale("d2:minor").s("gm_lead_8_bass_lead")
).cpm(130)

```

---

## bonespurs

```strudel
// "Bonespurs" (work in progress)
// @by eefano

setcps(90/60/3)

$: "<[-3,0] [-4,0] [-2,0]>/4".layer(
     x=>x.sub(7).struct("<x*4>").n().s('supersaw').clip(1).lpf("<300>/12").lpa(0).lpe("<1 1.5 2 2!3>/12").lpd(.15),
     x=>x.add(7).s('triangle').gain("<0 .1 .15 .2!3>/12").adsr([.5,0,1,.5]).hpf(500)
)
$: "<[0 2 5 0 3 -1 2 3 -1 -2 3 2]>".s('sine').gain("<0 0 .3 .6!3>/12")

$: n(irand(7).add(6).struct("<~@2 [x x] [x ~]>")).s('square').hpf(800).lpf(2000)
  .gain(.3).adsr([.01,.2,.1,.4]).delay(0.2).dfb(.2).mask("<~@3 1!3>/12")

$: s("[bd [~ <~ bd>] sd]").bank('linndrum').lpf("<600 800 1000 1200!3>/12").gain(.7)
$: s("rd*3").hpf(8000).gain(.1)

all(x=>x.room(.8).scale("f3:minor"))
```

---

## breakfastline

```strudel
// "Theme from The Breakfast Line"
// song @by Cardiacs
// script @by eefano
const maj = "[0,4,7]"
const imaj = "[0,4,-5]"
const melody =`[
    c#6@2 f5 c6@3 a#5 a5@2 g5@3 c#5 e5@2 d#5@2 f#5 a5@3 a5@3
    a5 g5 f5 d#5 c#5 b4 a5@3 a5@3 f5 g5 a5 a#5 g#5 g5 f5 g5 a5 b5 d5 g5 
    c#5@2 b4 f5@3 c#5 d#5 f5 g5 c#5@2 c5@3 c#5@3 c#5@6
    c#5 g#5 g5 a#4 f5 d#5 c#5 c5 g#5 c#5 c5 b4 c#5@2 b4 a5@3 c#5 b4@2 a5@6 
    b5 g5@2 e5 a5 b5 b5@6 b5 a#5 g5 a5@3 b5 g5 d5 c#5 a5@2 b5 g5 d#5 c#5 a5@2
    g5@2 d#5 f5 d#5 c#5 b4 a4 g4 a4 b4 c#5 d#5 f5 g5 ]/24`.clip(0.93)
stack( 
   // melody   
  melody.note().transpose(  0).s('gm_overdriven_guitar').pan(0.45).gain(0.70),   
  melody.note().transpose(-12).s('gm_overdriven_guitar').pan(0.55).gain(0.80),   
  // chords
  "<C#4 D#4 F4 G4 A3 B3>*2".add(imaj)
  .note().s('gm_string_ensemble_2').gain(0.6),
  // bass
  "<C#2 D#2 C2 D2 A1 B1>*2".clip(0.90)
  .note().s('gm_electric_bass_finger').gain(0.7), 
  // drums
  s("<[bd ~ bd sd ~ bd]!23 [sd*6]>").bank("AkaiLinn").gain(0.30),
  s("hh*6").gain(0.10) 
).cpm(76/2).room(0.6)//.pianoroll()
 
```

---

## budsandspawn

```strudel
// "Buds And Spawn" (work in progress)
// song @by Cardiacs
// script @by eefano
const i_chords = x => x.s("recorder_tenor_sus").clip(1).decay(1.2).sustain(0).release(0.5)
const i_sax    = x => x.s("sax").gain(0.3).clip(1).release(0)
const i_bass   = x => x.s("triangle").clip(1).release(0.1)
const i_drums  = x => x.bank("YamahaRY30").clip(1).gain(0.08)
const i_piano  = x => x.piano().gain(0.2)

const I_chord = n("[0,2,4]")
const p_up = n("[-5@0.5 -4 -3 [-2 -1] 0 1 2@0.5]").clip(0.7)
const p_dw = p_up.rev()

function stackme(sc, chordpart, saxpart, drumpart) {
  return stack(chordpart.scale(sc).apply(i_chords), saxpart.scale(sc).apply(i_sax), s(drumpart).apply(i_drums))
}

const s1=stackme("f#:major"    ,I_chord,p_up,"cr,bd")
const s2=stackme("a#:major"    ,I_chord,p_up,"[bd sd bd*2 sd bd*2 sd]")
const s3=stackme("b:whole:tone",I_chord,p_dw,"[sd@0.5 sd sd [ht ht] lt lt bd@0.5]")
const s4=stackme("f#:major"    ,I_chord,p_up,"[bd sd [~ bd] sd bd sd],hh*6")

arrange([3,s1],[1/1.2,s2.fast(1.2)],[1/1.3,s3.fast(1.3)],[4,s4]).cpm(165/4)
  //.pianoroll()
```

---

## bugfromheaven

```strudel
// "Bug From Heaven (wip)"
// song @by Tim Smith
// script @by eefano
setcps(108/60/2)
const standardtuning = [40,45,50,55,59,64];
const fingering = 
{A:"0:0:2:2:2:0",Am:"0:0:2:2:1:0",A7:"x:0:2:0:2:0",D:"x:0:0:2:3:2",Dm:"x:0:0:2:3:1",D7:"x:0:0:2:1:2",
 E:"0:2:2:1:0:0",Em:"0:2:2:0:0:0",E7:"0:2:2:1:3:0",G7:"3:2:0:0:0:1",C:"x:3:2:0:1:0",
 // guitar only chords
 Dx:"x:0:0:2:3:2",Ds:"x:0:0:1:3:0",
 Ax:"0:0:2:2:2:0",Amx:"0:0:2:2:1:0",
 Ex:"0:2:2:1:0:0",Emx:"0:2:2:0:0:0",
};
const gstrum = 
{u:"<[[1,[~ 3@10],4]@2 ~]!2 [1,4,5]>*3", 
 v:"<[[0,[~ 3@10],5]@2 ~]!2 [0,3,4]>*3", 
 w:"<[[1,[~ 3@10],4]@2 ~]!2 [1,2,3]>*3", 
 x:"<[1,[~ 2@50],[~ ~ 4@50]] ~@3>/4",
 z:"<[[3,4,5] ~]*2>", 
 k:"<[[2,3,4] ~]*2>",
 n:"~"
};
const bstrum = {u:"<[1 2]>", v:"<[2 1]>", w:"<[1 0]>", x:"~", z:"~", k:"~", n:"0"};

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

gtr: "<~@2 [[0 1]!2]@16 2@3 3@13 4@3 3@4 5@2 3@13 4@3 3@4 5@2 3@4 3@2 6@11 3@4 5@2 3@13 4@3 3@4 5@2 3@4 3@2 6@11 3@4 5@2 7@8 [[0 1]!2]@16 8@5>"
  .pickRestart([
  "<Am:u:6 E:v:5 Am:u:4 E:v:3>","<Am:u:2 A:w:7>","<Am:u:2 E:x A:x>",
  "<Dx:z Ds:z>","<Ax:z Emx:k:2 Ax:z:2>","<Ax:k:2 Ex:z:5>",
  "<A:n:2 E:n A:n E:n E:n:4 A:n:4 E:n:2 E:n:6 A:n:6 A:n:11 E:n:9>",
  "<E:k:2!3 A:k:1 E:k:5!3 A:k:2 >",/* 157 */"<Am:u:2 E:x@2 ~@2>"
  ]).split([0,0,0],s=>s[0].layer(
  x=>guitar(s[1].pick(gstrum),x).s("gm_acoustic_guitar_steel:1").release(.1).gain(.75).room(.5).hpf(300).lpf(5000).late(1/64),
  x=>guitar(s[1].pick(bstrum),x).s("gm_pizzicato_strings:1").transpose(-12).release(.1).gain(.65).room(.6).lpf(1000),
  x=>chord(x).anchor("g5").voicing().s("gm_string_ensemble_1").gain(.15).room(1).layer(p=>p.pan(1),p=>p.pan(0).late(.1))
    ).transpose(s[2]))

vox: "<~@25 0@22 0@22 1@13 2@10 0@22 1@13 3@8 ~@30>".pickRestart([
 "<f#4@2 f#4@3 [e4!2]@6 [f#4!2]@6 g#4@19 f#4@2 f#4@3 [e4!2]@6 [f#4!2]@6 c#4@13 b3@3 f#3@13 ~@100>*6",
 /*69*/"<f#4@2 f#4@3 [e4!2]@6 [f#4!2]@6 [g#4!2]@6 [a4!2]@6 [g#4!3]@9 d#4@3 [f4!2]@6 [f#4!2]@6 [f4!2]@6 [d#4!4]@12 c#4@3 f4@3 f#4@3>*6",
 /*82*/"<f#4@2 f#4@3 [e4!2]@6 [f#4!2]@6 b3@16 c#4@3 d4@12 ~@100>*6",
 /*127*/"<f#4 e4 [d4@2 ~] e4 [f#4@2 ~] a4 f#4@2>"
]).s("sawtooth").note().attack(.05).release(.05).gain(.30).hpf(500).clip(0.95)

drm: "< 0@2 [0,1]@17 2 ~ 0@32>".pick([
     s("<rd>*2"),
     s("<~ sd>*2"),
     s("<rd>")
  ]).bank("BossDR110").room(1).lpf(1800).gain(.6)

uff: "<[gm_acoustic_guitar_steel:1,gm_string_ensemble_1,gm_pizzicato_strings:1] ~@1000>".gain(0)
```

---

## bustybeez

```strudel
// "Busty Beez" (work in progress)
// song @by Cardiacs
// script @by eefano
setcps(182 / 60 / 8)
const beez = `<~@8 
      i@28 j@18 k@5 l@2 m@30 n@22 o@22
      i@28 j@18 k@5 l@2 m@30 n@22 o@22
      n@22 m@30 k@5 l@2 k@5 p@16
      i@28 j@18 j@18 k@5 l@2 m@30 k@5 l@2 m@30 n@22 o@22
      i@28 j@18 k@5 l@2 m@30 n@22 o@22
      i@28 j@18 k@5 l@2 m@30 n@22 o@22
      n@22 m@30 k@5 l@2 k@5 p@16
      i@28 j@18 j@18 k@5 l@2 m@30 k@5 l@2 m@30 n@22 q@6 p@16
      i@28 j@18 j@18 j@18 j@18 j@18 j@18 j@18 j@18 ~@18 >`
const melody = {
  i: "<b4@3 c5 g4@2 g4 f4 c#4 c#4@2 a4@2:4 a4 b4@2 b4 f#4 d#4 b3 c4 d#4 g#4 c5@2 c#5 c#4@2>",
  j: "<d4 c#4 b3 b3 b4@2 a4 g4 f4 d#4 d#4 c#4 b3 g4@2 f4 d#4 c#4>",
  k: "<c#4 c4@2 a#3@2>",
  l: "<f#4@2>",
  m: "<e4@2 a3@2 g#3 a#3 c4 c#4 d4 e4 f#4 [g#4 ~] g#4@2 a#4@2 c5@2 c#5@2 c5@2 f#4@2 g4@5 ~>",
  n: "<g4 d4 b3 c#4 d#4 c#4 c4 a#3 a#3 d4 g4 g#4@2 a#4@2 a#4@2 f4 d4@2 g#4@2>",
  o: "<g4@6 g4@12 g#4 d#4 a#4 b4>",
  p: "<g4@4 g4@4 g4@3 g4 g#4 d#4 a#4 b4>",
  q: "<g#4@2 g4@4>" }
const ch0rds = {
  i: "<G@3 C@3 C#@3 A@4 F@3 B@4 G#@5 F#@3>",
  j: "<G@10 A@8>",
  k: "<F#@5>",
  l: "<D@2>",
  m: "<A@4 C#@4 D@4 E@2 A#@4 A@2 F@2 B@2 D#@6>",
  n: "<G@2 B@3 F#@3 Gm@3 E@4 D#m@2 Dm@3 C#@2>",
  o: "<C#@6 D#@4 C#@4 G@4 E B F# B>",
  p: "<D#@4 C#@4 G@4 E B F# B>",
  q: "<C#@6>" }
const drums = {
  i: "<[bd,cr]@3 bd sd@2 bd@2 sd bd@2 sd@2 sd [bd,cr]@2 [bd,cr]@2 sd@2 bd!2 sd@2 sd [bd,cr]@2 sd>",
  j: "<[bd,cr]@2 sd@3 bd sd [sd,mt] [sd,lt]!2 [bd,cr]@2 sd@3 bd@2 sd>",
  k: "<[bd,cr] bd sd bd sd>",
  l: "<[bd,cr]@2>",
  m: "<[bd,cr]@2 sd@2 bd!2 sd@2 bd!2 sd@2 bd sd [bd,cr]@2 sd bd sd bd [bd,cr]@2 [bd,cr]@2 [bd,cr]@2 sd bd [sd,mt] lt>",
  n: "<[bd,cr]@2 sd@3 bd@3 sd@2 bd sd@2 bd@2 bd@2 sd bd@2 [bd,cr]@2>",
  o: "<sd@2 sd [bd,cr]!2 ~ [bd,cr]@2 sd bd [sd,mt] bd [bd,cr]@2 [bd,cr]@3 sd!2 [sd,mt] [sd,lt]!2 >",
  p: "<[bd,cr]@2 sd bd [sd,mt] bd [bd,cr]@2 [bd,cr]@3 sd!2 [sd,mt] [sd,lt]!2>",
  q: "<sd@2 sd [bd,cr]!2 ~>" }
const colors= {i:'white',j:'yellow',k:'cyan',l:'green',m:'red',n:'salmon',o:'magenta',p:'orange',q:'lightgrey'}

const split = register('split', (deflt, callback, pat) => callback(deflt.map((d,i)=> pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }))));

$: beez.pickRestart(melody).split([0,0],s=>note(s[0]).penv(s[1])).patt(.1).clip(.98)
  .layer(x=>x.s("gm_overdriven_guitar:3").vib(10).vibmod(.09).delay(.4).dt(.2).dfb(.30).gain(1),
         x=>x.transpose(12).s("gm_pad_bowed:1").gain(.4))
$: chord(beez.pickRestart(ch0rds)).anchor('F4').voicing()
  .layer(x=>x.s("gm_church_organ:3").pan(.40).gain(.4),
         x=>x.s("gm_brass_section:1").pan(.55).gain(.7))
$: beez.pickRestart(ch0rds).rootNotes(2).note()
  .s("gm_electric_bass_pick:2").lpf(200).gain(.6)
$: beez.pickRestart(drums).pickOut({
          bd:s('bd').velocity(.55).lpf(500),
          sd:s('sd').velocity(.55).hpf(200),
          cr:s('cr').velocity(.1).pan(.55),
          mt:s('mt').velocity(.3).pan(.6),
          lt:s('lt').velocity(.2).pan(.7)}).bank("linn9000").speed(.95).gain(.7)
$: s("<r8_rd:1>").speed(1.1).hpf(4000).gain(.1)

all(x => x.room(.2)
    //.color(beez.pick(colors))
    .fast(8)
)

```

---

## byebyespirit

```strudel
// "Bye Bye Spirit" (Work In Progress)
// song @by The Sea Nymphs
// script @by eefano
setDefaultVoicings('legacy')
setcps(140/60*3/4/3)

const ch = ["<Cm A# D# D E F C A E G# C# Cm F Cm F>", 
            "<A@8 ~ Em A G C B ~ A G C B ~ A G D Em ~ G D Em ~ ~>"]
const bs = ["<c2 a#1 d#2 d2 e2 f2 c2 a1 e2 g#1 c#2 c2 f2 c2 f2>"
           ,"<a1 g1 f#1 f1 a1 g1 f#1 f1 ~ e2 a1 g1 c2 b1@2 a1 g1 c2 b1@2 a1 g1 f#1 e2@2 g1 f#1 e2@2 ~>"]
const me = ["<g4@2 ~ a#4@2 ~ g4@2 ~ f#4 d4 a3 g#3 b3 e4 a3 c4 f4 e4@4 ~@2 e4 b3 g#3 g#3 c4 g#4 f4 c#4@2 d#4 d4 c4 a3@2 ~ g4@3 a3@3>*3"
           ,`<[a3 b3 c#4] g3 c#4 g3 [a3 b3 c#4] [g3@2 b3] c#4 g3 ~ 
              [e4 ~ e4] [a3 ~ a3] [b3 ~ b3] [[g3@4 f#3]@2 e3] b3 ~ 
              [a3 ~ a3] [b3 ~ b3] [[g3@4 f#3]@2 e3] b3 ~ g3 b3@2 ~ g3 b3@2 g3 ~ ~ >`]

piano: "<0@30 1@30>".pickRestart(ch).chord().anchor("e4".add("<~ -2 2>*3")).voicing().struct("<~ x x>*3").piano().room(0.8).gain(0.4)

bass: "<0@30 1@30>".pickRestart(bs).note().piano().room(.8).gain(0.6)

bowed: n("<0 1 2 2 1 0>*3").chord("<~@15 0@15 ~@30>".pickRestart(ch)).anchor("g5").voicing().s('gm_pad_bowed').sustain(0.4).room(0.7).gain(0.5)

voice: "<0@30 1@30>".pickRestart(me).transpose(12).s('triangle').note().room(0.6).attack(0.05).release(0.2).gain(0.4).vmod(0.10).v(5)


```

---

## cabinet

```strudel
// "Cabinet" (work in progress)
// song @by Spratleys Japs
// script @by eefano
setDefaultVoicings('legacy')
function arr(p,l) { return [l,p.slow(l)]; }

const h1 = arr(`D@8 A F@3`,24/2);
const h2 = arr(`D@5 E C@3 A@2 B G@2 E@7 F# D@2 B C# A@2 F#@3 G# E@2`,68/2);
const h3 = arr(`C#@8 D# B@2 G# A# F#@2 D#@3 F C#@3 A# C G#@2 F@3 G D#@3 C@2 D A#@2 G@3 A F@2`,88/2);

const chords = arrange(h1,h2,h3);


stack(
  chord(chords).rootNotes(3).s('triangle').lpf(400).gain(0.6),
  chord(chords).anchor("E5").voicing().s('gm_drawbar_organ').gain(0.35),

  s("sleighbells").struct("x*6").gain(3),
  s("[bd sd]").gain(0.4).room(2),
  s("rd*6").gain(0.01)
 
).cpm(133/8).pianoroll()
```

---

## cadenza

```strudel
// "The Cardiacs Cadence"
// script @by eefano
setDefaultVoicings('legacy')
const magic = "<G@3 Bm E@3 G#m C#@3 Fm A#@3 Dm>";

stack(
chord(magic).anchor("G4".transpose("<3 0 -3 0>")).voicing().struct("x").piano().gain(cosine.segment(16).range(0.5,1).slow(8)),
chord(magic).anchor("B5".transpose("<0 -3 6 3>/16")).voicing().s("gm_drawbar_organ").gain(0.8),
"<G2 E2 C#2 A#2>/4".transpose("<0 <-12 -8>>").struct("x!2").note().lpf(180).s("gm_electric_bass_finger").gain(1)
).cpm(120/2).room(0.5).pianoroll()

```

---

## cinghiale

```strudel
// "L'Era Del Cinghiale Bianco" 
// song @by Franco Battiato
// script @by eefano
setCps(127/60/2)
setDefaultVoicings('legacy')
stack(
  "<0@16 1@14 >".pickRestart(["<[0 1]!2 [0 2] [0 3]>/4","<[4!2]@14>"]).pickRestart(
   ["<[7 6 5 6 7 5 6 7]!2>".add("<0 1>")
   ,"<[9 8 7 8]*3@1.5 [9 ~!1]@0.5>"
   ,"<9 [~ 7 8 6]>","<9 [~ 7 8 9]>"
   ,"<7@3 6@3 7@5 8 9 7 5@3 6@3 7@5 ~@5>*4"
  ]).n().scale("c4:major").transpose("<[0 -5]@16 [[0@7 -5@8]!2]@14 >").s("sawtooth").vib(5).vmod(0.1).clip(0.85).attack(0.05).release(0.1).gain(0.6)

,"<0@16 [1!2]@14 >".pickRestart(["<[Am G C@2]!2 [Em D G@2]!2>/4","<Am@3 G@3 C@5 ~@3 Em@3 D@3 G@5 ~@5>*4"])
  .chord().anchor("C4").voicing().s("triangle").lpf(1200).attack(0.01).gain(0.35)
      
,"<0@16 1@14 >".pickRestart(["[[bd <~!7 bd>] sd],<hh!31 oh>*4",
                       "<bd [sd bd] bd bd [sd bd] bd sd>*2,<hh!17 oh>*4"]).s().bank("YamahaRY30").clip(1).gain(0.4)
).room(0.4)

```

---

## clandeisiciliani

```strudel
// "The Sicilian Clan" (work In Progress)
// song @by Ennio Morricone
// script @by eefano
const chrds = "<Am@3 E  Edim@2 D@3  Ddim E7@2 Am@3 [B@2 A#]@3 A@2 Am@2 E@2 Am@4>*2";
const anchr = "<E4@3 E4 E4@2   D4@3 D4  D4@2 C4@3 [B3@2 A#3]@3 A3@2 A3@2 G#3@2 A3@4>*2";
const dickt = {
    '': ['0 4 7', '4 7 12', '7 12 16'], // major chords (no symbol)
    m: ['0 3 7', '3 7 12', '7 12 15'], // minor chords via 'm'
    dim: ['0 3 6', '3 6 12', '6 12 15'], // diminished
    7: ['4 7 10'], // upper 7th
  };
stack(
n("<0@12 1@2>".pickRestart(["<[~ 0 1 0 2@2]!14 [~ 0 1 2 2@2] [~ 1 4 3 4@2]>*8/6","<2 ~>"]))
  .chord(chrds).dict(dickt).anchor(anchr).voicing().s("gm_electric_guitar_jazz").gain(0.8).color('red'),
n("<[2@2 ~ 2 1@2 ~@2]!4>")
  .chord(chrds).dict(dickt).anchor(chrds.rootNotes(2)).voicing().s("gm_electric_bass_finger").lpf(190).gain(1).color('blue'),
"<A4@2 C5 B4 A#4@2 A4@3 C5 B4 A#4 A4@2 C5@2 B4 A#4@2 A4@2 C5 B4 A#4 A4@2 ~@2>*2"
  .note().s("gm_oboe").gain(0.4).color('green'),
chord(chrds).anchor("G4").struct("x*4").dict(dickt).voicing().s("gm_synth_strings_2").gain(0.2).color('yellow'),

s("[~ rim]*2").bank("AlesisHR16").gain(0.4),
s("rd*8").note(42).bank("AkaiLinn").gain(0.08)
  
).cpm(120.3/4).room(0.6)//.pianoroll();
```

---

## clubbed

```strudel
// "Clubbed"
// @by eefano
setcps(162/60/3)
const standardtuning = [40,45,50,55,59,64];
const fingering = 
{A:"x:0:2:2:2:0",Am:"x:0:2:2:1:0",A7:"x:0:2:0:2:0",D:"x:0:0:2:3:2",Dm:"x:0:0:2:3:1",D7:"x:0:0:2:1:2",
 E:"0:2:2:1:0:0",Em:"0:2:2:0:0:0",E7:"0:2:2:1:3:0",G7:"3:2:0:0:0:1",C:"x:3:2:0:1:0",
};
const strumming = 
{d: "<[1,3,4]*8>/3", u:"<[2,4,5]*8>/3"
};
const gString = register('gString', (n, pat) => 
  (pat.fmap((v) => { if(v[n]=='x') return note(0).velocity(0);
      return note(v[n]+standardtuning[n]); } 
  ).innerJoin()));
const guitar = (strums,fingers,tuning=standardtuning) =>
  (strums.pickRestart(strumming).pickOut(
    [fingers.pickOut(fingering).gString(0),fingers.pickOut(fingering).gString(1),fingers.pickOut(fingering).gString(2)
    ,fingers.pickOut(fingering).gString(3),fingers.pickOut(fingering).gString(4),fingers.pickOut(fingering).gString(5)]));

guy: "<0@2 1 0 1 0>/24".pickRestart(["<Am Dm>/4","<Em G7>/4"]).layer(
  x=>guitar("<u d>/3",x).s("gm_electric_guitar_clean:2").clip(0.5).release(0.1).gain(0.9).room(0.2).layer(p=>p.pan(1),p=>p.pan(0).late(.01)),
  x=>chord(x).anchor("g5").voicing().s("gm_percussive_organ").gain(0.8).mask("<~@3 1@6 ~@3>/12").room(.4)
    )

drm: "<~ 0 [0,1]@6 [1,2]@4 [0,1]@8 1@3 ~ >/6".pick([
     s("<[~ hh]*2>"),
     s("<bd sd [bd [~ bd]] sd [bd <~ bd>] [[sd bd] ~]>*2"),
     s("<oh:2*8>")
  ]).bank("RolandTR808").room(1).lpf(1800).gain(3.5)


```

---

## disto

```strudel
setcps(90/60)

g: n("<[[0,4]]*3>")
  .scale("c#2:minor").s("supersaw").transpose("<0 2 [3 1]>/8")
  .lpa(0).lpe(10).lpd(0.2).lpr(1).lpf("<[10 10 100]>").dist("8:0.18")

s: n("<[[5 ~]*3] 4 4b 3 [1 2 1] 0 [4 5 2] 4 >")
  .scale("c#4:minor").transpose("<0 2 [3 1]>/8")
.s("supersaw").lpf(500).dist("10:0.12").room(0.2)
  .mask("<0@3 1@4 >/8").hush()

d: "[<bd*3 [~ bd bd] [sd ~ bd] [mt lt bd] [[sd,[~ sd@6]] sd mt] >,<oh!4 ~>,<cr>/5]"
  .pickOut({bd:s("EmuDrumulator_bd").velocity(1).lpf(1000),
           sd:s("EmuDrumulator_sd").velocity(1),
           oh:s("EmuDrumulator_oh").pan(0.6).speed(0.7).velocity(0.2),
           mt:s("EmuDrumulator_mt").velocity(0.6),
           lt:s("EmuDrumulator_lt").velocity(0.6),
           cr:s("SequentialCircuitsDrumtracks_cr").speed(1.3).pan(0.4).velocity(0.5)})
  .room(0.9).gain(0.5)
  .mask("<0 1@5 0 1 >/8")


```

---

## edenontheair

```strudel
setDefaultVoicings('legacy')

const chrds = "A@2 E@2 A F#m B@2 E@2 A ~ F#@4 A@2 ~ F#@4 ~@2".slow(25/4);

stack(
n(run(6).palindrome().fast(5)).clip(2).chord(chrds).anchor(chrds.rootNotes(5)).voicing().s("gm_electric_guitar_jazz"),
chord(chrds).anchor("B4").voicing().s("gm_piccolo")
             
).gain("0.4@12 1@4 0.4@3 1@4 0.4@2".slow(25/4)).cpm(95/4).room(0.5)
```

---

## ellipticaleye

```strudel
// "Death By Elliptical Eye" (work in progress)
// song @by pilotredsun
// script @by eefano
setcpm(122)

$: note(stack("<<a#4 g#4> ~ ~ b3 d#4 ~ ~ b3 <f#4 e4> ~ e4 d#4 a#3 ~ ~ b3>*2",
              "<c#2 c#3 e3 ~ ~ c#3 g#2 ~ c#2 c#3 e3 g#3 a#3 d#3 e3 ~>*2"))
  .s("supersaw").att(0.04).dec(.2).sus(.5).rel(.8).detune(.6)
  .roomsize(0.3).room("<0.5@7 5@5>/16").lpf("<9000@7 5000@5>/16").lpq(2)
  .delay("<0@7 .9@5>/16").dt(.2).dfb(0.01).gain("<.8@7 .55@5>/16")
  .transpose("<0@7 1 0 1 0 1>/16").orbit(1)

$: note("<<a#5 g#5> c#4 e4 b4 d#5 c#4 g#3 b4 <f#5 e5> c#4 e5 d#5 a#4 d#4 e4 b4>*2")
  .s("pulse").dec(.2).sus(.2).pan(.55).gain(.9)
  .mask("<~ x@6 ~@5>/16")

$: note("<c#2@11 e2 f#2@3 e2>*2")
  .s("gm_synth_strings_1").lpf(250).gain(1.5)
  .mask("<~@3 x@4 ~@5>/16")

$: note("<c#2@2 ~ ~ c#2 ~ f#2 ~>")
  .s("gm_synth_strings_1").lpf(250).gain(1.5).rel(.7)
  .mask("<~@7 x@5>/16").transpose("<0@7 1 0 1 0 1>/16")

$: "<bd ~ hh hh*2 sd ~ hh*2 [hh bx] bd ~ hh sd sd ~ hh*2 bd>*2".pickOut({
  bd:s("bd").lpf(4000).velocity(.8), bx:s("bd").lpf(4000).velocity(.4),
  sd:s("sd"), hh:s("hh").hpf(4000).velocity(.8)
}).room(.8).roomsize(2).orbit(2)
  .mask("<~@3 x@4 ~ ~ x@2 ~ >/16")

$: note("<<a#5 g#5> e5 c#5 ~@5 <f#5 e5> ~ e5 d#5 a#4 ~ ~ b4>*2")
  .s("supersaw").dec(.1).sus(.15).pan(.45).gain(.8).delay(.8).dt(.15).dfb(.3)
  .mask("<~@5 x@2 ~@5>/16").roomsize(0.8).room(1).orbit(3)

//all(x=>x.ribbon(7*16,16*2))
```

---

## elpueblo

```strudel
// "El Pueblo Unido Jamas Sera Vencido" (work in progress)
// song @by Inti-Illimani
// script @by eefano
setCps(95/60/4)
const standardtuning = [40,45,50,55,59,64];
const fingering = 
{Am:"0:0:2:2:1:0",C:"x:3:2:0:1:0",Dm:"x:0:0:2:3:1",E7:"0:2:2:1:3:0",G7:"3:2:0:0:0:1",
 F:"1:3:3:2:1:1",A7:"x:0:2:2:2:3",E:"0:2:2:1:0:0",B7:"0:2:4:2:4:2"
};
const sk = 300, sh = silence, strumming = 
{d: stack(0,timeCat([1,sh],[sk,1]),timeCat([2,sh],[sk,2]),timeCat([3,sh],[sk,3]),timeCat([4,sh],[sk,4]),timeCat([5,sh],[sk,5]))
,u: stack(5,timeCat([1,sh],[sk,4]),timeCat([2,sh],[sk,3]),timeCat([3,sh],[sk,2]),timeCat([4,sh],[sk,1]),timeCat([5,sh],[sk,0]))
};

const gString = register('gString', (n, pat) => 
  (pat.fmap((v) => { if(v[n]=='x') return note(0).velocity(0);
      return note(v[n]+standardtuning[n]); } 
  ).innerJoin()));
const guitar = (strums,fingers,tuning=standardtuning) =>
  (strums.pickRestart(strumming).pickOut(
    [fingers.pickOut(fingering).gString(0),fingers.pickOut(fingering).gString(1),fingers.pickOut(fingering).gString(2)
    ,fingers.pickOut(fingering).gString(3),fingers.pickOut(fingering).gString(4),fingers.pickOut(fingering).gString(5)]));

stack(
  guitar("<d [d@2 u]>*4",
         "<0@4 1 2 1 3 4@2>/2".pickRestart(
           ["<Am C Dm E7>*2","<Dm G7 C F>*2","<Dm E7 Am A7>*2","<Dm E7 [Am E7] Am>*2","<Dm B7 Am E7>"]))
  
    .s("gm_acoustic_guitar_steel:2").clip(1).release(0.4).gain(0.4).room(0.6),

  "<~@2 0@2 1 2 1 3 4@2>/2".pickRestart([
    "<0@5 0 2@5 2 4@2 4 3@2 2 1@5 <-3 4>>*12", 
    "<5@5 2 1@5 5 4@2 3 4@2 1 0@5 4>*12", 
    "<3@5 0 0b@5 3 2@2 1 2@2 3 4@2 4b 4@2 6>*12",
    "<3@5 0 0b@5 3 2@2 1 0@2 0b 0@5 0>*12",
    "<[3!2]@4 ~ 3 [3!2]@4 ~ 3 [4b@!2]@4 ~ 4b [4b!2]@4 ~ 4b [4!2]@4 ~ 4 [4!2]@4 ~ 4 [4!2]@4 ~ 4 [4!2]@4 ~ ~>*12",
  ]).scale("a5:minor").note().clip(0.95).color('yellow')
   .layer(x=>x.s("gm_ocarina").gain(0.6).room(0.6)
         ,x=>x.transpose(-24).attack(0.01).release(0.1).s("gm_choir_aahs:3").gain(0.8).room(0.5)),

  "<0@2 ~@8>/2".pickRestart([note("<b@2 f@2 ~ b b@2 f@2 ~ b b@2 b b@b b@2 f@2 ~ <b ~>>*12")])
      .clip(0.90).s("gm_applause:3").color('red').room(2).gain(0.35)

)//.pianoroll()


```

---

## enjoythesilence

```strudel
// "Enjoy The Silence (coda)"
// song @by Depeche Mode
// script @by eefano
setCps(113/60/4)
await samples({'gtr': 'gtr/0001_cleanC.wav'}, 'github:tidalcycles/Dirt-Samples/master/');

const melodia   = x => x.note().s("ocarina").gain(0.6).clip(1).release(0.1)
const guitar    = x => x.note().s("gtr").room(1).gain(0.25).clip(1).release(0.5)
const accordi   = x => x.note().s("recorder_bass_sus").gain(1.5).clip(1).release(0.5)
const basso     = x => x.note().s("triangle").gain(0.8).clip(1).sustain(0.8)
const ritmo     = x => x.bank("AlesisHR16").clip(1).gain(0.08)

const scala = cat('c minor')  // IV VI I III
stack(
"<[3,5,0] [5,0,2] [0,2,4] [2,4,-1]>".scale(scala).apply(accordi),
"<[2@3 3] [0@3 2] [4@3 6] [2@3 3] [0@3 1] [-1@3 -2] -3 [0 1]>".scale(scala).transpose(12).apply(melodia),
"~@2 2 <7 9 6 6>@2 2 <8 6 4 4>@2".scale(scala).transpose(-12).apply(guitar),
"<-4 -2 0 -1>".struct("[[x ~]!2 x x@0.5 [x ~]!2 x@0.5 [x ~]!2]").scale(scala).apply(basso),
s("bd!4,[~ sd]!2,[~ hh!2 hh*2]!2").apply(ritmo),
//s("hh!4").apply(ritmo)
)

```

---

## epicbiopic

```strudel
// "Epic Biopic" version 1.0
// song @by eefano
const split = register('split', (deflt, callback, pat) => callback(deflt.map((d,i)=> pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }))));
const toscale = register('toscale', (pat) => pat.withValue((v)=>
  v.endsWith('m') ? [v.substring(0,v.length-1),'minor']:[v,'major']));
setCps(1)
orch: "<~ a@2 b a@2 b c@6 d@2 a@2 b e@2 f@9 i@6 g@4 h ~>/5".pickRestart({
  a:"<B@3 Am F>", 
  b:"<F# C#@2 E@2>",
  c:"<Fm@4:1 F#@2:1 A#@4:1>",
  d:"<Fm@2:2 F@3:2 D#m:2 D@3:2 A:2>",
  e:"<A@6 ~ Cm@3:4>",
  f:"<G@2:4 B:4 F#m@2:4 A@2:4 Em@2:4 G:4 Dm:4 F@2:4 <Cm!2 [C F#]>@2:4>",
  g:"<C#@2:2 Dm@2:2 D#@2:2 F@3:2 C#:2 G#@4:2 A#m@2:2 F@4:2>",
  h:"<F@3 ~@2>",
  i:"<[[Fm@4:1 F#@2:1 A#@4:1]!2]@20 [Fm@2:2 F@3:2 D#m:2 D@3:2 A:2]@10>"
}).split([0,0],t=>stack(
 
  chord(t[0]).anchor('c5').voicing().s(t[1].pickOut([
    "supersaw".lpf(5000).velocity(.9),
    "triangle".velocity(.65),
    "supersaw".lpf(4800).velocity(.51).attack(.05).release(.05),
    "triangle".lpf("4000").velocity(.55)
  ])).room(.4).gain(.75).color('yellow'), 
  
  n(t[1].pickRestart([
    "<-1 [0 1]*3 0>".velocity(1.1),
    "<1 0*3>".velocity(.7).lpf(2800),
    "<[1 1*3] 2*3>","<[1 0] ~>".lpf(2500).velocity(.78)
  ])).chord(t[0]).mode('root').anchor('g2').voicing().clip(.97).s("square").color('cyan').gain(.85),

  "<~@4 a@2 b ~@2 c@4 d@2 e ~@2 ~@2 f@6 i@3 c@4 d@2 g@4 h ~>/5".pickRestart({
  a: "<~ [[5b 4 2]*2] [7 8b 7] [4 6b 4] [4 6] [[2 3] 4@7]@2 [~@3 6b*2] [6b@3 7*2] 9 >",
  b: "<9*3 11 9*3 11@2>",
  c: `<[2 1 0] [4@2 4*2] [4 ~ 0] [2@3 1 0@2] 2 [5@2 4] [2@3 1 2@2] [0 1] [2@3 1 2@2] [0@2 1]
       [9@3 7*2] [7@2 7] [9@3 7*2] [4 ~ 0] [2@3 1 0@2] [7@3 6 7@2] [6 7] [7@3 6 7@2] [6 7] [7@3 6 7@2]>`,
  d: "<[11 10] <[9 8] [9 10]> [9 8 7] [6 5 4]>",
  e: "<2@2 ~@3>",
  f: "<[[2 3] 4@2]!2 <[2] [4 3]> >".add("<0 [0,-2]>/15"),
  g: "<[9@8 9]@2 7@2 [9@8 8 9]@2 9@3 [9@2 [10 11]] 9@3 [[9 7 9]!2] [9@5 9]@2 9@4>".add("<0@14 [0,-2]@6>"),
  h: "<[11 ~]>/5".add("0,-2"),
  i: "<[2 1 0] <[4@2 4*2]!2 4> <[4 ~ 0] 2*3 2> [2@3 1 0@2] 2 [4 3 2]>".add("<[0,-2]>/15"), 
    }).scale(t[0].toscale()).s("gm_tuba").clip(.9).note().color('magenta').gain(1).room(.2)
))
drums: "<x a@2 b a@2 b [c,k]@6 d@2 a@2 b e@2 f@9 [i,k]@6 g@4 h ~>/5".pickRestart({
  a: s("<[[cr,lt]!2]@10>").lpf(2600),
  b: s("<~ [[cr,lt]!2]@4>").lpf(2600),
  c: s("<[lt ~ lt]>").lpf(200),
  d: s("<[[cr,lt]!5]@10>").lpf(2600),
  e: s("<[cr,lt]@5 [cr,lt] [lt mt*2 lt*2] lt@3>").lpf(2800),
  f: s("<[lt mt lt]!30 [lt mt*2 lt*2]!13 lt*3 [lt mt*2 lt*2]>")
        .lpf("<200@15 400@15 1000@13 1500@2>").velocity("<.9@28 1.2@2>"),
  g: s("<[mt mt*2 mt*2]>,<[[cr,lt]!3]@6 [[cr,lt]!4]@8 [[cr,lt]!3]@6>").lpf(2600).velocity(.78),
  h: s("<[[cr,lt]!2]@4 ~>").lpf(2800).velocity(.9),
  i: s("<[lt mt*2 lt*2],<~@20 [cr!3]@6 [cr!2]@4>>").lpf("<1500 1800 2400>/10").velocity(.78),
  k: s("<cr,lt>/30").lpf(2800).velocity(.45),
  x: s("<[mt mt lt] lt>").lpf("<800@2 1200@2 2400>")
}).bank("BossDR550").room(1.4).speed(.7).gain(.45)

```

---

## eversoclosely

```strudel
// "The Everso Closely Guarded Line (Coda)" - Work In Progress
// song @by Cardiacs
// script @by eefano
setCps(93.2/60*3/4/9)
setDefaultVoicings('legacy')
const epic = "<D Dm Am D Gm C F Am A#>*9";
const mels ={0:"d4@2 a d4 g c4 f a d4"
            ,1:"a@7 c4@3 d4@6 e4@2 c4@7 d4@2"
            ,2:"a@7 e4 c4 [d4@3 e4]@2 f#4 ~ g4@2 [c4@3 d4]@2 e4 [c4@5 ~]@4 c5@2 ~ d5@2"
            ,3:"a@2 f#4 f4@2 a ~ e4@2 d4@2 a ~ g4@2 c4@2 e4 ~ f4@2 c5@2 e4 ~ d4@2"
            ,4:"a d4 f#4 [a4 e5 c5]@6 d5 a4 f#4 [a4 g4]@4 c5@3 a4 f4 [e4 c4]@4 d4@2"
            ,5:"a d4 f#4 [a4 c5 a4]@6 d5 a4 f#4 [a4 g4]@4 c5@3 a4 f4 [e4 c4]@4 d4@2"
            ,6:"f#4 f4 e4 f#4 g4 e4 f4 [a@2 c4] [[a#@3 c4]@2 d4]"
            ,7:"[f#4 f4]@6 <e4 [e4 e4@2]>@3 [d4@3 e4]@2 f#4 [g4 a#4 c5 a4]@8 f4 e4 <[c5@2 ~ a#4@2] [c4@3 a#@2]>@5"
            ,8:"[~@25 d4@29]/2"
            ,9:"<0,1,2,3,4,5,6,7>*9"}
stack
("<0 1 2 3 4 0 1 2 3 [4@26 ~] 0 1 2 3 [[4@25 ~@29],8]@2 >".pickRestart(mels).sub(12).note().s("gm_overdriven_guitar").gain(.8)
,"<~ ~ ~ ~ 5 5 6 7@2 [2@4 ~] 5 5 6 7 [[5@25 ~@29],8]@2>".pickRestart(mels).note().s("gm_tenor_sax").gain(.8).color("yellow")
,"<1@14 [[4@25 ~@29],8]@2>".pickRestart(mels).add(24).note().s("gm_ocarina").gain(.3).color("red")
,"<9@14 ~@2>".pickRestart(mels).n().chord(epic).anchor("C4").voicing().s("<gm_reed_organ@10 gm_church_organ:1@4 ~@2>").gain("<.25@10 .45@4 ~@2>").color("green").midichan(3)
,"<0@14 [[4@25 ~@29],8]@2>".pickRestart(mels).sub(24).note().s("gm_electric_bass_finger").lpf(400).gain(.77).color("blue")
,"<0 [0@2 1@2 0 2@4] 0!4 [0@2 1@2 0 2@4] 0!2 [0@26 ~] 0!2 [0@2 1@2 0 2@4] 0 3@2>".pickRestart(
  ["<rd*3 , <<<bd!4 sd> sd> ~ bd>*3 , cr/9>*9"
  ,"[[sd [bd,cr] ~]!2@3]*9/2"
  ,"<[sd,[~ sd@10]] [[[bd,cr] ~]!2]@4 bd [sd,[~ sd@10]] mt lt >*9*3"
  ,"< [<[sd,[~ sd@10]]!2 ~> <[bd,cr]!2 [sd,[~ sd@10]]> [bd,cr]!2 ~ [bd,cr] ~ [bd,cr,cr] ~]*3 ~*4 >" 
  ]).pickOut({rd:s('rd').velocity(.12).hpf(9000).pan(.45),
               bd:s('bd').velocity(.5).lpf(2500),
                sd:s('sd').velocity(.5).hpf(200),
                cr:s('cr').velocity(.1).pan(.55),
                mt:s('mt').velocity(.3).pan(.6),
                lt:s('lt').velocity(.3).pan(.7)
}).bank("Linn9000").speed(.95).gain(.7).color("cyan").midichan(10) ).room(.8)
 
```

---

## feeling37

```strudel
// "feeling #37"
// @by eefano

setcps(185 / 60)

$: n("<0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17>").s("cajon").room(.2).gain(.7)
  
$: n("<<3 4> _@2 [~ 3] <4 2> [~ 3] [2 1] 0 <-1 -2> 0 <-1 0> [1 2] -1 0>/2")
  .scale("c3:major").n("<0 1>/16").s("psaltery_pluck")

$: n("<[0,4,6] [0,3,6] [0,2,5]>/16").scale("c2:major").adsr([.5,0,1,.5])
  .s("harmonica_soft").n("<1 2 3 4 5>/16").room(.8).gain("<.2 .1 .15 .1>/16")


```

---

## framartinocoldplayaro

```strudel
// "fra martino coldplayaro"
// script @by eefano
setcpm(120)

$: n(`<0 1 2 0 0 1 2 0 
       2 3 4 _ 2 3 4 _ 
       [4 5] [4 3] 2 0 [4 5] [4 3] 2 0 
       0 -3 0 _ 0 -3 0 _ >`)

  .scale("f5:major")
  .s('gm_recorder')
  .gain(.6)
  .pianoroll({ labels: true, fold: false, minMidi: 55, maxMidi: 95, cycles: 20 })

$: chord("<F C Gm Dm Bbm>/4").voicing().piano().gain(.7)

$: s("<bd [sd <~ bd>]>/2").bank("linn").gain(.5)

$: n("<0 -1 1 -2 3>/4"
  .struct("x")
  .add("<0 7>/2")
)
  .scale("f1:major")
  .s("gm_electric_bass_finger")

```

---

## goodbyegrace

```strudel
// "Goodbye Grace" Solo
// song @by Cardiacs
// script @by eefano
setcpm(180)

const c = `<B _ F#m D B A G B _ Em A D B Em A _ F#m D B A G B _ Em A D B Em A _ F#m _ [F#m B] B _ _
          Em A D B A [A Em] F# _ [Em D] [D F#m] B ~>/2`

$: chord(c).anchor("e5").voicing().struct("<[~ x]!72 [x ~]!24>").s("tri").att(.02).gain(.4).clip(.6).rel(.02)
$: n("0").chord(c).mode('root').anchor("e2").voicing().s("pulse").lpf(1000).gain(1).clip(.6).rel(.02)

$: n(`<2# _ 0 -3 -1 1 2 4 2# 0 -1 1 2 5 0 ~ 0 0 5 5 -1 ~ 5 4 2# 0 -2 3 -1 ~ 
           -1 -1 -1 1 2 4 2# 0 -1 1 2 5 0 ~ 0 0 5 5 -1 ~ 5 4 2# 0 -2 3 -1 ~ -1!2 ~ -1!3 -1 -3 -3@2 -3@4 
       5 5 -1 -1 5 4 2# 0 -1 3 3 -2 -3 -1# 1 4 5 4 2 1 7 0 ~ ~>`)
  .scale("b3:minor").layer(x => x.transpose("<~@68 12@28>").velocity(.3), x => x.velocity(.55))
  .s("saw").att(.025).rel(.01).gain(.95).delay(.15).dt(.4).dfb(.1)

all(x => x.room(.3))

```

---

## goodbyegracehymn

```strudel
// "Goodbye Grace" Solo (Hymn Version)
// song @by Cardiacs
// script @by eefano
setcpm(90)

const c = `<B _ F#m D B A G B _ Em A D B Em A _ F#m D B A G B _ Em A D B Em A _ F#m _ [F#m B] B _ _
          Em A D B A [A Em] F# _ [Em D] [D F#m] B ~>/2`

$: chord(c).anchor("b5").voicing().s("gm_cello").att(.2).gain(.45).rel(.5).hpf(200)
$: n("0/2").chord(c).mode('root').anchor("e2").voicing().s("gm_contrabass:2").att(.2).lpf(1000).gain(.7).rel(.2)

$: n(`<2# _ 0 -3 -1 1 2 4 2# 0 -1 1 2 5 0 _ 0 0 5 5 -1 _ 5 4 2# 0 -2 3 -1 _ 
           -1 -1 -1 1 2 4 2# 0 -1 1 2 5 0 _ 0 0 5 5 -1 _ 5 4 2# 0 -2 3 -1 ~ -1!2 ~ -1!3 -1 -3 -3@2 -3@4 
       5 5 -1 -1 5 4 2# 0 -1 3 3 -2 -3 -1# 1 4 5 4 2 1 7 0 ~ ~>`)
  .scale("b3:minor").layer(x => x.transpose("<~@68 12@28>").velocity(.3), x => x.velocity(.55))
  .s("gm_oboe:2").att(.025).rel(.01).gain(2).clip(1.1).delay(.15).dt(.4).dfb(.1)

all(x => x.room(.8))
```

---

## goodbyegracereverse

```strudel
// "Goodbye Grace" Reversed Solo
// song @by scaidraC
// script @by eefano
setcpm(180)

const c=`<B _ F#m D B A G B _ Em A D B Em A _ F#m D B A G B _ Em A D B Em A _ F#m _ [F#m B] B _ _
          Em A D B A [A Em] F# _ [Em D] [D F#m] B ~>/2`

$: chord(c).anchor("e5").voicing().struct("<[x ~]!72 [~ x]!24>").s("tri").att(.02).gain(.4).clip(.6).rel(.02)
$: n("0").chord(c).mode('root').anchor("e2").voicing().s("pulse").lpf(1000).gain(1).clip(.6).rel(.02)

$: n(`<2# _ 0 -3 -1 1 2 4 2# 0 -1 1 2 5 0 ~ 0 0 5 5 -1 ~ 5 4 2# 0 -2 3 -1 ~ 
           -1 -1 -1 1 2 4 2# 0 -1 1 2 5 0 ~ 0 0 5 5 -1 ~ 5 4 2# 0 -2 3 -1 ~ -1!2 ~ -1!3 -1 -3 -3@2 -3@4 
       5 5 -1 -1 5 4 2# 0 -1 3 3 -2 -3 -1# 1 4 5 4 2 1 7 0 ~ ~>`)
  .scale("b3:minor").layer(x=>x.transpose("<~@68 12@28>").velocity(.3),x=>x.velocity(.55))
    .s("saw").att(.025).rel(.01).gain(.95).delay(.15).dt(.4).dfb(.1)

all(x=>x.room(.3).scope().fast(96).rev().slow(96))
```

---

## happybirthday

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

```

---

## happybirthdayramones

```strudel
// "HAPPY BIRTHDAY BURNSIE"
// song @by Ramones
// script @by eefano
setDefaultVoicings('legacy')

const chrds = "F@3 C@6 F@6 Bb@3 F@2 C F@3".slow(8);

stack(
"C4*2 [D4 C4]@3 F4 E4 ~@2 C4*2 [D4 C4]@3 G4 F4 ~@2 C4*2 [C5 A4]@3 ~ [E4 D4]@3 Bb4*2 [A4 F4]@3 G4 F4 ~@2".slow(8).early(1/4).note().s("gm_distortion_guitar").gain(1).color('green'),

n("0,2").chord(chrds).anchor("E3").mode('root').struct("[[x ~]*2 x*2]*2").voicing().s("gm_distortion_guitar").clip(0.95).gain(0.7).color('yellow'),
n("0").chord(chrds).anchor("E2").mode('root').voicing().s("gm_electric_bass_finger").lpf(190).gain(1).color('blue'),

  s("<[~@5 crow crow ~]!2 ~ [~@3 crow crow ~@3 ]>").slow(2).gain(1.2),
  
  s("oh*4, <bd!3 [bd*2 ~]>*2 , [~ sd]*2").bank("Linn9000").gain(0.15)
              
).cpm(200/4).room(0.3)//.scope()//.pianoroll()

```

---

## heymoon

```strudel
// "Hey Moon" (work in progress)
// song @by John Maus
// script @by eefano
setcps(88/60)

const split = register('split', (deflt, callback, pat) => 
  callback(deflt.map((d,i)=>pat.withValue((v)=>Array.isArray(v)?(i<v.length?v[i]:d):(i==0?v:d)))));

c: n("<~ 1 2 3>*2").chord("<F C G F>/2").anchor("<F4 C4 G4 F4>/2").voicing().s("gm_pad_warm").release(2).room(0.6).gain(0.6)

m: "<0@16>/2".pickRestart([
  "<~!14 3 1 3@2 ~@4 0 5 4 4 4 [5 3@3]@2 ~!5 [1 0] -1b 0@2 0 [0 0] ~!14 >*2",
  "<~!15 3 3@3 0 0@2 5@2 4@2 3 2 2 3 3 0 0  >*2"])
 .layer(x=>x.scale("g4:major").note().s("gm_piccolo").pan(0.4).room(1).gain(0.5),
        x=>x.scale("g2:major").note().s("supersaw").pan(0.6).room(1).gain(0.6))


$: s("<hh*2>").gain(0.3).room(1)
$: s("<bd>/2").gain(0.1).room(1)
$: s("<[~ <~!3 sd>] sd>").gain(0.3).room(1)


```

---

## humanperformance

```strudel
// "Human Performance" (work in progress)
// @song by Parquet Courts
// @script by eefano
setcps(110 / 60 / 2)

const song = "<0@2 1@11 1@11 1@6 2@3 3@24 4@4 1@11 1@11 1@6 2@3 3@24 4@4>"

const zero = register('zero', (pat) => pat.withValue((v)=>0))  

const chseq = song.pickRestart(["~","<B@2 F#m@2 E@2 D@2 D A@2>","<B@3>".struct("x*4"),
                           "<A@3 <F#m!2 E D B F#m E D>@9>*4".struct("x*4"),"<F#m@4>"])

const cs = zero(chseq).pickRestart(["<[0,[~ 1@40],[~@2 2@40],[~@3 3@40]]@2>"])
const ds= "<0@3 0@2 0 0@2 0!2 0@2>*4".pickRestart(["[0,1,2,3]"])

const cln = x=>x.s("gm_electric_guitar_clean:2").lpf(1800).gain(.7)
const dst = x=>x.s("gm_electric_guitar_clean:2").hpf(100).lpf(1800).clip(1).gain(.7)


$: n(song.pick([cs,cs,ds,ds,cs])).chord(chseq).mode('above').anchor('e3')
  .voicing().mode("root").pickF(song,[cln,cln,cln,dst,cln])  ._pianoroll()

$: n(song.pickRestart(["~", "<~ 8 8 7 9 8 ~ ~ ~ 7 7 5 8 7 ~ ~ ~ 8 8 7 9 8 7 6 7 5 ~ 4 7 5 ~ ~ ~ 7 7 6 7 2@2 ~@5>*4",
                       "<7@2 ~ [7 5] [9 7]@2 ~@100>*4",
                       "<<[12!2 11 12]!2 [9!3 8] [9 8 7 9] [9!3 8] [9 8 7 9] [9!3 8] [9 8 7 9]> ~@2>","~"]))
  .scale("a2:major").s("gm_tenor_sax:1").gain(1).color('yellow')

$: n(song.pickRestart(["<~ [~ 0 2 2b]>",
                       "<1 [4b 4] 5 [2 5] 4 [1 4] [3@3 3] [0@3 0] [-4@3 -4] [0 0] [0 0 2 2b]>",
                       "<1>*4","<<0!2 2 0!2 2 0!2>@3 <-2!2 4 3 1 -2 4 3>@9>*4".struct("x*4"),"<5!4 2!4 -2!3 2 5 -2 2 2b>*4"]))
  .scale("a2:major").s("gm_electric_bass_finger:3").clip(.97).lpf(350).gain(1).color('cyan')

$: song.pickRestart(["<~>","<rd*4,[bd sd]>","<rd*4,[sd bd]*2>",
                     "<cr@3 cr@9>*4,<sd ~ bd sd ~ sd!7>*4","~"]).pickOut({
          rd:s("<r8_rd:1>").speed(1.1).hpf(4000).velocity(.1),
          bd:s('linn9000_bd').velocity(.55).lpf(500),
          sd:s('linn9000_sd').velocity(.55).hpf(200),
          cr:s('linn9000_cr').velocity(.1).pan(.55),
          mt:s('linn9000_mt').velocity(.3).pan(.6),
          lt:s('linn9000_lt').velocity(.2).pan(.7)}).speed(.94).gain(.6) .color('magenta')

all(x => x
     .room(.3)
    //.ribbon(24*2,1*8)
)

```

---

## hydraswap

```strudel

await initHydra() 

let bass = note("<C3 Eb3 G2 Bb2>").euclid(3,8).s("sawtooth").lpf(sine.range(400, 1000))
let kick = s("<[bd ~ ~ bd]!3 [bd(5,8,1)]> ")
let hihat = s("hh!6 [hh*2 hh]!2").slow(2)
let final = stack(note("c3@4, c2@4").s("sawtooth").lpf(1000), 
                  s("cr")).delay(.5).delaytime(".75")
let silence = s("bd").hush()

let sequence = "0@4 1@4 2@8 3 4@7".slow(24)

solid(0,0,0)
.add(osc(10, 0.1, 10)  ,H(sequence.pick([1,0,0,1])))
.add(noise()           ,H(sequence.pick([0,1,0,1])))
.add(shape()           ,H(sequence.pick([0,0,1,0])))
.out()
             
sequence.pick([ bass,                   // = 0
                stack(bass, kick),      // = 1
                stack(bass,kick,hihat), // = 2
                final,                  // = 3
                silence])               // = 4 




```

---

## ideal

```strudel
// "Ideal (middle bit)"
// song @by Cardiacs
// script @by eefano
setcpm(218)
// The barre chord in the E shape
const root= "<A _ _ _ G _ _ _ F _ _ _ G _ A _ _ _ G _ F _ G _ _ _ A _ G _ F _ G _ _ _ A _ G _ _ _ F _ _ _ G _ _ _ A _ _ _ G _ F _>"
// The picking pattern
const stru= "<x x - - x x - - x x - - x x x x - - x x x x x x - - x x x x x x x - - x x x x - - x x - - x x - - x x - - x x x x x>"
// The string to pluck (0=E 1=A 2=D 3=G 4=B 5=E)
const patt= "<3 2 _ _ 3 2 _ _ 4 3 _ _ 1 2 3 2 _ _ 3 2 4 3 1 2 _ _ 3 2 3 2 4 3 1 _ _ 2 3 2 3 _ _ 2 4 _ _ 3 1 _ _ 2 3 _ _ 2 3 2 4 3>"
// Semitone distance from the root note for each string
const stri = "0,7,12,16,19,24"
const bass = x=>x.s("gm_electric_bass_pick:7").dist("1.5:.6").color('cyan')
const guit = x=>x.s("gm_overdriven_guitar:2").gain(.8).color('yellow')
const keyb = x=>x.s("gm_reed_organ:5").gain(.7).lpf(4000).color('magenta')
const saxo = x=>x.s("gm_baritone_sax").gain(.7)

$: "<[0,1,3]@4 [4,5,6] [3,5,7,2] [4,5,8,2] [3,5,9,2] [[10,[[4,5,2] 11@66]]@82 -@33]@2>/58".pickRestart({
  0:stri.add(root).arp(patt).struct(stru).add("12").apply(keyb)
 ,1:stri.add(root).arp(patt).struct(stru).add("[-12,0]").apply(guit)
 ,2:stri.add(root).arp(patt).add("-24").apply(saxo)   
 ,3:root.add("-24").struct(stru).apply(bass)
 ,4:"A1".clip(.85).apply(bass)
 ,5:stri.add(root).arp(patt).add("[-12,0,12]").apply(keyb)
 ,6:"A2/4".apply(guit)
 ,7:stri.add(root).arp("[0,1]").struct(root).add(-12).apply(guit)
 ,8:"[A2,A3]".apply(guit)
 ,9:stri.add(root).arp("[0,1,2]").struct(root).add(-12).apply(guit)
 ,10:stri.add("<A G F G>/4").arp("<3 2 - - 3 2 - - 4 3 - - 1 2 - ->").add("-12,0").apply(guit)
 ,11:"<A1!5 G1!5 F1!5 G1!5>/2".apply(bass)
}).note().transpose("<0 1 0 1 0 1 0 1 0 0>/58")

$: "<0 _ [0,1] _ [2,3]@4 [2 5@82 -@33]@2 >/58".pickRestart([
  s("<sd mt@57>").struct(stru).velocity(.8),
  s("<hh/2>").restart("<x x@31 x@26>").velocity(.5),
  s(`<sd [bd,cr] bd sd _ bd bd sd _ bd bd sd _  sd _ bd bd sd _ bd _ sd bd sd _  sd _  bd _ sd _ sd
         [bd,cr] _  sd _ bd bd sd _ sd _  bd bd sd _ bd _  sd _ bd _ sd _  bd bd sd bd >`).velocity(.7),
  s("<oh/2>").restart("<x x@31 x@26>").speed(0.95).velocity(.5), 
  s("<[bd,cr] _ sd _ bd bd sd bd bd _ sd _ bd bd sd _ bd _ sd _ bd bd sd bd bd _ sd _ bd bd sd bd bd _ sd _ bd bd sd bd>").velocity(.5)
  ]).gain(.8)

all(
  x=>x.room(.35).fast(2)
)
```

---

## ilredelmondo

```strudel
// "Il Re Del Mondo (intro)"
// song @by Franco Battiato
// script @by eefano
setCps(91/60/4)
const accordi   = x => x.note().s("recorder_tenor_sus").clip(1).release(0.5)
const melodia   = x => x.note().s("sax").gain(0.3).clip(1).release(0.5)
const walking   = x => x.note().s("triangle").clip(1).release(0.1)
const ritmo     = x => x.bank("YamahaRY30").clip(1).gain(0.08)
const scaleggio = x => x.piano().gain(0.2)

const myscale = "[e:major e:minor]!3 [e:major]@0.5".slow(14)

const scala2 = "<e:major e:minor>".slow(2.5)

const verse = stack(
"[4 5 6 7]*2".scale(scala2).note().apply(scaleggio),  
"[0@4 [7 ~]!2 0@3 7@2 ~ 7 ~ 0@3 7@3]/2.5".scale(scala2).transpose(-12).apply(walking),
s("hh!4").apply(ritmo),
"<-3,-2,-1,0,1,2,3 ~@1000>".scale(myscale).velocity(0).apply(melodia).color('black')
)

const chorus = stack(
"[0,2,4]/2".scale(myscale).apply(accordi),
"[-3@3 -2 -1@3 0 -1@8 0@3 1 2@3 3 2@8 2@8 2@8 1@8]/14".scale(myscale).transpose(12).apply(melodia),
"~ -3 [0 ~] [0 ~] [1 ~] [1 ~] [2 3] [4 ~] ".scale(myscale).apply(walking),
s("[[bd [sd [~ bd]] [bd bd] sd,hh!7 oh]!13 [bd sd sd*4 lt*4,hh!3 oh ~!4]]/14").apply(ritmo),
)

arrange([10,verse],[14,chorus])

```

---

## jitterbug

```strudel
// "Jitterbug (Coda)"
// song @by Cardiacs
// script @by eefano
setDefaultVoicings('legacy')
const m1 = `f#4@3 d4@4 g4@6 g#4@4 f4@3 d#4@3 e4@4 c#4@6 b3@4 g#3@3 g#4@5 a4@4 f#4@3 d#4@3 f#4@4 g4@6 a4@4 a#4@6 d#4@3.9 ~@0.1 d#4@3`.slow(82/8);
const m2 = `f4@3 d4@4 d#4@5 e4@3 g4@4 e4@6 f#4@4 c4@2.9 ~@0.1 c4@3 g#3@4 a#3@4 b3@6 c#4@4 g4@6 a4@4 a#4@6 d#4@3.9 ~@0.1`.slow(73/8);
const m3 = `d#4@3 f#4@3.5 ~@0.5`.slow(7/8);
const m4 = `c#4@4 f#4@4 `.slow(8/8);
const m5 = `e4@4 g4@7.9 ~@0.1 f4@4 f#4@4.9 ~@0.1 d#4@3 e4@4 c#4@6.9 ~@0.1 f#4@2 f4@3.9 ~@0.1`.slow(41/8);
const melody = arrange([82/8,m1],[73/8,m2],[7/8,m3],[82/8,m1],[8/8,m4],[73/8,m2],[41/8,m5]);

const h1 = `D@2 G@2 C D#@2 G#@2 C# B@2 E@2 A F#m@2 B@2 G#@2 C#@2 A@2 D Cm@2 F#@2 D# Em@2 A@2 F# D#m@2 G#@2`.slow(40/4);
const h2 = `Cm F@2`.slow(3/4);
const h3 = `Bm@2 B@2 C@2 G@2 C A@2 D@2 Am C@2 G#@2 F#@2 E B@2 C#m@2 D# Em@2 A@2 F# D#m@2 G#@2`.slow(35/4);
const h4 = `Cm F#@2`.slow(3/4);
const h5 = `Cm F#@4 F@2`.slow(7/4);
const h6 = `C#m@2 D#@4 C#@2 F#@2 B@2 E@2 C#m@2 F#@2 A#@2`.slow(20/4);
const chords = arrange([40/4,h1],[3/4,h2],[35/4,h3],[3/4,h4],[40/4,h1],[7/4,h5],[35/4,h3],[20/4,h6]);

stack(  
 n(stack("0","1".late(.1),"2".late(.2)).fast(4)).chord(chords).anchor("G5").voicing().s("gm_pad_choir").echo(2,1/6,.7).gain(0.8), 
 chords.rootNotes(2).note().s("gm_lead_2_sawtooth").attack(0.2).sustain(1.2).lpf(1000).gain(0.4),
 melody.note().s("gm_lead_1_square").attack(0.02).sustain(1.5).lpf(1200).gain(0.75),
 s("<rd*4>").bank('LinnDrum').gain(0.07)
).cpm(115/4)
.room(    slider(0.91,0,10))
  .rsize(   slider(4,0,8,1))

```

---

## jitterbugreverse

```strudel
// "Jitterbug (Coda)" - In Reverse
// song @by Cardiacs
// script @by eefano
setDefaultVoicings('legacy')
const melody = 
  `f#4@3 d4@4 g4@6 g#4@4 f4@3 d#4@3 e4@4 c#4@6 b3@4 g#3@3 g#4@5 a4@4 f#4@3 d#4@3 f#4@4 g4@6 a4@4 a#4@6 d#4@3.9 ~@0.1 d#4@3
   f4@3 d4@4 d#4@5 e4@3 g4@4 e4@6 f#4@4 c4@2.9 ~@0.1 c4@3 g#3@4 a#3@4 b3@6 c#4@4 g4@6 a4@4 a#4@6 d#4@3.9 ~@0.1
   d#4@3 f#4@3.5 ~@0.5
   f#4@3 d4@4 g4@6 g#4@4 f4@3 d#4@3 e4@4 c#4@6 b3@4 g#3@3 g#4@5 a4@4 f#4@3 d#4@3 f#4@4 g4@6 a4@4 a#4@6 d#4@3.9 ~@0.1 d#4@3
   c#4@4 f#4@4
   f4@3 d4@4 d#4@5 e4@3 g4@4 e4@6 f#4@4 c4@2.9 ~@0.1 c4@3 g#3@4 a#3@4 b3@6 c#4@4 g4@6 a4@4 a#4@6 d#4@3.9 ~@0.1
   e4@4 g4@7.9 ~@0.1 f4@4 f#4@4.9 ~@0.1 d#4@3 e4@4 c#4@6.9 ~@0.1 f#4@2 f4@3.9 ~@0.1`
  .rev();
const chords = 
 `D@2 G@2 C D#@2 G#@2 C# B@2 E@2 A F#m@2 B@2 G#@2 C#@2 A@2 D Cm@2 F#@2 D# Em@2 A@2 F# D#m@2 G#@2
  Cm F@2
  Bm@2 B@2 C@2 G@2 C A@2 D@2 Am C@2 G#@2 F#@2 E B@2 C#m@2 D# Em@2 A@2 F# D#m@2 G#@2
  Cm F#@2
  D@2 G@2 C D#@2 G#@2 C# B@2 E@2 A F#m@2 B@2 G#@2 C#@2 A@2 D Cm@2 F#@2 D# Em@2 A@2 F# D#m@2 G#@2
  Cm F#@4 F@2
  Bm@2 B@2 C@2 G@2 C A@2 D@2 Am C@2 G#@2 F#@2 E B@2 C#m@2 D# Em@2 A@2 F# D#m@2 G#@2
  C#m@2 D#@4 C#@2 F#@2 B@2 E@2 C#m@2 F#@2 A#@2`
  .rev();

stack(  
 chord(chords).anchor("C5").voicing().s("gm_rock_organ").pan(0.4).gain(0.9), 
 chord(chords).anchor("G5").voicing().s("gm_pad_choir").pan(0.6).gain(0.9), 
 chords.rootNotes(2).note().s("gm_lead_2_sawtooth").attack(0.2).sustain(1.2).lpf(1000).gain(0.5),
 melody.note().s("gm_lead_1_square").attack(0.02).sustain(1.5).lpf(1200).gain(0.75),
).cpm(115/183).room(    slider(0.91,0,10)) .rsize(   slider(4,0,8,1))


```

---

## lovegoeson

```strudel
// "Love Goes On" (work in progress)
// song @by The Go-Betweens
// script @by eefano
const standardtuning = [40,45,50,55,59,64];

const fingering = 
{Am:"0:0:2:2:1:0",C:"x:3:2:0:1:0",
 D:"x:0:0:2:3:2", Dm:"x:0:0:2:3:1",
 G:"3:2:0:0:0:3", G7:"3:2:0:0:0:1",
 F:"1:3:3:2:1:1", A7:"x:0:2:2:2:3",
 E:"0:2:2:1:0:0", Em:"0:2:2:0:0:0", E7:"0:2:2:1:3:0",
 B7:"0:2:4:2:4:2",Bm:"0:2:4:4:3:2"
};
const sk = 300, sh = silence, strumming = 
{d: stack(0,timeCat([1,sh],[sk,1]),timeCat([2,sh],[sk,2]),timeCat([3,sh],[sk,3]),timeCat([4,sh],[sk,4]),timeCat([5,sh],[sk,5]))
,u: stack(5,timeCat([1,sh],[sk,4]),timeCat([2,sh],[sk,3]),timeCat([3,sh],[sk,2]),timeCat([4,sh],[sk,1]),timeCat([5,sh],[sk,0]))
};

const gString = register('gString', (n, pat) => 
  (pat.fmap((v) => { if(v[n]=='x') return note(0).velocity(0);
      return note(v[n]+standardtuning[n]); } 
  ).innerJoin()));
const guitar = (strums,fingers,tuning=standardtuning) =>
  (strums.pickRestart(strumming).pickOut(
    [fingers.pickOut(fingering).gString(0),fingers.pickOut(fingering).gString(1),fingers.pickOut(fingering).gString(2)
    ,fingers.pickOut(fingering).gString(3),fingers.pickOut(fingering).gString(4),fingers.pickOut(fingering).gString(5)]));

setcps(150/60)

strum:
  guitar("<d@2 d u@2 u d u >*2",
         "<0@2>/16".pickRestart(
           ["<Am Em Bm C G Em D C>/4"]))
    .s("gm_acoustic_guitar_steel:2").clip(1).release(0.4).gain(0.4).room(0.6)

voice:
    "<0 1>/16".pickRestart([
    "<2 2@2 2@2 2 2 2@2 1@2 ~@5 3 3@2 3@2 1 1@2 2@2 ~@6>*2",
    "<3 1@2 -1@2 -1 -1 0@2 1@2 ~@5 0 0@2 0@2 1 1@2 -1@4 ~@4>*2"
  ]).scale("a3:minor").note().clip(0.95).color('yellow')
   .s("gm_bassoon:2").gain(1).room(0.4)


```

---

## madeallup

```strudel
// "Made All Up (wip)"
// song @by Cardiacs
// script @by eefano
const split = register('split', (deflt, callback, pat) => callback(deflt.map((d,i)=> pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }))));
setCps(138/60)
const sequence = "<a@38 b@38 c@48 d@16 e@30 a@38 b@38 c@48 d@16 e@18 e@30>";
orch: sequence.pickRestart({
  a: `<C!2 [C B] B [B D] D!2          F!2 [F C] C [C D#] D#     A#!2 [A# F] F!2  D#!2 [D# A#] A# F!2 
       G#!2 [G# D#] [D#@3 F]@2 F C   G!2 [G D] [D@3 E]@2 E B>`,
  b: `<C#!2 [C# Fm] Fm [Fm A#] A# D#  F#!2 [F# C#] C# [C# E] E  B!2 [B F#] F#!2  E!2 [E B] B F#!2 
       A!2 [A E] [E@3 F#]@2 F# C#    G#!2 [G# D#] [D#@3 F]@2 F C>`,
  c: `<E@6 B!2>`,
  d: `<D#@6 G#m!2 E@6 B!2 >`,
  e: `<[F# D A]@6 [[[C#:1 ~]!2 [C#:1:-2 ~]!2 [C#:1:-4 ~]!2]!4]@24>`
}).split([0,0,0],t=>stack(
 
  chord(t[0])
  .anchor(sequence.pickRestart(
    {a:"<b4@7 b4@6 b4@5 c5@6 d5@7 c#5@7>",
     b:"<c5@7 c5@6 c5@5 c#5@6 d#5@7 d5@7>",
     c:"<c4>",d:"<c4>",e:"<g5>"
    })).voicing().s("gm_piano").room(.4).gain(.9).color('yellow')
  .superimpose(x=>x.late(0.1).attack(.1).velocity(.7).pan(.2)), 

  n(t[1].pickRestart(["<0>/8","<[0 ~]>"])).chord(t[0]).mode('root').anchor('e2').voicing()
  .transpose(t[2]).s("gm_electric_bass_finger").lpf(200).gain(1.4).color('cyan')
).rsize(4)
)
const choirline = note(`<c4@2 c4!3 b3 b3@2 b3 a3 [a3!2]@4
                   [c4!2]@4 c4!2 c4@2 c4 d#4 d#4@2
                   [f4!2]@4 f4 c4 [c4!2]@4
                   d#4@2 f4@2 f4 c4 c4@2 a#3@2 d#4@10 ~@20>*2`);
const mode1 = x => x.adsr([0,.1,.8,0]).clip("0.92")
  .superimpose(x=>x.transpose(12).velocity(.8).speed(1.002).pan(.4),
               x=>x.transpose(24).velocity(.4).speed(.998).pan(.6));
const mode2 = x => x.attack(.04).release(.02).clip("0.85");
choir: sequence.pickRestart({
  a: mode1(choirline),
  b: mode1(choirline.transpose(1)),
  c: mode2(note(`<~ b4@2 g#4@2 a#4@2 f#4 ~ g#4@2 a#4@2 b4@2 d#5
       ~ f#5@2 a#4@2 e5@2 d#5 ~ c#5@2 b4@2 a#4@2 ~>`)),
  d: mode2(note(`<~ a#4@2 g4@2 c5@2 b4 ~ a#4@2 f#4@2 g#4@2 ~>`)),
  e: mode2(note(`<~ c#5@2 d5@2 c#5@8 ~@18 >`))
}).s("triangle").gain(0.9).lpf(5000).color('magenta').room(.5).rsize(4)//.pdec("<0@23 1@15>")
  
const tricky = "<0@7 0@6 0@4 0 0@6 0@7 0@7>"
    .pickRestart(["<cr,<bd [sd@3 sd] [bd bd] sd [bd bd] [sd bd] sd>>"]);
drums: sequence.pickRestart({
  a: tricky, 
  b: tricky,
  c:"<cr/16,rd,<[<bd ~> <~ bd>] sd>>",
  d:"<cr/16,rd,<[<bd ~> <~ bd>] sd>>",
  e:"<[rd!3]@6 sd!22 sd*4@2>"  
}).pickOut({
  bd: s('bd').lpf(800).velocity(1.1),
  sd: s('sd').velocity(.7),
  rd: s('rd').velocity(0.3).hpf(8000),
  cr: s('cr').speed(0.7).velocity(0.1).hpf(6000),
}).bank("Linn9000").room(0.4).gain(0.5).rsize(4)

```

---

## magicandecstasy

```strudel
// "Magic And Ecstasy (Exorcist II OST)" (wip)
// song @by Ennio Morricone
// script @by eefano
setcps(145/60)
const song ="<[b,x] [b,o]@2 [b,c]@2 [b,f]@2 [b,o]@2 [b,f]@2 [b,c]@2 [b,o]@2 [b,c]@2>/24"
  
orchestra: song.pickRestart(
{b:`<[a2 [a2 b2] a2 [a2 c3] a2 [a2 d3] [d#3 d3] [c#3 d3] d#3 [d3 c#3] [d3 d#3] [d3 c#3]]!2
     [[a2:.9 b2:.9] [c3:.9 d3@3]@2 d#3 [d#3:.9 d3:.9] [c#3:.9 d3@3]@2 a2
      [a2:.9 b2:.9] [c3:.9 d3@3]@2 d#3 d3 c#3 a2@2 d#3 d3 c#3 d3 c#3@2 c#3@2]@2 >/12`
  .as("note:clip").release(.05)
  .layer(x=>x.s("gm_overdriven_guitar:6").hpf(500).lpf(2500).gain(1.2).pan(.51),
         x=>x.s("gm_electric_bass_finger").transpose(-12).lpf(400).gain(.9).pan(.49))

,o: stack(note(`<[~ c4] [a3 b3] c4 d4 d#4 f4 f#4 f4 g#4 f#4 f4 d#4 
                 [[f4 d#4] a3] b3 c4 d4 d#4 f4 f#4 g#4 c5 c#5 [[d#5 d5] a4] d5 
                 c#5 c5 a4 [[d#4 d4] a3] d5 c#5 c5 a4 d#5 d5 c#5 d5 
                 [[d#5 d5] a4] d5 c#5 d5 c#5 a4 d#4 d4 c#4 [d4 [a3 d4]] d#4 d4>`)
           .layer(x=>x.piano().gain(.7),
                  x=>x.s("gm_dulcimer").gain(.15),
                  x=>x.s("gm_piccolo").gain(.25).transpose(12),
                  x=>x.s("gm_violin").gain(.40)),
          note("<~ ~ [~ a3]!10 ~ [~ a3]!14 ~ [~ a3]!17 ~ [~ a3]!2>").piano().gain(.5),
          note("<a2>/12").fm(2).fmh(2).fmwave("sine").s("supersaw").speed(1.2).attack(.1).release(.1).gain(.25)
        ).transpose(12).color('cyan')

,c: stack(note("<[d#5@2 d5@2 c#5@7 ~]!2 [d#5@2 d5@2 c#5@2 d5 ~ d#5@2 d5@2] [c#5@2 a4@10]>/12")
          .layer(x=>x.s("gm_choir_aahs:1").patt(.1).penv(2).gain(1).pan(.45),
                 x=>x.s("gm_choir_aahs:0").patt(100).penv(.2).gain(.9).pan(.55)).hpf(600)
     ,note("<~@8 a3@4 ~@8 a3@4 ~@16 a3@8>").early(.05).s("gm_gunshot:3").hpf(1000).gain(2)).color('yellow')

,f: note(`<<[[a4 d#5] [d5 c#5] d5 [c#5@6 ~ a4]@2 [c#5@6 ~ a4]@2 [c#5@2 ~ a4] c#5@3 ~]
            [[a4 d#5] [d5 c#5] d5 [c#5@2 d#5@4 ~ a4]@2 [d#5@6 ~ a4]@2 [d#5@2 ~ a4] d#5@3 ~]>
            [[a4 d#5] [d5 c#5] d5 [c#5@2 a4@4 ~ c#5]@2 [a4@6 ~ c#5]@2 [a4@2 ~ c#5] a4@3 ~]>/12`)
    .layer(x=>x.s("gm_flute:0").gain(.7).pan(.6),
           x=>x.s("gm_flute:1").gain(.7).patt(1000).penv(-.5),
           x=>x.s("gm_piccolo").gain(.2).transpose(12).pan(.4)).release(.05).hpf(500).color('magenta')
,x:"~"})
tamb: s("tambourine*2").velocity(.8)
drums: song.pickRestart(
  {b:"~",x:"<0@10 1@2 0@12>",o:"<2@24 3@8 2@8 4@8>",c:"<0@22 1@2 5@12 4@4 4@8>",f:"<0@24 3@4 3@4 0@8 4@8>"})
  .pickRestart(
  ["<cr@24,[~ <~ oh ~ oh ~ oh oh oh ~ oh oh oh>],<~ sd>,<bd ~ [~ bd] ~>>"
  ,"<sd*2 [[sd ht] mt]>"
  ,"<cr@24,<[rd <~ rd>]>,<~ [sd <~ [~ sx]>]>,<[bd <~ bd>] ~>>"
  ,"<cr@4,<[bd sd] [sd ht] [ht mt] [[mt lt] lt]>>"
  ,"<cr@8,<[bd@3 sd] sd*2 [sd@3 ht] ht*2 [ht@3 mt] mt*2 [mt@3 lt] [lt bd]>>"
  ,"<oh!3 cr@3 cr@2>*2,<bd [sd bd] [~ bd] sd>"
  ]).pickOut({
          bd:s('bd').velocity(.65).lpf(800),
          sd:s('sd').velocity(.55).hpf(200),
          sx:s('sd').velocity(.35).hpf(200),
          cr:s('cr').velocity(.12).pan(.55),
          rd:s('rd').velocity(.15).pan(.45),
          oh:s('oh').velocity(.08).pan(.55),
          ht:s('ht').velocity(.4).pan(.4),
          mt:s('mt').velocity(.4).pan(.55),
          lt:s('lt').velocity(.3).pan(.6).hpf(100)})
  .speed(.94).bank('linn9000').gain(.6)

all(x => x.room(.3).postgain(1.6)
    //.ribbon(9*24,1*48)
    )

```

---

## mammalschilling

```strudel
// "Mammals Chilling" version 1.0
// song @by eefano
const split = register('split', (deflt, callback, pat) => callback(deflt.map((d,i)=> pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }))));
setCps(155/60)

orch: "<a b@2 a [b@11 ~]@2 c e d c>/40".pickRestart({
  a: "<<F:f3:h D7:g3:i> ~>/5",
  b: "<F:f3:h@8 Em7:b3:i@12 C:f3:i@8 D7:g3:h@12>",
  c: "<Bm7:b3:j@8 Em7:b3:k@8 F:g3:j@8 C:f3:k@8 G7:b3:j@4 G7:b3:l@4>".velocity(1.4),
  d: "<Bm7:b3:j@8 Em7:b3:k@8 F:g3:k@8 C:f3:k@8 D7:f3:j@8 >".velocity(1.6),
  e: "<<F:f3:h Em7:b3:i C:f3:h D7:g3:i> ~>/5".velocity(1.3),
}).split([0,0,0],s=>stack(
   n(s[2].pickRestart({
     h:"<~ [<0@2 2 1>@3 ~]>*2", i:"<~ [<3@2 0 1>@3]>*2",
     j:"<0 2>/2", k:"<1 <0 2>>/2", l:"<2 ~>/8"
  })).chord(s[0]).anchor(s[1].transpose(-22)).mode('above').voicing()
    .s("gm_pizzicato_strings:4").gain(1.35).color('green'),

   n(s[2].pickRestart(
     {h:"<[[0,[~ 1@40],[~@2 2@40],[~@3 3@40]] ~@2]>/2",
      i:"<[[3,[~ 2@40],[~@2 1@40],[~@3 0@40]] ~@2]>/2",
      j:"<[[~ 0@3],[~@1 1@3],[~@2 <2 3>@2],[~@3 <3 2>]]>/2",
      k:"<[[~ 3@3],[~@1 2@3],[~@2 <1 0>@2],[~@3 <0 1>]]>/2",
      l:"<[[1,[~ 2@30],[~@2 3@30],[~ 0]]]>/4"}))
  .chord(s[0]).anchor(s[1]).mode('above').voicing()
    .s("gm_acoustic_guitar_nylon").gain(.65).color('yellow')
)).room(.2)

melo: "<~ a b ~@2 c d e ~ d>/40".pickRestart({
  a: n(`<~ 4 0 ~ 1 0 ~ 1 2*3 ~@2 5 5 6 ~ 2 ~ 5 2 5 ~ 2 ~@5 6 ~ 2*3 ~@5 6 ~ 1*3 ~ [6*3]@2 
      5 4 5 ~ 2 ~ 6 ~ 4 ~@3 4 ~ 3#!2 [2 0# 2]@2 3# ~ 4 ~ 3#!2 0# ~ 3# ~ 5!2 6!2 2 ~@6>*2`).late(.1),
  b: n(`<~@4 2 ~ 3# ~ 4 ~@7 3# ~@5 7 ~ 8 ~@15 9*2 8 ~@14 8*2 6 ~@10 [4*3]@4 ~@6>*2`),
  c: n(`<7 [9 13 12@2]@3 ~@2 [9 12 13 9 8 6]@4 ~@8 [9 12 13 9 8 6]@4 ~@8 [6 8 9 13 12 9]@4 ~@6>`),
  d: n(`< ~ [~ 2] [~ 5] [~ 3#] ~@5 [~ 8] [~ 7] [~ 6] ~@8 [9*2 8] ~@7 [8*2 6] 
       ~@3 8*2 9*3 10#*4 9*5 6*3 6*4 5*5 ~>`),
  e: n(`<~@10 12 12 13 ~ 9 ~ 12 9 12 ~ ~@32 [9 12 13 9 8 6]@8 ~@100>*2`).velocity(.5).pan(.3)
}).scale('f4:major').s("gm_marimba").room(.2).gain("<.65 .75 .85>").color('cyan')

trom: "<~@2 b ~ a c d e ~ d>/40".pickRestart({
  a: `<~ [2 ~] [6:1 ~] [4 ~] ~ [2 ~] [5:1 ~] [6 ~] [1@4 0# 1]@3  
         [2 ~] [3# ~] ~ [3# 4] [4# ~] [5 ~] 7*2 6*2 5*2 [4 6:2@3]@2 4@3 
         ~ 4*2 [3# 3] 2 ~ 2*2 [1# 1] 0# [3# 0# 2@2]@3 0# [3# 6 5@2]@3 >`.clip(.9),
  b: `< ~ 2:3@5 6 ~ 4 ~ ~@4 2:3@2 1@6 9:1 ~ 8 ~ ~@6 9:1 8 ~@14 8:1 6 ~@10 [[0# ~]*3]@4 ~@20>*2`.clip(.9),
  c: `<~@10 [[[-2 ~] [1 ~] 2 [-2 ~] [3# ~] ~]!2]@8 ~@4 
            [[[3# ~] [2 ~] 1 [-1 ~] [2 ~] ~]!2]@8 ~@6 >`.clip(.9),
  d: `<[2:3@5 5]@3 [~ 3#] [~@5 2:3@2 1@6 7]@7 [~ 8] ~@4 [9:1 8] ~@7 [8:1 6] 
       ~@7 1 2 3# 2:2 -1 ~ -2 ~>`.clip(.9),
  e: `<~@30 0!2 -1!2 -2!2 -3 -1:2@3 -3@2 ~@10 [2 -2 -1 2 1 -1]@8 ~@100 >*2`.velocity(.5).pan(.7).clip(.4)
}).split([0,0],t=>n(t[0]).scale('f3:major').penv(t[1]))
  .s("gm_trombone:4").room(.2).gain(.85).color('magenta')

drums: `<[a,c]@4 [a,c,e]@7 [a,c,e,f] [v,a,b]@4 [[a,b,d]@11 g]@8 [v,a]@4 [~ a]!3 [~ h] [a,k]@4 a@4>/10`
.pickRestart({
  a:"<sh ~ sk sh ~ sk sh sk ~ sh sk ~ sh ~ sk sh ~ sk sh sk>*2",
  b:"<~@8 [~ cw]!2>", c:"<~@8 [cw ~]!2>",
  d:"<[<cm ~@3> [<cl ~>,<bd ~@7>]]>", e:"<<[<~ cl>@3 <cm,<~ bd> ~@3>]>@2>",
  f:"<~@6 [[cj*3]!2]@4>",g:"<[~ cj!6 wh@5]@8>", h:"<cj*2 cl*2 ~ wx*2 vi>",
  k:"<se@8 ~@2>",v:"<vi@40>"
}).pickOut({
  sh: s("shaker_small:0").velocity(3), sk: s("shaker_small:1").velocity(2),
  cl: s("clave").velocity(7),          cm: s("clave").velocity(4).speed(.95),
  bd: s("bongo:3").velocity(5),        cj: s("agogo").velocity(7),
  cw: s("cowbell").velocity(1.2).pan("<.2 .8>/10"),
  wh: s("ballwhistle"), wx: s("ballwhistle:1"),
  vi: s("vibraslap").velocity(.9),
  se: s("brown").adsr([1,0,1,1]).speed("<1.4 1.5>/10").pan("<.4 .6>/10")
}).room(.2).gain(1)

```

---

## mouthbreather

```strudel
// "Mouth Breather" (work in progress)
// composed @by The Jesus Lizard
// script @by eefano
setcps(215/60*2)

const xposes = "<0@9 -5 -7 0@4 ~ 0@2 -5 -7 ~@2>/48"
g:"<0@5 1 0 1 0@3 ~@2 0 ~ 0@4 ~@2 >/48".pickRestart(
  [stack("<c3@9 c#3 c3@2>","<g3 f3@2 g3@4 f3 g3 g#3 g3 f3>".add("<0,5>")).struct("<x!4 ~!2 x!9 x@3 x!6>")
  ,"<[c3,g3,c4]@6 ~@42>".add(-3).penv(-3).patt(1)
  ]).note().transpose(xposes).s("gm_electric_guitar_clean:2").distort("10:.17").room(.1)

b:"<~@3 0@2 ~ 0 ~ 0@6 ~ 0@4 ~@2 >/48".pickRestart(["<c2!3 c2@2 ~ c2!3 <[c#2 f2 c#2] [c2 f2 g2]>@3>"])
  .note().transpose(xposes).s("gm_electric_bass_pick").release(.06).distort("5:.3").room(.2).color('green')

d:"<~ 0@14 ~ 0@6>/48".pickRestart(
  [stack(s("<bd ~ bd ~!2 bd!2 ~!2 bd ~!2 bd ~!2 bd ~ bd ~ bd ~!2 bd ~>"),
        s("<~!3 sd ~!6 sd ~!5 sd ~!3 sd ~!3>").gain(1.4),
        s("<oh>/2").speed(1.03).gain(.3).pan(.4),
        s("<cr>/12").speed(1.1).gain(.2).pan(.6))])
  .room(.8).color('cyan')

// all((x)=>x.scope({scale:.05})) //._pianoroll({minMidi:10,maxMidi:60,autorange:false})

```

---

## mouthbreathercomplex

```strudel
// "Mouth Breather" (work in progress, complex variant)
// composed @by The Jesus Lizard
// script @by eefano
setcps(215/60*2)
const fvi = register('fvi', (i, d, pat) => pat.filterValues(v=>v[i]==d))
const ati = register('ati', (i, d, pat) => pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }));

// Index0 = Instrument, Index1 = Part, Index2 = Transpose
`<G@3 [G,D]@6 [G,D,B]@6 [G:1,D]@3 [G,D,B]@3 [G:1,D]@3 [G,D,B]@3 [G:0:-5,D,B:0:-5]@3 [G:0:-7,D,B:0:-7]@3 
  [D,B]@6 [G,D,B]@3 ~ [G,D,B]@6 [G:0:-5,D,B:0:-5]@3 [G:0:-7,D,B:0:-7]@3 D@3 ~@3 >/16`
.layer(  
 x=>x.fvi(0,'G').ati(1,0).pickRestart(
  [stack("<c3@9 c#3 c3@2>".pan(.51),"<g3 f3@2 g3@4 f3 g3 g#3 g3 f3>".add("<0,5>").pan(.49)).struct("<x!4 ~!2 x!9 x@3 x!6>")
  ,"<[c3,g3,c4]@3 ~@45>".add(-8).penv(-3).patt(.6).lpf(3000)
  ]).note()
  .transpose(x.fvi(0,'G').ati(2,0))
   .s("gm_electric_guitar_clean:2").hpf(80).distort("10:.17").room(.1)
 
,x=>x.fvi(0,'B').ati(1,0).pickRestart(
  ["<c2!3 c2@2 ~ c2!3 <[c#2 f2 c#2] [c2 f2 g2]>@3>"])
  .note()
  .transpose(x.fvi(0,'B').ati(2,0))
  .s("gm_electric_bass_pick").release(.06).distort("5:.31").room(.2).color('green')
  
,x=>x.fvi(0,'D').ati(1,0).pickRestart(
  ["<[bd ~ bd sd ~ bd!2 ~!2 bd sd ~ bd ~!2 bd sd bd ~ bd sd ~ bd ~],oh*12,cr*2>/24"])  
  .pickOut({bd:s('bd').lpf(1800), 
            sd:s('sd').speed(.88),
            oh:s('oh').speed(.9).velocity(.15).pan(.45),
            cr:s('cr').speed(.95).velocity(.2).pan(.55)
          }).bank("linn9000").gain(1.3).room(.85).color('cyan') 
)
```

---

## nudelimprov1

```strudel
setcpm(120/4)
let key = "<c:major c:minor>/2";
let tra = "0, 3, 5".add("<0 [0 2]>/2");

$: n("<6 3> - [2 <1 0>] <0*2 ->")
.scale(key)
.scaleTranspose(tra)
.s("kawai")
.lpf("<2000 1000 500>/2")
.gain("<0 .3 .7@2>/8")


$: n("<[2 -]*4 [0 -]*6>")
.scale(key)
.s("supersaw")
.scaleTranspose(tra)
.transpose("<0 -5>/8")
.room(.5)
.gain(.5)

$: n("<0 0 0>").scale(key).transpose(-12)
  .penv("<0 12 -12>")
  .patt(.3)
  .s("gm_fretless_bass")
  .gain(1)

$: s("white*16").clip(.5)
.speed("<<1@2 1 2> <2 3>>*16")
.hpa(.05).hpd(.05).hpe(3).hpf("<1000@2 2000 500>*8")
.gain(0.4)

$: s("<<bd bd*2> ~@14 <~@15 bd>>*8")
.speed(1.2).lpf(1000).gain(0.6).room(1)

$: 
s("- - [clap | -] clap*2:<0 4 5 1>").room(.6).gain(.5)

```

---

## oddeven

```strudel
// "Odd Even" (Work In Progress)
// song @by Cardiacs
// script @by eefano
setDefaultVoicings('legacy')
const k = 0.01;

stack(
 
  n(stack("0@2 0 3@2 3 0 3",
          "1@2 1 2@2 2 1 2".late(k),
          "2@2 2 1@2 1 2 1".late(k*2),
          "3@2 3 0@2 0 3 0".late(k*3)))
     .chord("<G [Bm E] [G@3 C]>".slow(2)).voicing()
     .s("gm_electric_guitar_jazz").clip(1).release(0.2).gain(0.5),
     
     
     `< ~!4
       [4 3 [2 ~] [1 ~] 0@2 4@2]
       [4 3 [2 ~] [1 ~] 0@2 7@2]
     >`.scale("g2:lydian").note().s("gm_bassoon")

).cpm(120/4)//.pianoroll()

```

---

## oh

```strudel
// "Oh" 
// song @by Tim Smith Spratleys Japs
// script @by eefano
setDefaultVoicings('legacy')
const ln = 24;
const cresc = saw.range(0.4,0.7).slow(ln*2);
const chrds = "G#@4 F#@2 B@3 E A@2 D G@2 A G@4 A G@4 G# C# F# B E A@2 B A@2 C D#@6 F@2 D#@4".slow(ln);
const meldy = "[d#5@4 d#5@2 d#5@3 e5 c#5@2 d5 d5@2 c#5 b4@4 c#5 b4@4 c5 f5 a#4 d#5 g#4 e5 [b4@3 d#5] f#5 d#5@2 e5 g4 g5@3 f5 a5@4 a#5@3]".slow(ln);
stack(     
  meldy.note().s('gm_piccolo').velocity(.9).gain(add(cresc,0.1)).color("yellow"), 
  
  chord(chrds).anchor("C4".transpose(run(12).slow(ln))).voicing().s('gm_choir_aahs').velocity(.8).pan(0.6).gain(add(cresc,tri.range(0,0.1).slow(ln))),
  chord(chrds).anchor("C5".transpose(run(12).slow(ln))).voicing().s('gm_string_ensemble_2').pan(0.4).gain(add(cresc,tri.range(0,0.1).slow(ln))),
  
  n("[0 1 2 3 4 3 4 5 4 3 2 3 2 1]*1.7").chord(chrds).anchor("C6").voicing().s('gm_oboe').room(0.5).gain(0.2),
  chrds.rootNotes("[1 2]!2").struct("x*8").clip(0.90).note().s('gm_electric_bass_finger').lpf(280).gain(0.5),

  s("[bd!2 ~ bd]*2").bank("AkaiLinn").lpf(300).gain(0.15),
  s("<~ sd>*4").bank("AkaiLinn").hpf(250).lpf(3500).gain(0.30),
  s("hh*8").hpf(8000).gain(0.08) 
).cpm(90/4).room(0.8) //.pianoroll()

```

---

## oldmacdonald

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

```

---

## omalley

```strudel
// "O'Malley, Former Underdog" (work in progress)
// song @by Deerhoof
// script @by eefano
setDefaultVoicings('legacy')
const crdpart = "<~@6 0@17 1@4 0@17 1@4 2@10>".pickRestart(
["< C@2 D@2 [[C ~]!3 D@2 [D ~] D@2]@2 G@2 D@3 Am G D A D@2 >"
,"< Em@2 D@2 >"
,"< [G A] [[C ~]!3 D@2 [D ~] D@2]!3 D >/2"
,"< G [D@6 G@10] >"
]);
stack("~"
,"<0@6 1@17 2@4 1@17 2@4 3@2 ~@8>".pickRestart(
["< <~ 0 1 2 3 4 5 6 7 4 5 6 7 8 9 10 11 7 8 9 10 11 12 13> ~>*8".sub(7)
,"< ~@2 5 6 7@2 6 5 6 ~ 4 ~@3 8 ~@11 7 8 9@2 8 7 8 ~ 6 ~@3 11@4 10 9 10 ~ 8 ~ 9@2 8 7 8 ~ 6 ~ 7 6 5 ~ 6 ~ 4 ~@5 >*4"
,"< 7@3 8 9@2 12@2 11@3 8 6@4 >*4"
,"< 7@2 6@2 5 6 5 4 >*4"
,"< 7 ~@7 6 ~@7 5 ~@2 5 ~ 5 4 ~@9 >*4"
]).n().scale("g3:major").s("gm_lead_1_square").room(0.4).delay(0.4).dfb(0.3).dt(60/128).gain(0.65)

,crdpart.chord().anchor("A4").voicing().s("gm_lead_8_bass_lead").room(0.4).color("blue").gain(0.5)

,s("hh*2").bank("RolandTR909").room(0.2).color("yellow").gain(0.2)
).cpm(147/2)

```

---

## piazzadegliaffari

```strudel
// "Piazza Degli Affari"
// song @by Stormy Six
// script @by eefano
// total length: 26 + 231 x 3 + 88 = 807
setcpm(104*2)
const nk = x=>n(x).scale(['E3','minor'])

const line = "<~ ~ 2 2 1 _ 3 3 2 _ 4 4 3 6 _ 3 4 8 7 4 _ 3 4 2 6 _ 0 4 _ 0 2 3 4 8 7 4 9 8 7 0 2 _ 3 4 1@4>*2"
const chrs = "<7*2 6@6 7*2 6@4 7*2 6@6 7*2 6@4 6*2 5@6 6*2 5@4 6*2 5@6 5@4 6@4 7@12>"
const melo = "<~ 0 4 3 8 7 <[9 8 7 _ 4 _] [10 9 8 _ 9 _]>@6 >/2"
const mel1 = "<~ ~ 9*2 8 10*2 9 7 ~ ~ 9*2 8 10>"
const mel2 = "<9@3 8 7 6 5 4 3@4 4@12 ~@100>*2"

const sthp = `<0@80 ~@18 ~@96     ~@51 ~@12
                    2@72 2@96     1@51 ~@12
                    2@6 [0,2]@80 2@82 1@63 0@80 ~@8>`
synth: sthp.pickRestart({
  0: stack(nk("<~ ~ ~ 14 13 17 _ 15>/2").clip("<.98@7 3.5>/2"),
           nk("<7@14 ~@2>").penv(12).patt(.8))
    .hpf(500).gain(sthp.pickRestart(["<.4 .35 .25 .2 .1>/16"])).pan(sthp.pickRestart(["<.4 .6>/16"])),
  1: nk(chrs).transpose("[-12,-5]").lpf(3000).gain(.4),
  2: nk("-14*2").clip(.4).lpf(400).gain(.8)
}).s("sawtooth").release(.05)

clean: `<~@26 0@72 0@96 ~@51 0*4@12
              0@72 0@96 ~@51 0*4@12
              0@72 ~@96 ~@51 0*4@12 0*4@12 ~@68 ~@8>`.pickRestart({
  0:nk(line)
  }).s("gm_electric_guitar_clean").hpf(1000).v(5).vmod(.2).gain(.95).color('yellow')

disto: `<~@26 2@72 2@96 0@43 1@8 2@12
              2@72 2@96 0@43 1@8 2@12
              2@72 2@96 3@51 4@24 ~@68  ~@8>`.pickRestart({
  0:nk(chrs).clip(.5).release("<.5 6@6 .5 4@4>".mul(.38)).velocity(.8).transpose("[-12,-17]").lpf(4000),
  1:nk("<5@4 6@4>").velocity(.7).transpose("[-12,-17]").lpf(4000),
  2:nk("<7@24>").clip(.2).release(8).velocity(.6).transpose("[-24,-17]").lpf(3000),
  3:nk(`< ~ ~ 7 _ 6 _ 10 _  [8 9]*6@4 11@7 7 _ 6 _ 10 _ 8@4 7@3 
          [10 9 11 10 13 11 16 13 16 13 16 13]@11 
          [11 12] [11 10] 11 9 [8 9] [8 7] 8 6>`).delay(.4).dt(.6).dfb(.15).vib(4).vibmod(.2).lpf(3000),
  4:nk("<7 ~ ~>/8").release(5).vib(8).vibmod(.2)
  }).s("gm_overdriven_guitar:3").gain(.9).color('red')

bassg: `<~@26 0@72 0@96 1@43 2@20
              0@72 0@96 1@43 2@20
              3@72 0@96 1@43 2@20 ~@80 ~@8>`.pickRestart({
  0:nk("<0@2 ~ 0@2 ~ 0@7 ~ 7 7>*2"),
  1:nk(chrs.struct("<x*2 x@2 x*2 ~ x*2 ~ x*2 x@2 x*2 ~>")),
  2:nk("<5@4 6@4 0*4@12>"), 
  3:nk("<0 0 14b 14 0 0 7b 7 0 _ 0 [14b,15]@2 [14,16]@2 0>*2")
  }).transpose(-24).s("gm_electric_bass_pick").clip(.85).hpf(50).lpf(2000).gain(1.1).color('blue')

voice: `<~@26 ~@72 [0,1]@96 [2,3]@43 [4,5]@20
              ~@72 [0,1]@96 [2,3]@43 [4,5]@20 
              ~@72 [0,6]@96 ~@43 ~@20 ~@80 ~@8>`.pickRestart({
  0:nk(melo).pan(".45").velocity(.8), 1:nk(melo.sub(7)).pan(".55").velocity(.8),
  2:nk(mel1).pan(".45").clip(.95), 3:nk(mel1.sub(5)).pan(".55").clip(.95),
  4:nk(mel2).pan(".45").clip(.95), 5:nk(mel2.sub(7)).pan(".55").clip(.95).velocity(.8),
  6:nk(line).pan(".55").clip(.8),
  }).s("square").delay(.2).dt(.6).dfb(.15).hpf(200).lpf(4000).gain(.85).color('cyan')

drums: `<5@26 [0,3,6]@72 [0,3,7]@96 1@43 [2,3]*2@8 [3,4]@12
              [0,3,6]@72 [0,3,7]@96 1@43 [2,3]*2@8 [3,4]@12 
              [0,3,6]@72 [0,3,7]@96 1@43 [2,3]*3@12 ~@8 ~@80 ~@8>`.pickRestart({
  0: stack(
    s("hh*2").speed("1*2".add(rand2.range(-.15,.15))).clip(.5).velocity(.25).hpf(5000),
    s("sd:1").struct("<x [~ x] <x x*2> [~ x] x x x <~ [~ x]>>").speed(1.1).hpf(400),
    s("<bd sd [~ bd] sd>/2")),
  1: s("<mt*2 [mt,bd,lt] ~ bd ~ bd ~ mt*2 [mt,bd,lt] ~ bd ~>"),
  2: s("<bd@4>"), 3: s("<cr@4 ~@100>").speed(1.1).velocity(.3),
  4: stack(
    s("sd:1").struct("<x ~ x x x x>*2").speed(1.1).velocity(.6).hpf(400),
    s("<bd ~ [~ bd]>, <~@10 mt*2 mt*2>")),
  5:s("<~ ~ mt@4 mt@6 mt [~ mt] lt lt ~ ~ mt lt ~ ~ ht*8@4>"),
  6:s("<~@34 mt*4 lt*4>/2"), 7:s("<~@46 ht mt>/2")
  }).bank("linndrum").gain(.4)

all(x=>x.room(.4)
 //.ribbon(26 + 72 + 96, 43 + 20)
)
```

---

## pumpupthejam

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



```

---

## pyramidsong

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

```

---

## reveileb

```strudel
// "Reveileb"
// song @by Realize Humans
// script @by eefano
setcpm(125.5)

$: "<0 0 1 2 3 4 3 4>/8".pickRestart([
  "<0 ~ ~ 4 ~ ~ 3 ~ ~ 3 ~ 2 3 ~ ~ 3 ~ 4 3 ~ 2 0 ~ -1>*3",
  "<0 [2 _ ~] 14:4@2 [11:-4@5 4]@2 [3 ~ 2] [0 ~ -1]>",
  "<0 [2 _ ~] 14:1@2 13#:-1@3 ~>",
  "<~@4 [[16 ~ 16] [15 _ 14]]*2@4 >",
  "<14 [16 _ ~] ~ [~ ~ 16] 15 [13# _ ~] ~ ~ >"
]).as("n:penv").clip(.95).scale("a#3:minor")
  .s("square").rel(.05).room(.2).lpf(5000).gain(.5)

const p = "<0 0 1 1>/16"
$: n(p.pickRestart(["<[0 ~ 2]!8 [-2 ~ 2]!4 [-1# ~ 1]!4>",
  "<[[-7 [-7,-3,0,2,<4 ~>]]*2]@8 [-9 [-9,-4,-2,0]]@4 [-10 [-10,-3,-1#,1]]@4>"
]))
  .scale("a#3:minor").s("saw").lpf(2000).room(.4)

$: s("<[bd,lt] hh [sd,ht] [hh,[bd,lt]*3]>").gain(.8).room(.8)

all(x => x.fast(8 * 8).rev().slow(8 * 8))
//all(x=>x.ribbon(8*4,16))
```

---

## rhythmofthenight

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

```

---

## satiesfaction

```strudel
// "low Effort, high Satie'sfaction"
// song @by eefano

setcps(185 / 60)
stack(
  n("<0 1 2 [1 3 4] 5 4 [6 2 3] 1 4 0>/3".add("<7@24 14>/17")),
  n("<[3,5,9] [2,5,9] [2,4,9]>/3".sub(7)).gain("<.35 .45 .25 .35>"),
  n("<[5@3 4] 5>/8".sub(14).gain("<.7@9 .8>/10"))
)
  .scale("<b3:lydian c#4:locrian>/48").s("piano")
  .postgain(sine.mul(.3).add(1.2).segment(48).slow(48 * 7))
  .room(".8").clip(1)

```

---

## savour

```strudel
// "Savour" (work in progress)
// @song by Tim Smith
// @script by eefano
setcpm(130 / 2)

const song = "<0@24 0@24 1@21 2@24>"
const ch0rds = song.pickRestart([
  "<Dm A Bb Eb Dm G Dm [Bb Eb] Dm G Dm G>/2",
  "<B@2 D@2 A E C# G# Bb F C# G# Bb G#@4 G#@3 Am>",
  "<D C D C D C Bb [F G#] C# F Dm G>/2"
]);

reed: chord(ch0rds).mode('above')
  .layer(x => x.anchor('c3').voicing().s("gm_bandoneon").hpf(200).lpf(4000).gain(.25).room(.25),
    x => x.anchor(song.pickRestart(["f4", "a4", "e4"])).voicing().struct("x").clip(.8)
      .s("gm_cello").att(.15).gain(song.pickRestart([".17",".22",".17"])).rel(.3).hpf(200).room(1.7))

bass: n(song.pickRestart(["[0@4 0 0]/2", "0", "[0@5 0]/2"])).chord(ch0rds).anchor("e2")
  .clip(.9).mode("root").voicing().transpose("<0@61 [0,12] [-1,11] [-3,9] [-5,7] [0,12] [-1,11] [-3,9] 0@25>")
  .s("gm_electric_bass_finger:2").lpf(300).gain(.7)

guit: n(song.pickRestart(["[~ 0 1 2 1 0]/2", "2*2", "[~ ~ 0 _ 1 _]"]))
  .chord(ch0rds).mode('root').anchor('c4').voicing().s("gm_electric_guitar_clean:2").release(.5).hpf(400).gain(.5)

melo: song.pickRestart([
  `<f4 [[f4@2 e4] d4] c#4 [[c#4@2 d4] e4] f4 [[f4@2 g4] a4] g4 [[g4@2 f4] d#4]
    f4 [[f4@2 e4] d4] b3 [b3@2 f4] f4 [f4@2 f4] d4 g4 f4@2 g3@2 ~@10000  >`,
  "<[f#4*6]@4 [e4:-2@2 e4] [e4@2 f#4] [g#4@2 f4] [d#4@2 c4] [f4@2 f4] [c4@2 ~] [g#4@2 f4] [d#4@2 c4] [f4@2 f4] c4:-2@2 ~@1000>",
  "< ~@8 [d4 e4 f#4]@2 [f#4 g4 a4]@2 d4 a#4 a4 g#4 f4 _ a4:4 _ ~@1000 >"
]).as("note:penv").layer(x => x.s("saw").clip(.85).adsr([0.05, .1, .7, .05]).gain(.55),
  x => x.transpose(12).s("saw").gain(.2).att(.4).rel(.4)).vib(10).vibmod(.05).hpf(400).lpf(5000).room(.4)

piano: note("<[f6 d6 b5] ~@88 f6 d6 b5 _>").gain("<0@89 .7@4>").clip(.2).rel(.7).s("gm_vibraphone:3").room(.3)

$: s("rd*3").gain(.25).speed(1.01).hpf(9000).room(.1)

all(x => x.roomsize(6)
//   .ribbon(88,10)
)

```

---

## shanghai

```strudel
// "Shanghai" (work in progress)
// song @by King Gizzard
// script @by eefano

setcps(81 / 60)

shangai: n("<0 1 2 ~ 4 5!2 ~ 4 2 1 5 8 7 9!2 7 8 5 1 2 4 ~ 5!2 4 ~ 2 1 0 -7!8>*4").scale('ab4:major').clip(.5).s("triangle").room(.8)

chords: n("<[0,2,4]!4>".add("<0 1 0 1 -2 0>/8")).scale("<ab3:major@5 bb3:major@1>/8").piano().gain(.5)

bass: n("<0@7 -4 0@6 0@4 -4 0@9 3@2 4@2>*4".add("<0 1 0 1 5 1>/8")).scale('ab1:major').clip(.95).s("gm_electric_bass_finger").lpf(800)

hh: s("<hh*4>").bank('9000').speed(1.5).gain(.2)
bd: s("<[bd@3 <~ bd>] ~>").bank('9000').gain(.7)
sd: s("<~ sd>").bank('9000').gain(.7)
```

---

## shedontusejelly

```strudel
// "She don't use jelly" (work in progress)
// composed @by The Flaming Lips
// script @by eefano
const gString = register('gString', (n,tuning, pat) => 
  (pat.fmap((v) => { if(v[n]=='x') return note(0).velocity(0);
      return note(v[n]+tuning[n]); } 
  ).innerJoin()));
const guitar = (strums,fingers,tuning=[40,45,50,55,59,64]) => (strums.pickOut(
    [fingers.pickOut(fingering).gString(0,tuning),fingers.pickOut(fingering).gString(1,tuning),fingers.pickOut(fingering).gString(2,tuning)
    ,fingers.pickOut(fingering).gString(3,tuning),fingers.pickOut(fingering).gString(4,tuning),fingers.pickOut(fingering).gString(5,tuning)]));
const split = register('split', (deflt, callback, pat) => callback(deflt.map((d,i)=> pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }))));

setCps(86 / 60 )
const fingering = 
{D5:"x:5:7:7:x:x",G5:"3:5:5:x:x:x",A5:"5:7:7:x:x:x",
 D:"10:12:12:11:10:10",C:"8:10:10:9:8:8",G:"3:5:5:4:3:3",A:"5:7:7:6:5:5"
};
const sk = 300, sh = silence, strumming = 
{d: stack(0,timeCat([1,sh],[sk,1]),timeCat([2,sh],[sk,2]),timeCat([3,sh],[sk,3]),timeCat([4,sh],[sk,4]),timeCat([5,sh],[sk,5]))
,u: stack(5,timeCat([1,sh],[sk,4]),timeCat([2,sh],[sk,3]),timeCat([3,sh],[sk,2]),timeCat([4,sh],[sk,1]),timeCat([5,sh],[sk,0]))
};
const song = "<0 1@8 2>/4"

lead: song.pickRestart(
  ["<~ ~ ~ [~ c4:7:.5]>"
  ,"<f#4 f#4*2 [a4:3:.1 f#4:-2:.1] [e4 f#4@2:3:.1 f#4]@2 f#4*2 [g4 f#4] [c#5:-2:.1 e4:2:1] >"
  ,"<f#4 ~@3>"
  ]).as("note:penv:patt").release(song.pickRestart([0,0,2]))
  .s("gm_overdriven_guitar:11").color('magenta').gain(.55).hpf(400).lpf(5000).pan(.5)

rthm: song.pickRestart(
  ["~"
  ,"<D5:d [D5:d D5:u] G5:d [G5:d A5:u@2 A5:d]@2 [G5:d G5:u] [A5:d A5:u] [G5:d ~]>"
  ,"<D5:d ~@3>"
  ]).split([0,0],s=>guitar(s[1].pickRestart(strumming),s[0]).transpose(-12)
  .release(song.pickRestart([.1,.1,2]))
  .s("gm_overdriven_guitar:6").color('cyan').hpf(700).lpf(6000)).gain(1.5).pan(.4)

bass: song.pickRestart(
  ["~"
  ,note("<d2 d2*2 g1*2 [g1 a1@2 a1]@2 g1*2 a1*2 [g1 ~]>")
  ,"~"
  ]).s("gm_electric_bass_finger").color('green').lpf(500).dist("4:.25")
 
drum: song.pickRestart(
  ["~"
  ,"<cr,[hh!15 oh],[bd sd bd*2 [sd bd] [~ sd] [bd ~] [sd bd] [bd sd]]>/8"
  ,"<cr,bd>/4"
]).pickOut({
  bd:s('linndrum_bd').hpf(50).lpf(2000).velocity(.8),
  sd:s('linndrum_sd').hpf(200).velocity(.7),
  hh:s('linndrum_hh').hpf(7000).speed(1.5).velocity(.3),
  oh:s('linndrum_oh').hpf(7000).speed(1.1).velocity(.3),
  cr:s('linndrum_cr').hpf(7000).speed(1.2).velocity(.3),
}).color('yellow').gain(1.2)

all(x=>x.rsize(.8).room(1.3)
  //  .ribbon(1*4,2*4)
  )

```

---

## sparky

```strudel
await samples({'gtr': 'gtr/0001_cleanC.wav'}, 'github:tidalcycles/Dirt-Samples/master/');

const melodia   = x => x.note().s("ocarina").gain(0.6).clip(1).release(0.1).color(2)
const guitar    = x => x.note().s("gtr").room(1).gain(0.20).clip(1).release(0.3)
const accordi   = x => x.note().s("recorder_bass_sus").gain(1.5).clip(1).release(0.5)
const basso     = x => x.note().s("gm_electric_bass_pick").gain(0.8).clip(1).sustain(0.8)
const ritmo     = x => x.bank("AlesisHR16").clip(1).gain(0.08)

const scala = "<c#4:major [f#4:major b3:major] [g#4:minor e4:major] [a4:major f#4:minor] [e4:major a4:major]>"
  stack(
 "<[0,2,4]*2>".struct("[x ~]*4").scale(scala).apply(accordi),
 "<[4 2 0 4]*2 >".scale(scala).transpose(-12).apply(guitar),
 "-3".struct("[x ~]*4").scale(scala).transpose(-12).apply(basso),
s("[sd,hh*2]!4").apply(ritmo),
).cpm(120/4)



```

---

## stacktricks

```strudel

stack("c","e","g")
  
    .withHap((hap)=>{ 
        hap.context.tempvalue=hap.value;
        hap.value=hap.context.stacking===undefined?0:hap.context.stacking[0];
        return hap;})
    
    .eq("<0 1 2>").filterValues((val) => val)
    
    .withHap((hap)=>{ 
        hap.value=hap.context.tempvalue;
        delete hap.tempvalue;
        return hap;})

  .note().piano()
  

```

---

## strangerthings

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

```

---

## strudelman

```strudel
// "Strudelman will eat you"
// @by eefano
setcps(1)

die: s("cr/16").late(666)
  .bank(rand.range(0,3).pick(["RolandTR707","RolandS50","SequentialCircuitsDrumtracks","Linn9000"]))
  .clip(rand.range(1,3))
  .loop(1).loopBegin(.1)
  .loopEnd(rand.range(.18,.3))
  .speed(rand.range(.06,.10))
  .pan(rand.range(.3,.7))
  .gain(.2).attack(.5).release(3).color('black')

doom: note("a1/8").late(333)
  .s(rand.range(0,40).pick(["numbers:0","numbers:1","numbers:2","numbers:3","numbers:4",
                            "numbers:5","numbers:6","numbers:7","numbers:8","numbers:9","~"]))
  .speed(rand.range(.2,.3))
  .gain(.9).color('black')

pain: s(`<[RolandTR707_cr,RolandS50_cr,SequentialCircuitsDrumtracks_cr,Linn9000_cr,
         numbers:0,numbers:1,numbers:2,numbers:3,numbers:4,
         numbers:5,numbers:6,numbers:7,numbers:8,numbers:9] ~@666>`).gain(0).color('black')


```

---

## strudelwall

```strudel
// "Strudelwall"
// guitar prototype @by eefano
const standardtuning = [40,45,50,55,59,64];

const fingering = 
{C:"x:3:2:0:1:0",A:"x:0:2:2:2:0",G:"3:2:0:0:0:3",E:"0:2:2:1:0:0",D:"x:0:0:2:3:2"
,Am:"0:0:2:2:1:0",Em:"0:2:2:0:0:0",Dm:"x:0:0:2:3:1",Em7:"0:2:2:0:3:3", G_:"3:2:0:0:3:3"
,Dsus4:"x:x:0:2:3:3",A7sus4:"x:0:2:0:3:3"
};
const sk = 300, sh = silence, strumming = 
{d: stack(0,timeCat([1,sh],[sk,1]),timeCat([2,sh],[sk,2]),timeCat([3,sh],[sk,3]),timeCat([4,sh],[sk,4]),timeCat([5,sh],[sk,5]))
,u: stack(5,timeCat([1,sh],[sk,4]),timeCat([2,sh],[sk,3]),timeCat([3,sh],[sk,2]),timeCat([4,sh],[sk,1]),timeCat([5,sh],[sk,0]))
//{d: "[~@0 0@300],[~@1 1@300],[~@2 2@300],[~@3 3@300],[~@4 4@300],[~@5 5@300]"
//,u: "[~@5 0@300],[~@4 1@300],[~@3 2@300],[~@2 3@300],[~@1 4@300],[~@0 5@300]"
};

const gString = register('gString', (n, pat) => 
  (pat.fmap((v) => { if(v[n]=='x') return note(0).velocity(0);
      return note(v[n]+standardtuning[n]); } 
  ).innerJoin()));
const guitar = (strums,fingers,tuning=standardtuning) =>
  (strums.pickRestart(strumming).pickOut(
    [fingers.pickOut(fingering).gString(0),fingers.pickOut(fingering).gString(1),fingers.pickOut(fingering).gString(2)
    ,fingers.pickOut(fingering).gString(3),fingers.pickOut(fingering).gString(4),fingers.pickOut(fingering).gString(5)]));

stack(
  guitar("[d@4 d@3 u d u d@2 d@3 u d u d@2 d@2 d u@2 u@2 u d u d u]/4","[Em7@9 G_@8 Dsus4@6 A7sus4@7 G_@2]/4")
    .s("gm_acoustic_guitar_steel:2").clip(1).release(0.4).gain(0.6)

).cpm(174/4)//.pianoroll()

```

---

## strumtest1

```strudel

const k = 0.02;

function tablature(te,tB,tG,tD,tA,tE)
  { return stack(tE.add(64).late(k*5),
                 tA.add(59).late(k*4),
                 tD.add(55).late(k*3),
                 tG.add(50).late(k*2),
                 tB.add(45).late(k),
                 te.add(40)); }

const guitar = seq(tablature("0","2","2","1","0","0"),
                   tablature("0","3","2","0","1","0"),
                   "~");

stack(
  guitar.note().s("gm_electric_guitar_jazz").clip(1).release(0.4).gain(0.5),

).cpm(110/4/2).pianoroll()

```

---

## strumtest2

```strudel
setDefaultVoicings('legacy')
const k = 0.01;

stack(
  n(stack("~ -1","~@0.5 0@1.5","1 1".late(k),"~ 2".late(k*2),"~ 3".late(k*3)))
     .chord("G!2 Bm E ".slow(4)).anchor("G4!2 F#4 E4".slow(4)).voicing()
     .s("gm_electric_guitar_jazz").clip(1).release(0.4).gain(0.5),

).cpm(140/4).pianoroll()
```

---

## strumtest3

```strudel
setDefaultVoicings('legacy')

const k = 0.01;

stack(
  n(stack("0@2 0 3@2 3 0 3",
          "1@2 1 2@2 2 1 2".late(k),
          "2@2 2 1@2 1 2 1".late(k*2),
          "3@2 3 0@2 0 3 0".late(k*3)))
     .chord("G!2 Bm E ".slow(4)).anchor("G4!2 F#4 A4".slow(4)).voicing()
     .s("gm_electric_guitar_jazz").clip(1).release(0.2).gain(0.5),

).cpm(140/4).pianoroll()

```

---

## swimandsleep

```strudel
// "Swim And Sleep Like A Shark" (Work In Progress)
// song @by Unknown Mortal Orchestra
// script @by eefano
setCps(123/60)
Pattern.prototype.enumerate = function () {
  const pat = this.sortHapsByPart()
  return new Pattern(state => {
    const haps = pat.query(state.withSpan(span => span.begin.wholeCycle()))
    const chunks = haps.length
    return haps.map((hap, i) => new Hap(hap.whole, hap.part.intersection(state.span), [hap.value, i, chunks])
                  ).filter(hap => hap.part != undefined)
  }).splitQueries()
}
Pattern.prototype.warp = function (tpat) {
  const pat = this;
  return tpat.enumerate().withValue(v => pat.zoom(Fraction(v[1]).div(v[2]), 
                                                  Fraction(v[1]).add(1).div(v[2])) ).outerJoin()}
function tablature(te,tB,tG,tD,tA,tE)
  { return stack(te.add(64),tB.add(59),tG.add(55),tD.add(50),tA.add(45),tE.add(40)); }

const parts = 
{theme: tablature(
"~ ~ ~ ~  ~ ~ ~ ~ ~ ~ ~  ~ ~  ~ ~  ~  ~  ~ 11  ~",
"9 ~ 9 ~ 10 9 7 ~ 9 6 ~ 10 ~ 10 ~ 12 14 14  ~ 13",
"~ ~ ~ ~  ~ ~ ~ ~ ~ ~ 6  ~ ~  ~ ~  ~  ~  ~  ~  ~",
"~ ~ ~ ~  ~ ~ ~ ~ ~ ~ ~  ~ ~  ~ ~  ~  ~  ~  ~  ~",
"7 7 ~ 7  ~ 7 5 5 ~ 4 ~  9 9  ~ 9  ~  ~ 11  ~ 11",
"~ ~ ~ ~  ~ ~ ~ ~ ~ ~ ~  ~ ~  ~ ~  ~  ~  ~  ~  ~",
).warp("t@2 t!4 [t!2]@4 t!2 [t!3]@6 t!4 t@2 t@3 t t@4").slow(16)
,arp1: tablature(
"~ ~ ~ 0 ~ ~ ~ 0 ~ ~ ~ 0",
"~ ~ ~ ~ ~ ~ ~ ~ ~ 0 ~ ~",
"~ 6 ~ ~ ~ 4 ~ ~ ~ ~ 2 ~",
"~ ~ 6 ~ ~ ~ 4 ~ ~ ~ ~ ~",
"4 ~ ~ ~ 2 ~ ~ ~ 0 ~ ~ ~",
"~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~",).slow(6)
,chords: tablature(
"~ ~ ~",
"0 2 0",
"1 2 1",
"2 2 2",
"2 0 2",
"0 ~ 0",).warp("t@3 t t@4").slow(8)
,arp2: tablature(
"~ ~ ~ 4 ~ ~ ~ ~ ~ 4 ~ ~ ~",
"~ ~ 2 ~ 2 ~ ~ 4 ~ ~ 4 ~ ~",
"~ 3 ~ ~ ~ 3 ~ ~ 4 ~ ~ 4 ~",
"~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ 4",
"~ ~ ~ ~ ~ ~ 2 ~ ~ ~ ~ ~ ~",
"2 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~",).warp("t!3 t@2 t t@2 t!6 t@2").slow(8)
,arp3: tablature(
"~ ~ ~ 0 ~ ~ ~ ~ ~ ~ 0 ~ ~ ~ ~",
"~ ~ ~ ~ ~ ~ ~ ~ 0 ~ ~ 0 ~ ~ ~",
"~ 4 ~ ~ 4 ~ ~ ~ ~ 2 ~ ~ 2 ~ ~",
"~ ~ 4 ~ ~ 4 ~ ~ ~ ~ ~ ~ ~ ~ ~",
"2 ~ ~ ~ ~ ~ 2 0 ~ ~ ~ ~ ~ 0 2",
"~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ 0",).warp("t!3 t@2 t!11").slow(8)
,lick1: tablature(
" ~  ~  ~  ~ 17  ~",
"17  ~ 17  ~  ~ 17",
" ~  ~  ~  ~  ~  ~",
" ~  ~  ~  ~  ~  ~",
"16 16  ~ 16  ~  ~",
" ~  ~  ~  ~  ~  ~",).warp("t@2 t!4 t@2").slow(4)
,lick2: tablature(
" ~  ~  ~  ~ 16  ~",
"16  ~ 16  ~  ~ 16",
" ~  ~  ~  ~  ~  ~",
" ~  ~  ~  ~  ~  ~",
"14 14  ~ 14  ~  ~",
" ~  ~  ~  ~  ~  ~",).warp("t@2 t!4 t@2").slow(4)
,coda: tablature(
"~ ~ ~ ~  ~  ~  ~ ~",
"7 5 7 9 10 10 12 9",
"~ ~ ~ ~  ~  ~  ~ ~",
"~ ~ ~ ~  ~  ~  ~ ~",
"5 4 5 7  9  9 11 7",
"~ ~ ~ ~  ~  ~  ~ ~",).warp("t@3 t!3 t@2 t@3 t t@4").slow(8)
}; // end of parts

const split = register('split', (deflt, callback, pat) => 
  callback(deflt.map((d,i)=>pat.withValue((v)=>Array.isArray(v)?(i<v.length?v[i]:d):(i==0?v:d)))));

stack(
  "<~@2 intro@16 verse@66 intro@16 verse@66 intro@16 solo@32 verse@66 intro@16 solo@32 ~@4>".pickRestart(
  {intro: "<theme@16>", 
   verse: "<arp1@6 chords@8 arp2@8 arp1@6 chords@8 arp1@6 chords@8 arp3@8 chords@8>",
   solo: "<lick1 lick2 lick2:-2 lick1:-5 lick1:-7 lick2:-7 coda@2>/4"}).split([0,0],(x)=>x[0].pickRestart(parts).transpose(x[1]))
  .note().s("gm_electric_guitar_jazz:0").clip(1).release(0.4).gain(0.6).color('yellow'),

  "<~@2 ~@16 0@66 ~@16 0@66 ~@48 0@66 ~@48 ~@4>".pickRestart([
    `<7@2 9 7 6@2 8@2 5@2 7@2 7@2 6 5 4@2 2@6 ~@2 
    4@2 4b@5 4 5 6 4@5 4 6@2 7@4 6@4 5@3 4 2@6 ~@8
    8@2 9@4 8@4 7@4 7@6 ~@7
    5@3 [4@4 5 4]@8 [3 4 5 7 5 3]@8 2@6 ~@10>*2`]).scale("e:major").transpose(12)
  .note().s("gm_ocarina").gain(0.6).color('green'),
  
  "<0@2 1@16 1@66 1@16 1@66 1@48 1@66 1@48 ~@4>".pickRestart([
    "<mt sd*4 sd lt>*2",
    "<bd ~ bd*2 bd*2>,sd,hh*2"])
  .s().bank("Linn9000").clip(1).gain(0.08).color('cyan')  
).room(0.3)
```

---

## swimmingsnake

```strudel
// "Swimming With The Snake" - Work In Progress
// song @by Tim Smith of Cardiacs
// script @by eefano
setCps(95/60)
const rando1 = `4 5 6 3 5 6 5 2 3 4 5 2 6 ~ 7 6 
4 2 5 3 6 5 3 7 4 5 6 3 7 ~ 9 4 6 7 3 5 3 6 5 1 4 5 3 4 2 3 4 5
7 8 9 7 8 9 10 6 3 7 6 4 5 6 7 8 9 3 5 6 7 8 3 5 6 7 5 6 7 9 8@2`
const rando2 = `0 1 2 -1 0 1 -2 2 1 5 4 -3 0 1 2 -2
2 1 0 1 2 0 1 0 1 -1 0 -2 0 -1 -2 -1 -2 -3 -2 -1 0 -1 0 -2 -1 -2 1 0 ~ 0 -2 0
1 3 0 1 -1 2 1 0 -1 -2 -1 0 1 -3 -1 0 1 -2@2 -1 0 1 -1 -2 1 3 4 5 -1 2 3 1`
const halo = x => 
  x.slow(20).scale("c#:minor").add(12).note()
const part = stack(rando1.apply(halo).gain(0.2), rando2.apply(halo).gain(0.1))
const pats =
{ba1: "[0@8 -1@4 -2@2 -3@2 -2@8]/24"
,ba2: "[-2 -1 0]/6"
,ba4: "[-1 -2 -3 2 -2 -5 [-4 -3 -2 -1 0 2 -4 -3]@12 -2@8]/26"
,al2: "[[5,2] ~ [5,2] [3,0] ~ [3,0] [4,1] ~ [4,1] [0,-3] ~ [0,-3]]/6"
,vr1: "[~@0.5 11 13!2 11@4 ~ 11 13!2 11 9 10 11 <[ 9@2.5 8@2 7@3 ~] [~@0.5 9@3 ~@5]>@8.5 ]/24"
,vr4: "[10 13 11 9 10 11 [9!2]@3 [7!2]@3 ~@14]/26"
,tr1: "[0 3 1 4 2 5 -1 2 0 3 1 4 2 5 3 6 4 1 2 -1 3 0 4 1]/6"
}
stack(part.layer(x=>x.pan(0.2),x=>x.pan(0.8).late(3/4)).s("gm_pad_warm").release(0.05).room(0.5).color("white")
      
,"<ba1@48 ba2@24 ba1@24 ba1@22 ba4@26 ba1@24 ba1@22 ba4@26>"
 .pickRestart(pats).scale("c#:minor").sub(12).note().s("gm_synth_strings_2").gain(1).color("green")
,"<~@48 al2@24 ~@24 ~@22 ~@26 ~@46 ~@26>".pickRestart(pats).scale("c#:minor").add(24).note()
      .s("gm_recorder").superimpose(x=>x.late(1/2).velocity(.5)).release(0.2).gain(0.4).color("red")
,stack("<~@48 ~@24 vr1@46 vr4@26 vr1@46 vr4@26>".pickRestart(pats),
       "<~@48 ~@24 ~@46 ~@26 vr1@46 vr4@26>".pickRestart(pats).sub(2))
 .scale("c#:minor").transpose(0).note().s("triangle").hpf(900).attack(.05).release(.05).clip(.97).gain(1.2).color("yellow")
,"<~@48 ~@24 ~@46 ~@26 ~@46 tr1@26>".pickRestart(pats).scale("c#4:minor")
      .superimpose(x=>x.transpose(12)).note().s("supersaw").gain(0.20).lpf(2000).color("red")
,s("shaker_small").struct("[x ~ ~ x]").gain("4.0 ~ ~ 2.0").color("brown")
,s("handbells").struct("x*2 x").gain(rand.range(0.1,0.4)).color("brown")
  
)//.pianoroll()

```

---

## tablaturetest

```strudel
// NOT WORKING UNTIL mixJoin is implemented

const k = 2;

const tablature = (pat) => reify(pat)
  .fmap(([te,tB,tG,tD,tA,tE]) => stack(
      pure(tE+64).late(k*5).color("#FFF0F0"),
      pure(tA+59).late(k*4).color("#FFE0E0"),
      pure(tD+55).late(k*3).color("#FFD000"),
      pure(tG+50).late(k*2).color("#FFD8D8"),
      pure(tB+45).late(k*1).color("#FFD0D0"),
      pure(te+40).late(k*0).color("#FFE8E8"))    
  ).outerJoin()

const guitar = tablature("0:2:2:1:0:0!2 0:3:2:0:1:0 ~");

stack(
  "E3 C3 ~".s("triangle"),
  guitar.note().s("gm_electric_guitar_jazz").clip(1).release(0.4).gain(0.5),

).slow(5).pianoroll()
```

---

## tarantella

```strudel
// "Endless Tarantella"
// script @by eefano
setcps(140/60)

//let pizza = run(16).slow(16) 
let pizza = rand.range(0,16).segment(16).slow(16)

iamme: pizza.pick(["4 ~ 4","7 ~ 7","4","4 ~ 4","5 ~ 5","5 6 5","4","4 ~ 5","4@2 3","3 ~ 4","3@2 2","2 ~ 3","4 5 4","3 2 1","0","7 ~ 7"])
  .scale("a:minor").s('gm_clarinet').note()

let pasta = pizza.pick([0,0,0,0,1,1,0,0,2,2,0,0,2,2,0,0]).fast(2)

funiculi: pasta.pick(["[0 ~] [-3 ~]","[3 ~] [-2 ~]","[1 ~] [-3 ~]"]).slow(2)
  .scale("a2:minor").s('gm_tuba').note().lpf(800)

funicula: pasta.pick(["[~@2 [0,2,4]]!2","[~@2 [1,3,5]]!2","[~@2 [4,-1,1]]!2"]).slow(2)
  .scale("a3:minor").s('gm_harmonica').note()

uagliu: s("tambourine")

```

---

## threefriends

```strudel
// "Three Friends" (work in progress)
// song @by Gentle Giant
// script @by eefano
// total length: 83
setcpm(126)  

$:chord(`<Em@4 A@2 Em@4 A@2 D@4 Em@2 Am@2 Em@2 A@2 F#m@4 G@2 [Am@5 Em@12 Bm@7]@12
          [G@5 Am@7]@6 Em@2 ~@8 Em ~ D ~ Am@2 D@2 Em@3 F#m G@2 Bm@2 A@2 D@4 Am@2 Bm>`)
  .anchor("e6").voicing()
  .layer(x=>x.s("gm_drawbar_organ").hpf(300).gain(.35).attack(.05).release(.2).pan(.6),
            x=>x.s("gm_church_organ:2").gain(.3).transpose(-12).release(.3).pan(.4))

$: n(`<0 [~ 0] 4 7 3 [~ 4] 0 [~ 4] 7 [[6@3 ~] 3@3]@2 [-4@3 ~] [-1@3 ~]@2 [~ 1@3]@2 2 -5 
      -4 [~ 2] [0 -7@3]@2 3 [4 2] 3 -4 [~ 4] 6 5 4 [3 2] 1 [3 0@3]@2 [~ -7] 0 [1 2 _ 3]@2 
      [4 -3 _ -2 _ -1]@3 [0 -7] -1 -3 [~ -4] [~ -5] [~ -6 _ -5]@2 [-7@3 ~]@2 0 1 [2 3] 
      -4 -3 -2 [-1 0] -7 [~@2 0@3 ~@3]@2 [~ 1 ~ 2]@2 [3 -4] -3 [4 3 _ 4]@2 [0 7 _ 6 _ 4]@3 
      5 [6 4] [5 3 _ 4]@2 [2 3] [1 2] [0 1] [~ 6] [-1@3 ~]@2 [~ 3] [4 2 _ 3]@2 [1 2]>`)
  .scale("e3:dorian")
  .layer(x=>x.s("gm_overdriven_guitar:3").lpf(3000).gain(.5),
         x=>x.s("gm_electric_bass_finger:2").lpf(200).gain(1.2).transpose(-12))

$: n(`<[0,2,4]@2 [0,2,4]@2 [[-2,0,3]@3 ~]@2 [[0,2,4]@5 [0,2,4]@3]@4 [-2,0,3]!2 ~ [-4,-1,1]@2 
       [-4,-1,-1] [-5,-3,-3] [-3,-1,-1] [-4,-2b,-2b]@2 [-5,-3,-1]@2 [-4,-2,-2]@2 ~@59 >`)
  .scale("e4:dorian").s("gm_choir_aahs:6").clip(.98).gain(.8).attack(.05).release(.07).hpf(600)

$: s("<0@20 1@2 0@2 2 0@3 3@4 1@2 0@3 4@13 0@4 7@4 0@4 7@2 5@2 0@3 3@2 6@3 7@3 3 6*2 6 0@2 [1 7]>"
     .pickRestart(["<[cr,bd]@3 bd sd@4 <[bd@3 sd] [[~ sd] bd]>@4>*2",
  "<[sd,[~ sd@7]] [cr,bd]@3>*2","[cr,sd]", "<~ sd ~ sd [cr,bd]@2 ~ bd>*2",
  "<~ sd!2 [bd,cr]*3@6 sd [cr,bd]@2 bd@2 sd@3 sd ~ sd ~ sd [[bd,cr]@3 bd]@4>*2",
  "<sd!2 ~ sd>*2","<bd sd [~ sd]>","<bd@3 bd sd@4>*2"])).gain(.25)    

$: s('hh').gain(.25)
all(x=>x.room(.7)  //.ribbon(64,40)
)

```

---

## togooffandthings

```strudel
// "To Go Off And Things"
// song @by Cardiacs
// script @by eefano
setcps(230/60)

$: `<0@28 1@14 2@14 1@14 2@14 3@28 1@14 2@14 3@28 1@28 4@28 
     ~@28 5@56 6@14 ~@24 7@24 ~@2 ~@42 1@14 2@14 3@21 [3,4]@7 0@3 ~@53>`
  .pickRestart([
  "<[0,6]@6 ~>",
  "<[8 7 6 5 6 7 8 9 8 7 6 <5 ~>]@6 ~>",
  "<[9 7 8]@6 6 5@5 ~@2>",
  "<[-2 [<2b 2 2b>@2 ~]!3]*3@6 ~ >",
  irand(15).seg(1),
  "<0@8 -1@6 -2@8 -3@6>".sub(6),
  "<-6@6 ~>",
  "<~ 7 ~ 5 5 ~ ~ ~ 7 ~ ~ 6 ~ 7 ~ 5 5 ~ 7 7 ~ ~ 9 7 >"
]).n().scale("d5:whole:tone").s("gm_synth_strings_1").gain(.9)

$: `<0@28 0@28 0@28 1@28 0@28 1@28 2@28 1@28 
     3@84 4@14 5@24 6@24 7@2 8@14 9@20 ~ 10@7 0@28 1@28 [8!5 ~]@3 ~@53>`
  .pickRestart([
  "<6*12@6 ~>",
  "<[[4,6,8b] [4,6b,8] [4,6,8b]]@6 ~>",
  "<[0,4b,6]@6 ~>",
  "<6@3 7 8@3 9 6@3 7 8@3 9 8 9 8 7 6 ~ 8 9 8 7 6 ~ >*2".add("<3 4 5@2 [5,7]@2 >/14"),
  "<9 8 7 6 9 8 7 6 9 8 7 6 ~ ~>*2".add("5,7"),
  "<0*2 [0,4b,2] -2*2 [-2,6,2b] 2*2 [2,4,6b]>",
  "<1*2 [1,5b,3] -1*2 [-1,5,3b] 3*2 [3,5,7b]>",
  "<[4,6,2b] [5,7,3b]>",
  "[0,6]".struct("[x*2 [x x*2] [x*2]!4 ~]/7"),
  irand(12).add(8).seg(2),
  "<12 ~ 12 10 ~ 10 ~ ~ 16!3 13 ~ ~>*2",
]).n().scale("d3:whole:tone").s("gm_distortion_guitar:3").clip(.96).rel(.02).gain(1).pan(.47)

$: `<0@28 ~@28 ~@28 1@28 ~@28 1@28 2@28 3@28 
     ~@84 ~@14 ~@24 ~@24 ~@2 ~@42 0@28 1@28 [0!5 ~]@3 ~@53>`
  .pickRestart([
  "<[0,6]@6 ~>",
  "<[~ 6!3 ~ 6b!3 ~ 6!3]@6 ~>",
  "<6!6 6*2 6!6 6*2 8!6 8*2 8!6 8*2>",
  irand(12).seg(2).add(3)
]).n().scale("d3:whole:tone").s("gm_baritone_sax").clip(.85).rel(.02).gain(.9).pan(.53)

$: `<0@28 0@28 0@28 1@28 0@28 1@28 0@28 1@28 2@28 
     3@56 0@14 ~@24 4@24 5@2 ~@14 0@21 6@7 0@28 1@28 0@3 ~@53>`
  .pickRestart([
  "<6*12@6 ~>",
  "<[4 8 4]@6 ~>",
  "<[6@3 6]!5 [6 ~ 6@3 6!2 ~]@2>/2",
  "6".add("<0@8 -1@6 -2@8 -3@6>"),
  "<7 1 5 3b 5 <5 1b 5 1b>>",
  "<4 5>",
  "<6 ~ 6 4 ~ 4 ~ ~ 10!3 7 ~ ~>*2"
]).n().scale("d2:whole:tone").s("gm_electric_bass_finger:7").pan(.5).lpf(800).gain(1)

$: `<0@25 1@3 0@25 1@3 0@25 1@3 2@28 0@25 1@3 2@28 3@25 1@3 2@25 1@3 
     4@78 5@6 3@11 1@3 8 ~@19 6@4 7@24 8@2 ~@14 0@25 9@3 0@25 1@3 2@28 10@3 11@35 ~@18>`
  .pickRestart([
  "<oh!6 ~,bd sd [~ bd] sd [~ bd] sd ~>",
  "<[oh,bd sd*2] sd*6@3>",
  "<cr,rd!8,bd sd [~ bd] sd [~ bd] sd [~ sd]>",
  "<oh!7,bd sd [~ bd] sd [~ bd] sd sd*2>",
  "hh,<bd sd>",
  "<bd [sd,oh]@2>*2",
  "<[~ [ht ht*3]] [ht*2 ht]>/2",
  "<oh!8,bd bd [~ sd] bd sd <~ sd sd ~> >",
  "cr,bd",
  "<[bd,oh sd] sd*2 ~>",
  "<sd*2 sd*2 [oh,bd]>",
  "<hh,hh!2 ~ hh!2 ~ hh!2 ~ hh!2 ~ hh ~>*2"
]).s().clip(1).rel(.15).gain(.55)

all(x=>x.room(.15)
 // .ribbon(14*21 + 24*2 + 2  ,28*4)
)
```

---

## ventocaldo

```strudel
// "Il Vento Caldo Dell'Estate (wip)"
// song @by Alice
// script @by eefano
const split = register('split', (deflt, callback, pat) => callback(deflt.map((d,i)=> pat.withValue((v)=>{
  const isobj = v.value !== undefined; const value = isobj ? v.value : v;
  const result = Array.isArray(value)?(i<value.length?value[i]:d):(i==0?value:d);
  return (i==0 && isobj) ? {...v,value:result} : result; }))));
setCps(115/60)

synt: "<a@27 b@70 b@75 ~@56 b@70 b@75 ~@56 ~@87 ~@8>".pickRestart({
  a: "<0@6 0@6 0@7 0@7 0@8 0@10 0@10>*2",
  b: "<0@6 0@6 0@6 0@7 0@7 0@6 0@6 0@6 0@6 0@7 0@7 0@6 0@8 0@10 0@8 0@10 0@8 0@10 0@10 0@10>*2"
    
}).pickRestart(["<0 4 7 8 10 11 9 12 14 12>*2"])
  .scale("c#4:major").note().s("gm_drawbar_organ:4").room(.3).lpf(1200).gain(0.7).color('yellow')

bass: "<a@172 b@56 a@145 b@56 c@87 ~@8>".pickRestart({
  a: "<[<c#2:1!22 [c#2:.8 c#2:.9] > <c#3:1!6 [c#3:.8 c#3:.9]>]>".s("gm_electric_bass_finger:2"),
  b: "<~@2 c#2:1@4 c2:1@2 a#1:1@6 c2:1@2 g#1:1@8 d#2:1@8 c2:1@8 f2:1@8 c#2:1@8>".s("triangle"),
  c: "<~@2 [[c#2!6 a#1!8 g#1!6 d#2!8 c2!8 f2!8 c#2!8]!2]@104>".fast(1.2).s("gm_electric_bass_finger:2"),
}).split([0,.6],s=>note(s[0]).clip(s[1])).lpf(400).gain(1.5).color('cyan')

wind: "<~@172 a@56 ~@145 a@56 b@87 ~@8>".pickRestart({
  a: "<~@2 C#:g#2@4 G#:g#2@2 A#m:g#2@6 C#:g#2@2 G#:g#2@8 D#:d#2@8 Cm:d#2@8 F7:d#2@8 C#:d#2@8>",
  b: "<~@2 [[C#:g#2:1@6 A#m:g#2:1@8 G#:g#2:1@6 D#:a#2:1@8 Cm:a#2:1@8 F7:a#2:1@8 C#:a#2:1@8]!2]@104>".fast(1.2)
     
}).split([0,0,0],s=>
   n(s[2].pickRestart(["<0,1,2,3>/8","<[0,1,2,3]*3>/2"]))
  .chord(s[0]).anchor(s[1]).mode('above').voicing().s("gm_church_organ").gain(0.7)
  .superimpose(u=>u.when(s[2],w=>
   n("<4 5 6 7 8 7 6 5 4>*8").chord(s[0]).anchor(s[1])).mode('above').voicing().s("sawtooth").gain(0.65))
  ).room(.7).color('green')

voic: "<~@172 a@56 ~@145 a@56 b@87 ~@8>".pickRestart({
    a: note(`<~ c#4 d#4@2 c#4@2 [c4 c#4] [d#4 f4] c#4@2 d#4@2 ~ [~ c#4] [c4 c#4] [d#4 f4] d#4 g#3@5
         ~ [~ d#4] f4@2 d#4@2 d4 d#4 ~ [~ d#4] f4@2 [g4 f4] [d#4 f4] d#4@2
         ~ [~ d#4] f4@2 d#4@2 [f4@3 d#4@3]@3 f4@9 >`)
      .s("gm_oboe").gain(1.7).lpf(3000).release(.1),
    b: note(`<~@2 [[d#4@2 c#4@2 [c4 c#4] [d#4 f4] c#4@2 [d#4@6 ~ c#4]@4 [c4 c#4] [d#4 f4] d#4 
         [g#3@8 ~ d#4]@5 f4@2 d#4@2 d4 [d#4@4 ~ d#4]@3 f4@2 g4@2 d#4@3
         [~ d#4] f4@2 d#4@2 f4@2 d#4 f4@8 [~ <c#4 ~>]]!2]@104 >`).fast(1.2)
      .s("gm_distortion_guitar:2").gain(1).lpf(3000).release(.1)
}).color('purple').room(.2)
                              
drums: `<a@27 [a,b]@24 [a,b,c]@5 [a,d]@56 [a,d,e]@2 [a,d]@20 [a,d,f]@2 [a,d]@24 [a,d,g]@2 [a,d]@10 
        ~@56 [a,d]@145 ~@56 h@87 ~@8>`.pickRestart({
  a: "<bd,hh>", b: "<~ ~ sd ~>", c:"<[~ sd*2] ~@4>", d:"<~ sd>", e:"<~ [~ sd*2]>", 
  f:"<~ [[~ sd] [sd ~]]>", g:"<~ [~ sd]>", 
  h:"<[[[sd,[~ sd@15]] sd] sd]@2 [[bd sd [~ bd] sd]!24]@96 bd@8>".fast(1.2)
}).pickOut({
  bd: s('bd').lpf(800).velocity(1.1),
  sd: s('sd').velocity(.7),
  hh: s('hh').velocity(0.1).hpf(8000),
  cr: s('cr').speed(0.7).velocity(0.1).hpf(6000),
}).bank("Linn9000").room(0.2).gain(0.8).rsize(4)

```

---

## verminmangle

```strudel
// "Vermin Mangle" (work in progress)
// song @by Tim Smith (Cardiacs)
// script @by eefano
setcps(52 / 60)
const song = `< i@8 j@27 >`
const melody = {
  i: "<f#4 ~ c#5@3 ~ a#4@2 g#4 ~ f#4 ~ a4@2 g#4 ~ f#4 ~ e4 ~ d4@2 ~@2 >*6",
  j: `<f#5@2 [e5@2 c#5] c#5 [f#4 a#4 c#5] [f#5@2 g#5] g#5 a5 [c#5@2 f#5 f#5@2 f#5] f#5 e5
       [c#5 b4 a#4 f#4] f#4 g#4 [c#4@3 a#4 e5@2] [d5 c#5 b4] [b4 a4 g4] f#4!2 g#4 [c#4@2 f#4] f#4@2 ~@100>`,
}
const ch0rds = {
  i: "<F#@2 E7@2>",
  j: "<F#@2 E7@2 F#@2 E D F# D E F# B E F# E G D B E F# D E F#@2 E@2>",
}

$: note(song.pickRestart(melody)).clip(.98)
  .apply(song.pickRestart(
    { i: x=>x.s("gm_trumpet").pan(.3).gain(.6),
      j: x=>x.s("gm_vibraphone:4").vib(10).vibmod(.09).delay(.4).dt(.2).dfb(.10).gain(.7).dec(2)
    }))
     
$: chord(song.pickRestart(ch0rds)).anchor('E4').voicing()
  .layer(x=>x.s("gm_accordion:2").struct("[~ x x]").clip(.6).pan(.40).gain(.4),
         x=>x.transpose(12).s("gm_string_ensemble_2:2").pan(.5).gain(.4))

$: n("[0 ~ ~]").chord(song.pickRestart(ch0rds)).mode('root').anchor('f#2').voicing()
  .s("gm_tuba:3").gain(1)

$: s("bassdrum2:2,tambourine:0").clip(1.5).gain(1.5)

all(x => x.room(.8))

```

---

## veronicainecstasy

```strudel
// "Veronica In Ecstasy" (Chorus)
// song @by Tim Smith (of Cardiacs)
// script @by eefano
setDefaultVoicings('legacy')
const chrds = "<B [F# A] [C G] [D C#] [E A] [B C#] [Fm A#] [E A] [A# Fm] [E F#] [E F#]>";
const meldy = `[[f#6]*3 [f#6 [~ ~ f#6]]]  [[f#6]*3 [[f#6 e6 ~] e6]]
               [[e6 e6 [e6 f#6]] [[g6 ~ d6] d6]]  [[d6 d6 [e6 f#6]] [g#6 f6 c#6]]
               [[g#5 [ ~ ~ g#5]]  [[a5 b5] c#6 c#6]]  [[f#6]*3 [f6 c#6 g#5]]
               [[g#5 [ ~ ~ g#5]] [[a#5 c6] d6 a#5]]  [[g#5 a5 b5] [c#6 d6 e6]]
               [[d6 a#5 f5] [[g#5 ~] g#5]] ~ [~@3 [~ ~ f#6]]`.slow(11);
stack(
  meldy.clip(0.9).note(),
  //meldy.transpose("-12").note(),
  chord(chrds).anchor("G4").voicing().struct("<[[~ x x] [x@2 x] [~ x ~] x]!8 [x!4] [~ x ~ x]!2>").gain(0.6),
  chrds.rootNotes(2).note().struct("<[x@2 ~]*2!9 [x ~ [~ ~ x] ~]!2>").gain(0.6),
).cpm(120/4).room(0.4).piano()//.pianoroll()
 .room(    slider(1.93,0,10))
  .rsize(   slider(2,0,8,1))
```

---

## veronicazigzag

```strudel

setDefaultVoicings('legacy')
const chrds = "<B [F# A] [C G] [D C#] [E A] [B C#] [Fm A#] [E A] [A# Fm] [E F#] [E F#]>".rev();
const meldy = `[[f#6]*3 [f#6 [~ ~ f#6]]]  [[f#6]*3 [[f#6 e6 ~] e6]]
               [[e6 e6 [e6 f#6]] [[g6 ~ d6] d6]]  [[d6 d6 [e6 f#6]] [g#6 f6 c#6]]
               [[g#5 [ ~ ~ g#5]]  [[a5 b5] c#6 c#6]]  [[f#6]*3 [f6 c#6 g#5]]
               [[g#5 [ ~ ~ g#5]] [[a#5 c6] d6 a#5]]  [[g#5 a5 b5] [c#6 d6 e6]]
               [[d6 a#5 f5] [[g#5 ~] g#5]] ~ [~@3 [~ ~ f#6]]`.slow(11).rev();
stack(
  meldy.clip(0.9).note(),
  chord(chrds).anchor("G4").voicing().struct("<[[~ x x] [x@2 x] [~ x ~] x]!8 [x!4] [~ x ~ x]!2>").gain(0.55),
  n("0").chord(chrds).mode("root:c3").voicing().struct("<[x@2 ~]*2!9 [x ~ [~ ~ x] ~]!2>").gain(0.7),
).cpm(105/4).piano()
.room(    slider(1.93,0,10))
.rsize(   slider(2,0,8,1))


```

---

## vine

```strudel
// "Vine" (work in progress)
// composed @by Tim Smith of Spratleys Japs
// script @by eefano
setCps(143 / 60 / 4)
const song = "<0@8 1@28 2@24 3@24 1@25 1@28 2@36 3@24 4@16 5@12 6@66 7@66 8@66 ~@8>*4"
const chordseq = song.pickRestart(["~",
"<C@3 G# C# Cm G# C# Cm B F# A@3>*2", // verse
"<E B C# G# A# F>*2", // chorus
"<G# C@2>/2", "~", // post-chorus
"<E@4 C@2 A#@3 D@4 C@2 G#@5 D@4>*8", // interlude
"<Dm@9 G@5 A@5 G@4 A@6 Dm@4 G@10 A@5 G@3 A@4 G@5 Dm@13 G@7 A@5 G@7 A@4 G@4 Dm@7 G@9 A@4 G@5 A@3 G@4>*8", //snare      
"<Dm@9 G@5 A@5 G@4 A@6 Dm@4 G@9 A@6 G@3 A@4 G@5 Dm@13 G@7 A@5 G@7 A@4 G@4 Dm@7 G@9 A@4 G@5 A@3 G@4>*8", //handclaps
"<Dm@9 G@6 A@5 G@4 A@6 Dm@4 G@9 A@6 G@3 A@4 G@5 Dm@13 G@7 A@5 G@7 A@4 G@4 Dm@7 G@9 A@4 G@5 A@3 G@3>*8"]); //triangle

voice: song.pickRestart(["~",
  note("<c4*2 c4 [a#3 c4] c4@2 ~ c4*2 d#4 f4 ~ d#4*2!2 d#4 c4 g#4 ~ g4 ~ [f#4 f4] [d#4 c#4] a#3 ~ [e4 d#4] e4 [e4 f#4] g#4@2 g#4>*4"),
  note("<[g#4@2 ~ f#4] [f#4@2 ~ f4] [f4@2 ~ d#4] [d#4@2 ~ d4] [d4@2 ~ c4] [c4 a4@3]>*2").gain(1.4),
  "~"
]).s('gm_oboe').clip(.95).color('yellow')

bass: n(song.pickRestart(["~","0*4","[0@2 ~ 0]*2","0*8"])).chord(chordseq).mode("root:e2").voicing()
  .s("gm_electric_bass_pick").clip(.90).lpf(300).gain(1).color('green')
guitar: n(song.pickRestart(["~","[0,2,3]*2","[[0,2,3]@3 [0,2,3]]*2","~"])).chord(chordseq).mode("root:e3").voicing()
  .s(song.pick(["~","gm_acoustic_guitar_steel:2","gm_overdriven_guitar:2","~"])).color('red')
organ: n(song.pick(["~","~","~","~","[2 1]*4"])).anchor("g5").chord(chordseq).voicing()
  .s("sawtooth").clip(.6).color('cyan')

drums: song.pickRestart([
  "<hh*4,[<bd bd*2> sd]>*2",
  "<hh*4,[bd sd]>*2",
  "<hh*4,[bd sd]>*2",
  "~","<sl*4>","<sl*4>",
  "<hh*4,[<bd bd*2> sd]>*2",
  "<hh*4,[<bd bd*2> [sd,cp]]>*2",
  "<hh*4,tr*2,[<bd bd*2> [sd,cp]]>*2",
]).pickOut({
  bd:s('linndrum_bd').lpf(3000).room(.2).velocity(.8),
  sd:s('linndrum_sd').room(.2).velocity(.65),
  hh:s('linndrum_hh').hpf(7000).speed(1.5).velocity(.3),
  oh:s('linndrum_oh'),
  sl:s('sleighbells'),
  tr:s('anvil').speed(1.15).velocity(30),
  cp:s('cp')
})

all(x=>x.room(.1)
   // .ribbon(2*4,1*8)
  )

```

---

## waltzno2

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
```

---

## warsaw

```strudel
// "Warsaw" (work in progress)
// song @by pilotredsun
// script @by eefano
setcpm(160)
const nk = x=>n(x).scale(['A#3','minor'])

const arpj = "<<5 4 2 1> 7>"; 
const main = `<6 [5 4] [3@3 ~] [2 3] 4 [3 2] 1 [~ [0 1]] [2 1] [0 -1] 0 3 2 4 [1@3 ~]@2
      [~ 6] [5 6] [4@3 ~] [1@3 ~] [~ 3] [2 1] [-3@3 ~]@2 [0 ~] [0 -1] 0 [~ [3 4]] [5 4] [3 2] 1 -3 >`;
const bass = "<-2 -3 0 2>/4"
const chrd = "<[-2,0,2] [-3,-1,0] [0,2,-3] [2,-3,-1]>/4"
const brid = "<~ 9 8 9 8 ~ 6 ~ ~ 7 8 7 2 ~ 3 ~ ~ 5 6 5 4 3 2 3 4 ~@7>*2"
const bas2 = "<6 6 2 3 5 6 2 3 6 6 2 3 5 5 6 6>/2".struct("x ~")
const brd2 = "<0# -1 -2 -1 -5 -4@2 2 0# -2 -1 -5 -4@2 -7# 2>"
const bas3 = "<-4 -3 -2 -5>/4"
const chr2 = "<[0,3,4] [1,3,4] [2,3,4] [-1,2,3]>/4"
const chr3 = "<[-2,0,4] [-1,1,4] [0,2,4] [-1,2,3]>/4"

const deep = x=>x.s("saw").lpf(700).adsr([.02,0,1,.02]).pan(.5).gain(.8)
const pads = x=>x.s("saw").gain(.15).lpf(2600).adsr([.05,0,1,.05])

orch: `< 0@2 [0,1]@2 [0,1,2,5]@2 [0,1,2,3,5]@2 [1,2,3]@2 [1,2,5]@2 [0,2,3]@2 ~ 
         [4,5,6]@2 7@2 [0,1,9]@2 [0,1,8,9]@2 [8,9,10]@2 [2,11,12] 
         [0,1,2,5,12]@2 [0,1,2,3,5,12]@2 [4,5,6]@2 7@2 [8,9,10,1]@2 [8,9,10,1,0,5]@2
         [9,10,0] [8,9,10,0] ~@3 >/16`.pickRestart(
{0: nk(arpj).s('gm_acoustic_guitar_nylon').gain(1).release(1)
,1: nk(main.add(7)).s("tri").gain(1)
,2: nk(bass.sub(14)).s("saw").lpf(1400).clip(.2).adsr([.02,0,1,1.8]).pan(.5).gain(.8)
,3: nk(chrd.add(7)).apply(pads)
,4: nk(brid).s("tri").gain(1)
,5: nk(main).s("square").gain(.5).clip(.6).lpf(600).lpa(.05).lpe(-100)
,6: nk(bas2.sub(14)).apply(deep)
,7: nk(brd2).s("gm_pad_halo:3").penv(.4).patt(10000).lpf(1400).clip(.2).adsr([0,.15,.6,1.7]).gain(1.2)
,8: nk(bas3.sub(14)).apply(deep)
,9: nk(bas3.sub(7).struct("<x@3 x@3 x@2>*2")).s("gm_pad_poly").gain(1.3).lpf(2000)
,10:nk(chr2.add(7)).apply(pads)
,11:nk(chr3.add(7)).apply(pads)
,12:nk(bass.sub(7)).apply(deep)
})
  
drums: `<0 [0,1] 1@8 [0,1,2]@2 [1,2]@2 [3,4] 
         [1,2]@2 [5,6]@2 [7,2]@2 [0,1,2]@2 [1,3]@2 1 
         1@4 8@2 8 [8,9] 8@4 [1,2]@2 [8,4]@2 [1 ~@31] >/16`.pickRestart(
{0: "<h0, <~ [h0 <~!3 h0>]>, <~@3 [~ c0]!2 ~ [~ c0] ~>>"
,1: "<hh*2, <bd [sd bd] [~ bd] sd bd sd [~ <bd!3 sd>] [sd sd*2]>>"
,2: "<~ cp>/2"
,3: "< [cb cb*2] cb*6@3 [cb*2 cb] [cb cb*2] cb*4@2 >"
,4: "<hh*2, bx [sx bx] bx [sx bx] [~ bx] [sx bx] [bx [~ bx]] [sx bx] >"
,5: `< [cb [cb cb*2] cb*2 cb]*2@8 cb*4@2 [cb*2 cb] cb*10@5 
     cb cb*14@7 cb [cb cb*2] cb*2 cb cb*4@2 [cb*2 cb] cb*2 >`
,6: `< [bx sx [~ sx] sx]*2@8 bx sx [~ sx] [~ bx] [~ sx]*2 [sx bx] [bx sx]*3@6 
    [~ sx]*2 [sx bx] [bx sx]*2@4 [~ sx] sx bx sx [~ sx] [~ bx,h1*2]>`
,7: "< <~ h1>, < bx ~!30 [sd sd*2]> >"
,8: "<[k0 k1]@3 ~@5,rd*2,oh [ ~ oh]!2 ~ oh!2 [~ oh]!2, <bd [sd bd] [~ bd] sd bd*2 [sd bd] [~ <bd!3 sd>] [sd sd*2]>>"
,9: "<yy*3 ~ ~ [rd,rd,rd]>/4"

}).pickOut(
{h0: s("hh").gain(.2)
,c0: s("cp").gain(.7).begin(0.1).speed(1.2)
,hh: s("tr808_hh").gain(.3)
,bd: s("bd").gain(.7)
,sd: s("sd").gain(.7).lpf(7000).hpf(100)
,cp: s("cp").gain(.5).begin(0.02).speed(.9)
,cb: s("9000_cb").gain(.3).hpf(1000).speed(.9).clip(.5).release(.1)
,bx: s("linndrum_bd").gain(.6)
,sx: s("dr110_sd").speed(.8).gain(.9)
,h1: s("linndrum_hh").gain(.3)
,k0: s("cr").pan(.2).gain(.3)
,k1: s("cr").pan(.8).gain(.3)
,oh: s("oh").speed(1.1).gain(.4)
,rd: s("rd").speed(1.01).gain(".6 .55")
,yy: s("sleighbells").pan("<.4 .6>").speed(.4).gain(4)
})

all(x=>x.room(.15)
 // .ribbon(40*16,16*3)
 // ._scope()
)
```

---

## whydoesmybrain

```strudel
// Why does my brain works so bad?
// an example in chords and arps modularization
// based on a song @by Moby

setcpm(98/4*2)

const mychords = {
  m1:"0,7,12,15",         // minor 1
  m2:"0,12,15,19",        // minor 2
  M1:"0,7,12,16",         // major 1
  M2:"0,12,16,19"         // major 2
}
const myarps = {
  u: "0,1,2,3",          
  a: "-@2 0 1 2 3@3",    
  b: "-@2 0@2 [1,2,3]@4", 
  c: "-@2 0 1 [2,3]@4"
}

$:   "<a3!4    e3!4    g3!4    d3!4   >"
.add("<m1!4    m2!4    M1!4    M2!4   >".pick(mychords))
.arp("<u a u b u b u c u b u a u ~ u a>".pick(myarps))
.note().s('piano')._pianoroll()


```

---

## woodeneye

```strudel
// "Woodeneye" (wip)
// song @by Cardiacs
// script @by eefano
setCps(200 / 60 / 2)
const song = "<1@16 2@16 3@7 4@4>"
const chordseq = song.pickRestart([
    "~",
    "<[~ A:f4:.6:0!15]>/4",
    "<[~ A:g4:.6!7] [F:f4:.6!8]>/2",
    "<D:d4 G:d4 A:d4:.8@2 B:g4 C:g4 G:d4:.8>",
    "<[~ D:g4:.6!3] [D:g4 A:d4]>"])

mello: chordseq.as("chord:anchor:clip:n").voicing().speed(0.97).begin(.03).s('gm_synth_bass_1').lpf(2000).gain(.7).color('cyan')

drums: song.pickRestart([
    "<oh,<~ bd!3> [sd <~!3 [sd,oh]>]>*2",
    "<hh,<~ bd!3> [sd <~!3 bd ~!3 [sd,oh]>]>*2",
    "<hh,<~ bd!3> [sd <~!3 [sd,oh]>]>*2",
    "<oh,[bd <~!3 bd>] sd>*2",
]).pickOut({
    bd: s('linndrum_bd').lpf(2000).room(.2).velocity(.8),
    sd: s('linndrum_sd').room(.2).velocity(.75),
    hh: s('linndrum_hh').hpf(7000).speed(1.5).velocity(.4),
    oh: s('linndrum_oh').speed(1.3).hpf(3000).velocity(.3).clip(1.2),
})

all(x => x.room(.1)
    // .ribbon(2*4,1*8)
)

```
