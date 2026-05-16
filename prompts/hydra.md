# Hydra in Strudel — Reference

## Part 1: Strudel Integration

Call `await initHydra()` at the top of a Strudel cell. After that, all Hydra functions (`osc`, `noise`, `src`, `o0`...`o3`, `s0`...`s3`, `a`, `H`, `render`) are available alongside Strudel patterns in the same cell.

```hydra
await initHydra()
osc(10, 0.9, 300).color(0.9,0.7,0.8).kaleid().out()
note("c a f e").s("sawtooth")
```

**`H(pattern)`** — converts a Strudel mini-notation pattern into a Hydra-usable value (sampled per frame):

```hydra
await initHydra()
shape(H("3 4 5 [6 7]*2")).out(o0)
n("3 4 5 [6 7]*2").scale("A:minor").piano()
```

**Audio reactivity** — pass `{detectAudio:true}`; use `a.fft[i]` (`i` = bin index) as a function arg:

```hydra
await initHydra({detectAudio:true})
shape(H("<3 4 5>")).scrollY(()=> a.fft[0]*.25)
  .add(src(o0).color(.71).scrollX(.005), .95).out(o0)
n("<3 4 5>").scale("A:minor").piano()
```

**`feedStrudel:1`** — pipes Strudel's built-in visualizers (`.scope`, `.fft`, etc.) into source `s0` so Hydra can transform them:

```hydra
await initHydra({feedStrudel:1})
src(s0).kaleid(H("<4 5 6>")).diff(osc(1,.5,5)).out()
$: s("bd*4, hh*8")
all(x=>x.fft(4).scope({pos:0,smear:.95}))
```

Other `initHydra` opts mirror hydra-synth: `canvas, width, height, numSources, numOutputs, precision`, etc.

---

## Part 2: API Reference

### Sources (start a chain)
- `osc(freq=60, sync=0.1, offset=0)` — color oscillator stripes.
- `noise(scale=10, offset=0.1)` — Perlin-like noise.
- `voronoi(scale=5, speed=0.3, blending=0.3)` — voronoi cells.
- `shape(sides=3, radius=0.3, smoothing=0.01)` — polygon (4→square, 64→circle).
- `gradient(speed=0)` — animated rainbow gradient.
- `solid(r=0, g=0, b=0, a=1)` — flat color.
- `src(tex)` — feed in an output (`o0`...`o3`) or source buffer (`s0`...`s3`).

### Geometry transforms
- `rotate(angle=10, speed=0)` — radians.
- `scale(amount=1.5, xMult=1, yMult=1, offsetX=0.5, offsetY=0.5)`.
- `pixelate(pixelX=20, pixelY=20)`.
- `kaleid(nSides=4)` — mirror slices.
- `repeat(repeatX=3, repeatY=3, offsetX, offsetY)`; also `repeatX`, `repeatY`.
- `scroll(scrollX=0.5, scrollY=0.5, speedX=0, speedY=0)`; also `scrollX`, `scrollY`.
- `posterize(bins=3, gamma=0.6)` — (color-ish, but commonly grouped).

### Color transforms
- `color(r, g, b, a=1)` — multiply RGBA.
- `colorama(amount=0.005)` — shift through hue space.
- `brightness(amount=0.4)`.
- `contrast(amount=1.6)`.
- `invert(amount=1)`.
- `luma(threshold=0.5, tolerance=0.1)` — alpha mask by luminance.
- `thresh(threshold=0.5, tolerance=0.04)` — black/white.
- `saturate(amount=2)`.
- `hue(amount=0.4)` — hue rotate.
- `shift(r=0.5, g=0, b=0, a=0)` — channel shift.

### Blending (combine two textures)
- `add(tex, amount=1)` — additive.
- `sub(tex, amount=1)` — subtractive.
- `mult(tex, amount=1)` — multiply.
- `diff(tex)` — absolute difference (great for "infinite" feedback).
- `layer(tex)` — alpha composite top.
- `mask(tex, reps, offset)` — use tex as alpha.
- `blend(tex, amount=0.5)` — average.

### Modulation (use tex's color to displace coords)
- `modulate(tex, amount=0.1)` — displace by R/G channels.
- `modulateRotate(tex, multiple=1, offset=0)`.
- `modulateScale(tex, multiple=1, offset=1)`.
- `modulateRepeat(tex, repeatX, repeatY, offsetX, offsetY)`.
- `modulatePixelate(tex, multiple=10, offset=3)`.
- `modulateHue(tex, amount=1)`.
- Also: `modulateScrollX/Y`, `modulateKaleid`.

