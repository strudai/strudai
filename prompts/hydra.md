# Strudel Integration

Call Hydra visuals within Strudel patterns:

```strudel
await initHydra()
osc(10, 0.9, 300).color(0.9, 0.7, 0.8).out()
note("[a,c,e,<a4 ab4 g4 gb4>,b4]/2").s("sawtooth")
```

Use `H()` to feed Strudel patterns into Hydra:
```strudel
await initHydra()
let pattern = "3 4 5 [6 7]*2"
shape(H(pattern)).out(o0)
n(pattern).scale("A:minor").piano()
```

Enable audio reactivity with `{detectAudio:true}`:
```strudel
await initHydra({detectAudio:true})
shape(H("3 4 5")).scrollY(() => a.fft[0]*.25).out()
```

Use `feedStrudel` to transform Strudel visuals:
```strudel
await initHydra({feedStrudel:1})
src(s0).kaleid(H("<4 5 6>")).out()
```

# API Reference

**Sources:**
- `osc(freq=60, sync=0.1, offset)` — visual oscillator
- `solid(r, g, b, a=1)` — solid color fill
- `noise(scale=10, offset=0.1)` — Perlin noise
- `voronoi(scale=5, speed=0.3, blending=0.3)` — Voronoi diagram
- `shape(sides=3, radius=0.3, smoothing=0.01)` — polygon
- `gradient(speed)` — color gradient
- `src(texture)` — use texture from buffer (o0-o3, s0-s3)

**Geometry:**
- `rotate(angle=10, speed)` — rotation
- `scale(amount=1.5, xMult=1, yMult=1, offsetX=0.5, offsetY=0.5)` — scaling
- `scroll(scrollX=0.5, scrollY=0.5, speedX, speedY)` — translation
- `scrollX(scrollX=0.5, speed)`, `scrollY(scrollY=0.5, speed)` — axis scroll
- `pixelate(pixelX=20, pixelY=20)` — pixelation
- `repeat(repeatX=3, repeatY=3, offsetX, offsetY)` — tiling
- `repeatX(reps=3, offset)`, `repeatY(reps=3, offset)` — axis repeat
- `kaleid(nSides=4)` — kaleidoscope
- `posterize(bins=3, gamma=0.6)` — quantize levels

**Color:**
- `color(r=1, g=1, b=1, a=1)` — channel multiply
- `brightness(amount=0.4)` — brightness adjust
- `contrast(amount=1.6)` — contrast adjust
- `saturate(amount=2)` — saturation adjust
- `hue(hue=0.4)` — hue shift
- `invert(amount=1)` — color invert
- `thresh(threshold=0.5, tolerance=0.04)` — threshold
- `luma(threshold=0.5, tolerance=0.1)` — luma key
- `colorama(amount=0.005)` — HSV shift
- `shift(r=0.5, g, b, a)` — channel shift
- `r(scale=1, offset)`, `g()`, `b()`, `a()` — channel extract

**Blending:**
- `add(texture, amount=1)` — additive blend
- `sub(texture, amount=1)` — subtract
- `mult(texture, amount=1)` — multiply
- `diff(texture)` — difference
- `blend(texture, amount=0.5)` — alpha blend
- `layer(texture)` — composite over
- `mask(texture)` — mask with texture

**Modulation:**
- `modulate(texture, amount=0.1)` — displace with texture
- `modulateRotate(texture, multiple=1, offset)` — rotation modulation
- `modulateScale(texture, multiple=1, offset=1)` — scale modulation
- `modulateScrollX(texture, scrollX=0.5, speed)` — X scroll modulation
- `modulateScrollY(texture, scrollY=0.5, speed)` — Y scroll modulation
- `modulateRepeat(texture, repeatX=1, repeatY=1, offsetX, offsetY)` — repeat modulation
- `modulatePixelate(texture, multiple=1, offset)` — pixelate modulation
- `modulateHue(texture, amount=1)` — hue modulation

**Outputs:**
- `out(output=o0)` — send to output buffer
- `o0`, `o1`, `o2`, `o3` — output buffers
- `render(output)` — display output (no args shows all 4)

**External Sources:**
- `s0.initCam(index=0)` — webcam input
- `s0.initImage(url)` — image input
- `s0.initVideo(url)` — video input
- `s0.initScreen()` — screen capture
- `s0`, `s1`, `s2`, `s3` — source buffers
- `a.fft[n]` — audio FFT bins (requires `{detectAudio:true}`)

# Idiomatic Snippets

Basic oscillator:
```hydra
osc(30, 0.1, 1).out()
```

Kaleidoscope effect:
```hydra
osc(25, -0.1, 0.5).kaleid(50).out()
```

Audio-reactive scaling:
```hydra
a.setBins(4)
shape(4, 0.3).scale(() => 1 + a.fft[0] * 2).out()
```

Layered feedback:
```hydra
src(o0).scale(1.01).blend(osc(40, 0.1), 0.1).out()
```

Webcam modulation:
```hydra
s0.initCam()
osc(10).modulate(src(s0), 0.3).out()
```

Multiple output mixing:
```hydra
osc().out(o0)
noise().out(o1)
src(o0).diff(o1).out(o2)
render(o2)
```

# Gotchas

- Always end chains with `.out()` — nothing renders without it
- Default output is `o0` — other outputs need explicit `render()`
- Audio reactivity needs `{detectAudio:true}` in initHydra options
- Arrays create sequences: `osc([20, 40, 60])` cycles through frequencies
- Functions update per frame: `() => Math.sin(time)` is dynamic
- Source buffers (s0-s3) must be initialized before use
- Multiple `render()` calls override each other — last one wins
- Mouse coordinates are in pixels relative to window, not normalized