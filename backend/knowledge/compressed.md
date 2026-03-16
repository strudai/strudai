## Part 1: API Reference

**Mini-Notation Syntax:**
`seq` space `[sub]` brackets `<alt>` angles `*fast` multiply `/slow` divide `!rep` replicate `@weight` elongate `~-` rest `,` parallel `|` choose `?` random `(beats,steps,offset)` euclidean

**Core Functions:**
`s(sounds)` `sound(sounds)` `n(nums)` `note(notes)` `freq(hz)` `scale(name)` `chord(symbols)` - sound/pitch control
`stack(pats)` `cat(pats)` `seq(pats)` `arrange([n,pat])` `pick(arr)` `silence` - pattern creation
`slow(n)` `fast(n)` `rev()` `palindrome()` `early(t)` `late(t)` `compress(start,end)` `zoom(start,end)` - time manipulation

**Effects:**
`lpf(freq)` `hpf(freq)` `bpf(freq)` `lpq(q)` `hpq(q)` `bpq(q)` `vowel(vowels)` - filters
`gain(level)` `velocity(vel)` `pan(pos)` `jux(fn)` `juxBy(amt,fn)` - dynamics/stereo  
`delay(amt)` `delaytime(t)` `delayfeedback(fb)` `room(amt)` `roomsize(size)` - time/space fx
`distort(amt)` `shape(amt)` `crush(bits)` `coarse(rate)` - distortion
`attack(t)` `decay(t)` `sustain(lvl)` `release(t)` `adsr(a:d:s:r)` - envelopes
`clip(dur)` `cut(group)` `begin(pos)` `end(pos)` `speed(rate)` `chop(n)` `slice(n,pat)` - sampling

**Pattern Modifiers:**
`add(pat)` `sub(pat)` `mul(pat)` `div(pat)` `transpose(semi)` `scaleTranspose(steps)` - arithmetic
`sometimes(fn)` `often(fn)` `rarely(fn)` `degradeBy(amt)` `degrade()` - probability
`iter(n)` `ply(n)` `off(t,fn)` `echo(n,t,fb)` `layer(fn1,fn2)` `superimpose(fn)` - accumulation
`struct(pat)` `mask(pat)` `when(test,fn)` `every(n,fn)` `chunk(n,fn)` - conditional
`euclid(beats,steps)` `euclidRot(beats,steps,rot)` `swing(amt)` `linger(t)` - rhythmic

**Signals:**
`sine` `saw` `square` `tri` `rand` `perlin` `irand(n)` - continuous patterns
`.range(lo,hi)` `.slow(n)` `.fast(n)` `.segment(n)` - signal modifiers

**Tonal:**
`voicing()` `rootNotes(oct)` `mode(type)` `anchor(note)` - chord functions

**Loading Samples:**
`samples("github:user/repo")` - load external sample pack, then use sounds by name with `s()`
`samples({name: 'file.wav'}, 'https://base-url/')` - load individual samples from a URL
`s("soundname")` - play builtin sound; `s("soundname:2")` - select variant
`.bank("RolandTR909")` - switch sample bank for builtin sounds

**Slicing Drums / Sample Manipulation:**
`s("break").chop(16)` - chop sample into 16 equal slices, play in order
`s("break").slice(8, "0 3 2 [5 6] 7")` - slice into 8 parts, reorder with pattern
`s("break").splice(8, "0 3 2 5")` - like slice but auto-adjusts pitch to fit
`s("break").begin(0).end(0.25)` - play only first quarter of sample
`s("break").loopAt(4)` - stretch sample to fit 4 cycles
`s("break").fit()` - auto-fit sample length to one cycle
`s("break").speed(2)` - play at double speed; negative reverses
`samples('github:switchangel/breaks')` then `s("breaks").fit().chop(16).cut(1).sometimesBy(.5, ply("2"))` - load external breakbeats and chop into 16 slices with random double-hits

**Sliders / Interactive Control:**
`slider(default,min,max,step)` - creates a UI slider, use as value in any parameter
`.room(slider(0.5,0,1))` `.lpf(slider(800,100,4000))` - attach slider to any effect
`slider(120,60,200)` with `setcpm()` - tempo control

**Visualization:**
`._pianoroll()` `._punchcard()` - inline pianoroll (punchcard includes later transforms)
`._scope()` - inline waveform oscilloscope
`.pianoroll()` `.punchcard()` `.scope()` - same but renders to page background
`._pianoroll({minMidi:10,labels:1,fill:0})` - pianoroll with options
`.fft(n).scope({smear:.95})` - spectrum analysis; `all(x=>x.fft(4).scope())` - global
`.color("cyan magenta")` - color patterns in visuals and mini-notation highlighting

**Global:**
`setcpm(n)` `setcps(n)` `samples(map,base)` `hush()` `all(fn)` - control

## Part 2: Style Guide

**Idiomatic Patterns:**

Basic drums with method chaining:

```strudel
s("bd hh sd hh").bank("RolandTR909").room(.5)
```

Multi-layer arrangement using `$:` pattern names:

```strudel
$: s("bd*4, ~ sd, hh*8").bank("tr909")
$: note("c a f e").s("piano").room(.5)
```

Chord progressions with voicing automation:

```strudel
chord("<Am F C G>").voicing().piano().gain(.6)
```

Euclidean polyrhythms with effects:

```strudel
note("c e g").euclid(3,8).s("saw").lpf(sine.range(400,2000))
```

**Genre Examples:**

Techno (4-on-the-floor, driving):