### Outputs
- `.out(buf=o0)` — render chain to output buffer. Default `o0`.
- `o0, o1, o2, o3` — four output buffers; reference them with `src(o0)` for feedback.
- `render(buf?)` — show single buffer fullscreen; `render()` with no args splits into 4 panes.

### External sources
- `s0, s1, s2, s3` — source buffers (camera, video, image, canvas).
- `s0.initCam(index=0)` — webcam.
- `s0.initImage(url)` — image (jpg/png/gif).
- `s0.initVideo(url)` — video file.
- `s0.initScreen()` — screen-share.
- `s0.init({src: element, dynamic: true})` — generic; pass canvas/video DOM nodes.
- `s0.clear()`.

### Audio
- `a.show() / a.hide()` — debug FFT display.
- `a.setBins(n)` — split spectrum into n bands.
- `a.setSmooth(0..1)` — temporal smoothing.
- `a.setCutoff(v)` / `a.setScale(v)` — gate/limit per band.
- `a.fft[i]` — normalized bin value (0..1).
- `a.vol` — overall volume; `a.onBeat = () => {...}`; `a.beat.threshold`.

### Dynamic arguments
Any arg can be a function (evaluated per frame), an array (sequenced over time), or `H("...")` (Strudel pattern). Globals: `time` (seconds), `mouse.x/y`.

```hydra
osc(()=> a.fft[0]*60, [0.1,0.5], 0).out()
```

---

## Part 3: Idiomatic Snippets

**Basic oscillator with kaleid:**
```hydra
await initHydra()
osc(5, -0.126, 0.514).rotate(0, 0.2).kaleid(4).repeat(2,2).out()
```

**Audio-reactive scale + rotate (mic):**
```hydra
await initHydra({detectAudio:true})
a.setBins(3); a.setSmooth(0.8)
osc(60,0.1,0).saturate(0.7).pixelate(10,15)
  .rotate(()=> a.fft[1]*Math.PI)
  .scale(()=> 1 + a.fft[0]).out(o0)
```

**Strudel pattern → visual:**
```hydra
await initHydra()
shape(H("<3 4 5 [6 7]*2>"), 0.4, 0.05)
  .color(1, 0.4, 0.8).kaleid(H("<4 6 8>")).out()
n("<0 2 4 7>").scale("D:minor").s("sawtooth")
```

**Layered sources with diff/modulate:**
```hydra
await initHydra()
osc(10, 0.1, 1.2)
  .blend(noise(3))
  .diff(shape(4, 0.6).rotate(0, 0.1))
  .modulate(osc(2, -0.25, 1), 0.3).out()
```

**Feedback loop (`src(o0)` re-entering its own output):**
```hydra
await initHydra()
src(o0).scale(1.01).rotate(0.01)
  .layer(shape(64, 0.1).luma(0.1, 0.01).color(1, 0.3, 0.6))
  .modulateHue(src(o0).scale(0.9), 1).out(o0)
```

**Webcam processed and split across outputs:**
```hydra
await initHydra()
s0.initCam()
src(s0).out(o0)
osc(10).out(o1)
src(o0).modulate(o1, 0.2).kaleid(6).out(o2)
render() // 4-up view
```

---

## Part 4: Gotchas

- **Always end chains with `.out()`** or nothing renders. Default target is `o0`.
- **`render()` with no args splits the screen into 4** — pass a buffer (`render(o0)`) for fullscreen.
- **Audio reactivity needs `{detectAudio:true}`** in `initHydra` and mic permission; `a.fft[i]` is `0` otherwise.
- **Use functions, not static values, for animation:** `rotate(()=> time*0.1)` animates; `rotate(time*0.1)` freezes at eval time.
- **`H("...")` only works inside Hydra args** after `initHydra()` — it returns a function sampled per frame.
- **`src(o0)` feedback can blow up** to white/black; tame with `.scale(0.99)`, `.color(0.98,...)`, or `.mult(solid(),0.02)`.
- **External media (`initImage`, `initVideo`) often hits CORS** — use CDN-hosted assets or local files; YouTube/Vimeo URLs don't work directly.
- **In Strudel, `initHydra` must be `await`ed** and called once at the top; re-evaluating the cell re-inits Hydra cleanly.
- **`mouse.x/y` are in screen pixels** (not normalized); divide by `innerWidth/innerHeight`.
- **Modulate amounts are tiny** — typical values 0.01–0.3; large values destroy the image.