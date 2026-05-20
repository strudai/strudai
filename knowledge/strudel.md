## Part 1: API Reference

# Strudel Cheat Sheet

## Mini-Notation (inside `""` or `` ` ` ``)

- `"a b c"` — sequence (events fit in 1 cycle)
- `"[a b] c"` — nested subdivisions
- `"a*4"` `"a/2"` — speed up / slow down
- `"<a b c>"` — one per cycle (alternation)
- `"a,b,c"` — parallel/polyphony (chord/stack)
- `"~"` or `"-"` — rest
- `"a@2 b"` — elongation (weight)
- `"a!2 b"` — replicate (no speedup)
- `"a?"` `"a?0.25"` — 50% / 25% chance drop
- `"a|b|c"` — random choice
- `"bd(3,8,1)"` — euclidean (beats,segments,offset)
- `"hh:2"` — sample index
- `"a b ."` (`.` separator inside one string)
- Single quotes `'C minor'` = plain string, not parsed

## Pitch / Sound Sources

- `note("c#4 eb5 60 72")` — note names or MIDI numbers
- `freq("220 330 440")` — direct frequency in Hz
- `s("bd hh")` / `sound(...)` — samples or synth waveforms
- `n("0 1 2")` — sample index OR scale degree
- Default synth waveform = `triangle`

## Synth Waveforms

`sine` `sawtooth` `square` `triangle` `white` `pink` `brown` `crackle`
- `noise(amt)` `density(d)` — noise mixing
- `partials([...])` `phases([...])` — additive synth
- `fm(idx)` `fmh(ratio)` `fmattack` `fmdecay` `fmsustain` `fmenv`
- `vib(rate)` `vibmod(depth)` — vibrato
- ZZFX: `s("z_sawtooth")` + `curve` `slide` `zcrush` `zdelay` `pitchJump` `lfo` `tremolo`
- Wavetables: prefix `wt_` (samples loop automatically)

## Samples

- `samples('github:user/repo')` — load sample pack
- `samples({name:'path.wav'}, baseURL)` — custom map
- `samples('shabda:bass:4,hihat:4')` — freesound query
- `bank("RolandTR909")` — prefix bank name
- Default drum abbrevs: `bd sd rim cp hh oh cr rd ht mt lt sh cb tb perc misc fx`

## Sample Effects

- `begin(t)` `end(t)` — slice region (0–1)
- `loop(1)` `loopBegin` `loopEnd`
- `cut(group)` — choke group
- `clip(amt)` / `legato` — duration scale
- `chop(n)` — chop into n pieces
- `striate(n)` `slice(n,"0 1 2")` `splice(n,"...")`
- `loopAt(cycles)` `fit()` — fit sample to cycle
- `scrub(pos)` `speed(rate)`

## Filters

- `lpf(hz)` `hpf(hz)` `bpf(hz)` — cutoff
- `lpq(q)` `hpq(q)` `bpq(q)` — resonance
- `ftype('24db'|'12db')` `vowel("a e i o u")`
- Envelopes: `lpattack/lpa` `lpdecay/lpd` `lpsustain/lps` `lprelease/lpr` `lpenv` (depth); same for `hp*` and `bp*`

## Amplitude / Dynamics

- `gain(g)` `velocity(v)` `postgain(g)`
- `attack/a` `decay/d` `sustain/s` `release/r` `adsr("a:d:s:r")`
- `compressor(threshold)` `xfade(...)`
- Pitch env: `pattack/patt` `pdecay/pdec` `prelease/prel` `penv` `pcurve` `panchor`
- AM: `am(rate)` `tremolo` `tremolodepth` `tremolosync` `tremoloskew` `tremolophase` `tremoloshape`

## Spatial / Effects

- `pan(0..1)` `jux(f)` `juxBy(amt, f)`
- `room(amt)` `roomsize(s)` `roomfade` `roomlp` `roomdim` `iresponse`
- `delay(amt)` `delaytime(t)` `delayfeedback(fb)`
- `phaser(rate)` `phaserdepth` `phasercenter` `phasersweep`
- `coarse(n)` `crush(bits)` `distort(amt)` `shape(amt)`
- `orbit(n)` — separate FX bus
- `duckorbit` `duckattack` `duckdepth`

## Pattern Constructors

- `cat(a,b,c)` ≡ `"<a b c>"` (one per cycle)
- `seq(a,b,c)` ≡ `"a b c"` (sequence)
- `stack(a,b,c)` ≡ `"a,b,c"` (parallel)
- `stepcat([3,a],[2,b])` ≡ `"a@3 b@2"`
- `arrange([n,pat], ...)` — n cycles each
- `polymeter([a,b],[x,y,z])` ≡ `"{a b, x y z}"`
- `polymeterSteps(n, ...)` ≡ `"{...}%n"`
- `silence` — empty pattern
- `run(n)` — `0..n-1`
- `binary(n)` `binaryN(n,len)` — bit patterns