```strudel
$: s("bd*4").gain(.8)
$: s("[~ cp]*2").gain(.4)
$: s("hh*16").gain(.1)
$: note("<c2 eb2 g1 bb1>").s("sawtooth").lpf(800)
all(x=>x.bank("RolandTR909").cpm(128/4))
```

House (groovy, offbeat hats):

```strudel
$: s("bd*4").lpf(150).gain(1)
$: s("[~ cp]*2").gain(.5)
$: s("oh*16").gain(.08).release(0)
$: note("<c2 [~ ~ c2 d2] [~ f1] ~>*4")
  .s("gm_synth_bass_2").decay(.5).lpf(1800)
all(x=>x.bank("RolandTR909").cpm(124/4).room(.3))
```

Drum & Bass (fast breaks, sub-bass):

```strudel
$: s("<bd ~ bd ~!2 bd!2 ~!2 bd ~!2 bd>*2").gain(.8)
$: s("<~!3 sd ~!6 sd ~!5 sd>*2").gain(1)
$: s("hh*16").gain(.15)
$: n("<0 0 [0 3] [-2 0]>*2")
  .scale("c2:minor").s("sawtooth").lpf(500).decay(.2)
all(x=>x.bank("RolandTR909").cpm(170/4).room(.2))
```

Hip Hop / Trap (808s, sparse kicks):

```strudel
$: s("<[bd -] [- - bd bd] [- bd] [-]>*4")
  .bank("RolandTR808").gain(1.5)
$: s("<[-] [cp] [-] [cp]>*4")
  .bank("RolandTR808").gain(1.15)
$: note("<[e2 -] [- - e2 f2] [- f1] [-]>*4")
  .s("gm_synth_bass_2").decay(.5).lpf(1800)
all(x=>x.cpm(120/4))
```

Ambient (slow pads, reverb):

```strudel
$: chord("<F C G F>/2").anchor("<F4 C4 G4 F4>/2")
  .voicing().s("gm_pad_warm")
  .release(2).room(.6).gain(.6)
$: n("<0 1 2 [1 3 4] 5 4 [6 2 3] 1>")
  .scale("g4:major").note()
  .s("gm_piccolo").room(1).gain(.5)
all(x=>x.cpm(88/4))
```

Minimal (sparse, filtered):

```strudel
$: "<[-3,0] [-4,0] [-2,0]>/4"
  .sub(7).struct("x*4").n()
  .s("supersaw").clip(1).lpf(300).lpe(2).lpd(.15)
$: s("[bd [~ <~ bd>] sd]")
  .bank("linndrum").lpf(1000).gain(.7)
$: s("rd*3").hpf(8000).gain(.1)
all(x=>x.room(.8).scale("f3:minor"))
```

Synthwave (detuned saws, arps):

```strudel
$: n("0 2 4 6 7 6 4 2").scale("<c3:major>/2")
  .s("supersaw").distort(.7)
  .superimpose(x => x.detune("<0.5>"))
  .lpf(perlin.slow(2).range(100,2000)).gain(.3)
$: "<a1 e2>/8".clip(.8).struct("x*8")
  .s("supersaw").note()
```

IDM / Glitch (irregular, textured):

```strudel
$: n("<6 3> - [2 <1 0>] <0*2 ->")
  .scale("c:major").s("kawai")
  .lpf("<2000 1000 500>/2").gain(.5)
$: s("white*16").clip(.5)
  .speed("<<1@2 1 2> <2 3>>*16")
  .hpf("<1000@2 2000 500>*8").gain(.4)
$: s("<<bd bd*2> ~@14 <~@15 bd>>*8")
  .lpf(1000).gain(.6).room(1)
```

Dub / Reggae (offbeat, heavy delay):

```strudel
$: n("<0*4 <[0 ~] [2 4]>>*2")
  .s("supersaw").scale("<D#2:major>".toscale())
  .attack(.1).clip(.95).gain(.5)
$: s("<bd ~ sd ~ ~ bd sd ~>*8")
  .bank("tr909").gain(.4)
$: n("<[8 7] [7 ~] [7 6] [6 7]!2 ~>*4")
  .scale("<D#2:major>".toscale())
  .transpose(24).s("triangle").clip(.95)
  .vib(10).vibmod(.5).gain(.5)
all(x => x.room(.3))
```

Breakbeat

```strudel

samples('github:switchangel/breaks')
setcpm(150/4)

$:stack(
  s("breaks/2").fit().scrub(irand(16).div(16).seg(8).rib("200 <10!3 13> ",1)).almostNever(ply("<2 3>")).orbit(2).gain(0.9)
  ,s("bd:2!").beat("0 10", 16)
  ,s("sd:4").beat("4 7? 12", 16)
  ,s("white!8").decay(0.05).almostNever(ply(3))
  .compressor("-20:20:10:.002:.02").gain(0.8)
  )._scope()
```

**Common Conventions:**

- Prefer `s()` over `sound()`, `n()` for indexed samples/scales
- Use `$:` for named parallel patterns, `_$:` to mute
- Chain effects after sound source: `.s("piano").room(.5).gain(.8)`
- Combine mini-notation with function calls: `"bd*4".bank("tr909")`
- Use `.slow()/.fast()` over `/2/*2` in mini-notation for clarity
- Common effect chains: `.room(.5).gain(.8)` or `.lpf(1000).release(.2)`
- Pattern arithmetic with `.add()/.sub()` rather than `+/-`
- Use angle brackets `<>` for alternating sequences, square `[]` for subdivision
- Apply `.transpose()` and `.scale()` for melodic material
- Stack textures with `.layer()` or `.superimpose()` for richness
- Use `$:` or `drums:` to split different sounds, use `_:` if you want to mute a sound
- Set the tempo using `setcpm(bpm/4)`
