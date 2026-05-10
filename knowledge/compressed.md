## Part 1: API Reference

**Core Pattern Functions**
`s(name)` `sound(name)` — play sound/sample; `note(notes)` `n(notes)` — pitch control; `freq(hz)` — direct frequency
`stack(a,b,...)` — parallel layers; `cat(a,b,...)` — sequential patterns; `seq(a,b,...)` — sequence in single cycle
`silence` `~` — rest; `pure(val)` — single value pattern

**Mini Notation**
Basic: `"a b c"` sequence, `"a,b"` parallel, `"~"` rest, `"a:2"` sample selection
Structure: `"[a b]"` subdivision, `"<a b>"` alternation, `"{a b c}%2"` polymeter
Timing: `"a*2"` faster, `"a/2"` slower, `"a@2"` elongate, `"a!2"` replicate, `"a(3,8)"` euclidean
Random: `"a?"` 50% chance, `"a?0.3"` 30% chance, `"a|b|c"` random choice

**Samples & Synths**
`bank(name)` — drum machine selection; `samples(map, baseURL)` — load custom samples
Basic synths: `"sawtooth" "square" "triangle" "sine"` `"white" "pink" "brown"` noise
Advanced: `"supersaw"` `"z_sawtooth"` etc; `.n(num)` sample number selection

**Audio Effects**
Filters: `lpf(freq)` `hpf(freq)` `bpf(freq)` — low/high/bandpass filters; `lpq(q)` `hpq(q)` `bpq(q)` — resonance
Envelope: `attack(time)` `decay(time)` `sustain(level)` `release(time)` `adsr("a:d:s:r")`
Spatial: `pan(pos)` `room(amt)` `delay(amt)` `jux(fn)` `juxBy(amt, fn)`
Distortion: `distort(amt)` `crush(bits)` `coarse(rate)` `shape(amt)`
Modulation: `vib(rate)` `vibmod(depth)` `tremolo(rate)` `phaser(rate)`
Dynamics: `gain(level)` `velocity(vel)` `compressor(settings)`

**Time Modifiers**
`slow(factor)` `fast(factor)` `early(time)` `late(time)` — timing shifts
`rev()` — reverse; `palindrome()` — play forward then backward
`euclid(hits, steps)` `euclidRot(hits, steps, rot)` — euclidean rhythms
`ply(times)` — repeat each event; `iter(shifts)` — shift pattern each cycle
`segment(rate)` — increase event density; `compress(start, end)` — time window

**Pattern Control**
`mask(pattern)` `struct(pattern)` — rhythmic templates; `when(test, fn)` — conditional application
`sometimes(fn)` `often(fn)` `rarely(fn)` — probability-based effects
`every(n, fn)` — apply every nth cycle; `off(time, fn)` — offset copy
`superimpose(fn)` `layer(fn1, fn2, ...)` — add layers; `echo(time, feedback, fn)` — delays

**Tonal Helpers**
`scale(name)` — map numbers to scale; `scaleTranspose(steps)` — transpose within scale
`chord(symbol)` — chord from symbol; `voicing()` — voice chord; `anchor(note)` — voicing anchor
`transpose(semitones)` — pitch shift; `add(interval)` `sub(interval)` — pitch arithmetic

**Signals & Randomness**
Waves: `sine` `saw` `tri` `square` `rand` `perlin` — continuous signals
`.range(min, max)` — scale signal range; `.slow(factor)` `.fast(factor)` — signal speed
Random: `choose([a,b,c])` `wchoose([[a,w1],[b,w2]])` — weighted choice
`irand(max)` — integer random; `brand()` — binary random

**Arrange & Control**
`arrange([dur, pattern], ...)` — song structure; `setcpm(cpm)` — set tempo
`$: pattern` — define pattern track; `hush()` — mute; `solo()` — solo track

## Part 2: Style Guide

**Typical Pattern Structure**
Most patterns follow this organization:
```strudel
$: s("bd sd [~ bd] sd").bank("RolandTR909").gain(.7)
$: note("c e g f").scale("C:minor").s("piano").room(.5)  
$: chord("<Am F C G>").voicing().piano().gain(.4)
```