## Time Modifiers

- `slow(n)` / `fast(n)` ≡ `/n` `*n`
- `early(t)` `late(t)` — shift
- `rev()` `palindrome()`
- `iter(n)` `iterBack(n)` — rotate through
- `ply(n)` — repeat each event
- `segment(n)` — sample continuous to n events/cycle
- `compress(s,e)` `zoom(s,e)` — time window
- `linger(t)` — loop first portion
- `fastGap(n)` — speed up leaving silence
- `inside(n,f)` `outside(n,f)` — apply f at different rates
- `cpm(n)` `setcpm(n)` `setcps(n)` — tempo
- `swing(n)` `swingBy(amt,n)`
- `ribbon(off,n)` — slice into ribbons

## Conditional / Structural

- `every(n, f)` ≡ `firstOf(n,f)` / `lastOf(n,f)`
- `when(pat, f)` — apply f when pat is true
- `chunk(n, f)` `chunkBack(n,f)` `fastChunk(n,f)`
- `struct("x ~ x x")` — apply rhythm structure
- `mask(pat)` — gate events
- `arp("0 2 1 3")` — arpeggiate chord notes
- `arpWith(f)` — arpeggiate via function
- `reset(pat)` `restart(pat)` `hush()`
- `invert()`
- `pick({a:patA, b:patB}, "<a b>")` — pick patterns by key
- `pickmod` `pickF` `pickRestart` `pickReset` (+ mod variants)
- `inhabit({...})` `squeeze(pat, {...})`

## Random / Probabilistic

- `choose(a,b,c)` `wchoose([a,2],[b,1])`
- `chooseCycles(...)` `wchooseCycles(...)`
- `degrade()` `degradeBy(p)` `undegrade()` `undegradeBy(p)`
- `sometimes(f)` `sometimesBy(p,f)`
- `someCycles(f)` `someCyclesBy(p,f)`
- `often(f)` (75%) `rarely(f)` (25%) `almostAlways(f)` (90%) `almostNever(f)` (10%) `never(f)` `always(f)`

## Continuous Signals

`sine` `cosine` `saw` `tri` `square` `rand` `perlin` (range 0–1)
- `sine2`/`saw2`/etc — range -1 to 1
- `irand(n)` — int 0..n-1; `brand` / `brandBy(p)` — booleans
- `mouseX` `mouseY`
- `.range(min,max)` — scale a signal: `sine.range(200,800).slow(4)`

## Accumulation

- `superimpose(f)` — overlay with f applied
- `layer(f1, f2, ...)` — stack multiple transforms
- `off(time, f)` — overlay shifted + transformed: `.off(1/8, add(7))`
- `echo(n, time, feedback)`
- `echoWith(n, time, f)` `stut(n

## Part 2: Style Guide

# Strudel Community Style Guide

## File Structure

Patterns typically start with a header comment, then `setcps()` or `setcpm()`, then named parts assigned with `let`/`const` or `$:`, and end with an `arrange(...)` or `stack(...)` call.

```strudel
// @title Song Name
// @by author
setcps(120/60/4)  // or setcpm(120/4)
const chords = "<Am F C G>/2"
$: chord(chords).voicing().piano().room(.4)
```

Two dominant assignment styles coexist:
- **`let`/`const` + final `stack`/`arrange`** — for layered, section-based songs.
- **`$:` / `name:`** — labeled top-level patterns auto-stacked (more common in newer scripts).

## Drums

Drums are layered via `stack()`, almost always using `.bank("RolandTR909" | "Linn9000" | "AkaiLinn" | "LinnDrum" | "BossDR550")`. Hats and offbeats use rest tokens (`~` or `-`). Velocity/gain is tuned low per layer.

```strudel
stack(
  s("bd*4").bank("RolandTR909"),
  s("~ sd ~ sd").bank("RolandTR909"),
  s("hh*8").bank("RolandTR808").gain(.25)
)
```

Complex kits commonly use `pickOut({...})` to map symbols to processed samples:

```strudel
"<bd sd [bd bd] sd>*2".pickOut({
  bd: s('bd').velocity(.55).lpf(500),
  sd: s('sd').velocity(.55).hpf(200),
  cr: s('cr').velocity(.1).pan(.55)
}).bank("Linn9000").gain(.7)
```

## Bass

Bass lines use `.note()` with low octaves (1–2), routed through `gm_synth_bass_1`, `gm_electric_bass_finger`, `triangle`, or `sawtooth`. Filtering with `.lpf(200..400)` is near-universal.

```strudel
note("<c2 g1 eb1 f1>*4").sound("gm_synth_bass_1")
  .lpf(200).lpenv(5).lpa(.5).lpd(.1).gain(.7)
