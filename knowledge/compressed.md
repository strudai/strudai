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
- Use degrees over notes