**Common Chaining Style**
Effects typically chained in logical order: sound → envelope → filters → spatial → gain
```strudel
note("c3 eb3 g3").s("sawtooth")
  .attack(.1).decay(.2).sustain(.3).release(.4)
  .lpf(1000).room(.3).gain(.6)
```

**Mini-Notation Preferences**
- Drums: `s("bd sd [~ bd] sd")` over complex nested patterns
- Notes: Prefer scale numbers `n("0 2 4")` over note names for algorithmic work
- Timing: Use `<>` for slow alternation, `[]` for subdivision, `*` for speed
- Structure: Often nest max 2-3 levels: `"bd [hh [oh ~]] sd"`

**Naming Conventions**
- Use `$:` for main pattern tracks
- Common track types: `drums` `bass` `lead` `chords` `pads`
- Prefer descriptive names: `kick` over `p1`, `melody` over `m`

**Typical Song Architecture**
```strudel
// Setup
setcpm(120/4)

// Patterns  
$: s("bd sd").gain(.7)
$: note("c e g").s("piano")

// Alternative: arrange sections
arrange([4, intro], [16, verse], [8, chorus])
```

## Part 3: Genre Sketches

### Ambient
Slow-moving, atmospheric textures with minimal percussion. Focus on sustained pads, gentle evolving timbres, and spacious reverbs.
```strudel
note("c e g").slow(8).s("pad").attack(2).room(1)
  .superimpose(x=>x.transpose(12).gain(.3))
```

### House
Four-on-floor kick drum, filtered synths, and steady hi-hats around 125 BPM. Classic use of build-ups and breakdowns.
```strudel
$: s("bd*4").gain(.8)
$: s("[~ cp]*2, hh*8").gain(.3)
$: note("c e").s("sawtooth").lpf(sine.range(400,2000)).slow(2)
```

### Techno
Driving 4/4 rhythm, industrial sounds, repetitive patterns. Often features acid-style bass lines and mechanical percussion.
```strudel
$: s("bd*4").bank("RolandTR909").lpf(800)
$: note("c3*8").s("sawtooth").lpf(sine.range(200,800)).dist(.3)
```

### Drum & Bass
Fast breakbeats (170-180 BPM), heavy sub-bass, chopped drum loops. Complex polyrhythms over simple bass patterns.
```strudel
s("amen").chop(16).fast(2).sometimes(rev).cut(1)
note("c1").s("sine").lpf(100).every(4, add(7))
```

### Hip-hop
Swing-based drums, prominent snare on 2&4, sampled loops. Often features vinyl/lo-fi processing and sparse arrangements.
```strudel
$: s("bd ~ sd ~").swing()
$: s("hh*8").gain(.2).crush(6)
$: note("c3 eb3").s("piano").room(.8).lpf(800)
```

### Breakbeat
Syncopated drum patterns, often based on "Amen" break. Mid-tempo groove with emphasis on rhythm over melody.
```strudel
s("[bd ~] [~ sd] [bd bd] [~ sd]").sometimes(ply(2))
note("c2 g1").s("bass").dist(.2)
```

### Dub
Deep echo and reverb effects, syncopated riddims, prominent bass. Heavy use of delay feedback and spatial processing.
```strudel
$: s("bd ~ sd ~").delay(.5).delayfeedback(.7)
$: note("c2").s("bass").lpf(400).room(2)
```

### Synthwave
Retro 80s aesthetic, arpeggiated synths, gated reverb drums. Nostalgic melodies with analog-style processing.
```strudel
note("0 2 4 7").scale("C:minor").s("sawtooth")
  .lpf(1200).delay(.25).room(.8)
s("bd ~ sd ~").room(1).roomsize(8)
```

### IDM
Complex polyrhythms, glitchy textures, experimental sound design. Cerebral approach to electronic music with irregular patterns.
```strudel
s("bd(3,8,1) sd(5,16,3)").crush(rand.range(4,8))
note(irand(12)).s("sine").lpf(rand.range(200,2000))
```

### Minimal
Stripped-down arrangements, subtle variations, focus on groove over complexity. Patience with gradual evolution of simple elements.
```strudel
$: s("bd*4").sometimes(gain(.3))
$: note("c3").s("sine").every(8, add(7))
$: s("hh*8").gain(.1).sometimes(gain(0))
```