```

Chord-driven basses use `.rootNotes(2)` or `n("0").chord(c).mode('root').anchor('e2').voicing()`.

## Melody / Lead

Melodies favor either explicit `note(...)` strings or scale-relative `n(...).scale("c4:minor")`. Octaves and accidentals use lowercase letters with `b`/`#`. `@n` extends durations, `!n` repeats, `<>` alternates per cycle, `~`/`-` rest.

```strudel
n("<3 [2@2 1] [0@4 0 1]@2 [2 0 2]>")
  .scale("c4:minor").s("gm_oboe")
  .attack(.05).release(.2).gain(.5).room(.6)
```

Pads/leads frequently `.layer(x=>..., x=>...)` two timbres, pan-split (`.pan(.4)`/`.pan(.6)`) with one `.late(.01)` for stereo width.

## Chords

`chord("<Am F C G>/2").anchor("e4").voicing()` is the canonical chord progression idiom. `setDefaultVoicings('legacy')` appears in many older scripts. `.struct("x*4")` or `.struct("[x ~]*4")` imposes rhythm.

```strudel
chord("<Cm Ab Bb F>/2").anchor("G4").voicing()
  .struct("x*4").s("gm_drawbar_organ").gain(.4)
```

## Arrangement

Sections are built with `stack(...)`, then strung together with `arrange([bars, section], ...)`:

```strudel
arrange(
  [8, intro],
  [8, verse],
  [8, chorus],
  [4, outro]
).cpm(cpm)
```

For sectional gating within continuous parts, use `.mask("<1 0 0 1>")` or `pickRestart([...])` keyed off a song timeline pattern:

```strudel
const song = "<0@8 1@16 2@8>"
song.pickRestart([sectionA, sectionB, sectionC])
```

## Effects Chains

A consistent chain order emerges across scripts:
**source → `.clip()` → envelope (`.attack/.decay/.sustain/.release` or `.adsr()`) → filter (`.lpf().lpenv().lpa().lpd()`) → `.delay(level:time:fb)` or `.delay().dt().dfb()` → `.room().rsize()` → `.gain()` / `.velocity()` → `.pan()`**

```strudel
note("c4 e4 g4").s("sawtooth")
  .attack(.05).release(.2).lpf(2000).lpenv(3)
  .delay(".3:.225:.45").room(.6).gain(.5)
```

Global tail-room is often applied via `all(x => x.room(.3))` at the end.

## Recurring Habits

- **`setcps(bpm/60/divisions)`** for non-4/4 feels; `setcpm(bpm/4)` shorthand otherwise.
- **Mini-notation rests:** `~` standard, `-` also accepted; `_` extends previous note.
- **Sustains/holds:** `@n` durations, `<>` for per-cycle alternation, `[a b]` for subdivisions, `*n`/`/n` for speed.
- **`pickRestart([...])`** over `pick([...])` when sections must restart cleanly.
- **`split` helper register** is a common community macro for `[note, penv]`, `[chord, velocity]` tuples.
- **Polyphony via `.layer(x=>..., x=>...)`**, not multiple `stack` entries, when one source needs two timbres.
- **Visualizers** appended at the end: `._pianoroll()`, `._scope()`, `._punchcard()`, `._pitchwheel()` — usually on the final `arrange`.
- **GM instruments** dominate: `gm_oboe`, `gm_electric_bass_finger`, `gm_drawbar_organ`, `gm_pad_warm`, `gm_overdriven_guitar`, `gm_acoustic_guitar_steel`.
- **Sample loading:** `samples({name: 'file.wav'}, 'https://...')` then `s("name").begin().end()` for chops; `.slice(n, "<...>")` for vocal cutting.
- **Color tags** (`.color('yellow')`) are added per layer for visualizer clarity.
- **Version footer** `// @version 1.x` at file end.

## Idiomatic Snippets

Drum stack with banked kit:
```strudel
stack(
  s("bd*4, ~ sd, hh*8").bank("RolandTR909"),
  s("[~ cp]*2").bank("RolandTR808").gain(.5)
).room(.2)
```

Filtered synth bass:
```strudel
note("<c2 g1 eb1 f1>*4").s("gm_synth_bass_1")
  .lpf(300).lpenv(4).lpa(.5).lpd(.1).gain(.7)
```

Chord pad with anchored voicing:
```strudel
chord("<Am F C G>/2").anchor("e4").voicing()
  .s("gm_pad_warm").attack(.4).release(1).room(.6).gain(.4)
```

Scale-based lead with delay:
```strudel
n("<0 2 4 5 4 2 0 -3>*2").scale("c4:minor")
  .s("gm_oboe").delay(".3:.225:.45").room(.5).gain(.5)
```

Section arrangement:
```strudel
arrange(
  [8, stack(drums, bass)],
  [8, stack(drums, bass, lead)],
  [4, stack(drums, bass, lead, vocals.mask("<1 0 0 1>"))]
).cpm(120/4)
```
