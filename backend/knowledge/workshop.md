# Workshop Recap

This page is just a listing of all functions covered in the workshop!

## Mini Notation

| Concept           | Syntax   | Example                                                               |
| ----------------- | -------- | --------------------------------------------------------------------- |
| Sequence          | space    | `sound("bd bd sd hh bd cp sd hh")` |
| Sample Number     | :x       | `sound("hh:0 hh:1 hh:2 hh:3")`     |
| Rests             | ~        | `sound("metal ~ jazz jazz:1")`     |
| Sub-Sequences     | \[\]     | `sound("bd wind [metal jazz] hh")` |
| Sub-Sub-Sequences | \[\[\]\] | `sound("bd [metal [jazz sd]]")`    |
| Speed up          | \*       | `sound("bd sd*2 cp*3")`            |
| Parallel          | ,        | `sound("bd*2, hh*2 [hh oh]")`      |
| Slow down         | \/       | `note("[c a f e]/2")`              |
| Alternate         | \<\>     | `note("c <e g>")`                  |
| Elongate          | @        | `note("c@3 e")`                    |
| Replicate         | !        | `note("c!3 e")`                    |

## Sounds

| Name  | Description                       | Example                                                                 |
| ----- | --------------------------------- | ----------------------------------------------------------------------- |
| sound | plays the sound of the given name | `sound("bd sd")`                     |
| bank  | selects the sound bank            | `sound("bd sd").bank("RolandTR909")` |
| n     | select sample number              | `n("0 1 4 2").sound("jazz")`         |

## Notes

| Name      | Description                   | Example                                                                           |
| --------- | ----------------------------- | --------------------------------------------------------------------------------- |
| note      | set pitch as number or letter | `note("b g e c").sound("piano")`               |
| n + scale | set note in scale             | `n("6 4 2 0").scale("C:minor").sound("piano")` |
| $:        | play patterns in parallel     | `$: s("bd sd"); $: note("c eb g")`             |

## Audio Effects

| name  | example                                                                                 |
| ----- | --------------------------------------------------------------------------------------- |
| lpf   | `note("c2 c3 c2 c3").s("sawtooth").lpf("400 2000")`  |
| vowel | `note("c3 eb3 g3").s("sawtooth").vowel("<a e i o>")` |
| gain  | `s("hh*16").gain("[.25 1]*4")`                       |
| delay | `s("bd rim bd cp").delay(.5)`                        |
| room  | `s("bd rim bd cp").room(.5)`                         |
| pan   | `s("bd rim bd cp").pan("0 1")`                       |
| speed | `s("bd rim bd cp").speed("<1 2 -1 -2>")`             |
| range | `s("hh*32").lpf(saw.range(200,4000))`                |

## Pattern Effects

| name   | description                         | example                                                                             |
| ------ | ----------------------------------- | ----------------------------------------------------------------------------------- |
| setcpm | sets the tempo in cycles per minute | `setcpm(45); sound("bd sd [~ bd] sd")`           |
| fast   | speed up                            | `sound("bd sd [~ bd] sd").fast(2)`               |
| slow   | slow down                           | `sound("bd sd [~ bd] sd").slow(2)`               |
| rev    | reverse                             | `n("0 2 4 6").scale("C:minor").rev()`            |
| jux    | split left/right, modify right      | `n("0 2 4 6").scale("C:minor").jux(rev)`         |
| add    | add numbers / notes                 | `n("0 2 4 6".add("<0 1 2 1>")).scale("C:minor")` |
| ply    | speed up each event n times         | `s("bd sd").ply("<1 2 3>")`                      |
| off    | copy, shift time & modify           | `s("bd sd, hh*4").off(1/8, x=>x.speed(2))`       |


---

# First Sounds

This is the first chapter of the Strudel Workshop, nice to have you on board!

## Code Fields

The workshop is full of interactive code fields. Let's learn how to use those. Here is one:

```strudel
sound("casio")
```

1. ⬆️ click into the text field above ⬆️
2. press `ctrl`+`enter` to play
3. change `casio` to `metal`
4. press `ctrl`+`enter` to update
5. press `ctrl`+`.` to stop

Congratulations, you are now live coding!

## Sounds

We have just played a sound with `sound` like this:

```strudel
sound("casio")
```

`casio` is one of many standard sounds.

Try out a few other sounds:

```
insect wind jazz metal east crow casio space numbers
```

You might hear a little pause while the sound is loading

**Change Sample Number with :**

One Sound can contain multiple samples (audio files).

You can select the sample by appending `:` followed by a number to the name:

```strudel
sound("casio:1")
```

Try different sound / sample number combinations.

Not adding a number is like doing `:0`

Now you know how to use different sounds.
For now we'll stick to this little selection of sounds, but we'll find out how to load your own sounds later.

## Drum Sounds

By default, Strudel comes with a wide selection of drum sounds:

```strudel
sound("bd hh sd oh")
```

These letter combinations stand for different parts of a drum set:

  original image by Pbroks13

- `bd` = **b**ass **d**rum
- `sd` = **s**nare **d**rum
- `rim` = **rim**shot
- `hh` = **h**i**h**at
- `oh` = **o**pen **h**ihat
- `lt` = **l**ow tom
- `mt` = **m**iddle tom
- `ht` = **h**igh tom
- `rd` = **r**i**d**e cymbal
- `cr` = **cr**ash cymbal

Try out different drum sounds!

To change the sound character of our drums, we can use `bank` to change the drum machine:

```strudel
sound("bd hh sd oh").bank("RolandTR909")
```

In this example `RolandTR909` is the name of the drum machine that we're using.
It is a famous drum machine for house and techno beats.

Try changing `RolandTR909` to one of

- `AkaiLinn`
- `RhythmAce`
- `RolandTR808`
- `RolandTR707`
- `ViscoSpaceDrum`

There are a lot more, but let's keep it simple for now

🦥 Pro-Tip: Mark a name via double click. Then just copy and paste!

## Sequences

In the last example, we already saw that you can play multiple sounds in a sequence by separating them with a space:

```strudel
sound("bd hh sd hh")
```

Notice how the currently playing sound is highlighted in the code and also visualized below.

Try adding more sounds to the sequence!

**The longer the sequence, the faster it runs**

```strudel
sound("bd bd hh bd rim bd hh bd")
```

The content of a sequence will be squished into what's called a cycle. A cycle is 2s long by default.

**One per cycle with `< .. >`**

Here is the same sequence, but this time sourrounded with `< .. >` (angle brackets):

```strudel
sound("<bd bd hh bd rim bd hh bd>")
```

This will play only one sound per cycle. With these brackets, the tempo doesn't change when we add or remove elements!

Because this is now very slow, we can speed it up again like this:

```strudel
sound("<bd bd hh bd rim bd hh bd>*8")
```

Here, the `*8` means we make the whole thing 8 times faster.

Wait a minute, isn't this the same as without `< ... >*8`? Why do we need it then?

That's true, the special thing about this notation is that the tempo won't change when you add or remove elements, try it!

Try also changing the number at the end to change the tempo!

**changing the tempo with setcpm**

```strudel
setcpm(90/4)
sound("<bd hh rim hh>*8")
```

cpm = cycles per minute

By default, the tempo is 30 cycles per minute = 120/4 = 1 cycle every 2 seconds

In western music terms, you could say the above are 8ths notes at 90bpm in 4/4 time.
But don't worry if you don't know these terms, as they are not required to make music with Strudel.

**Add a rests in a sequence with '-' or '~'**

```strudel
sound("bd hh - rim - bd hh rim")
```

**Sub-Sequences with [brackets]**

```strudel
sound("bd [hh hh] sd [hh bd] bd - [hh sd] cp")
```

Try adding more sounds inside a bracket!

Similar to the whole sequence, the content of a sub-sequence will be squished to its own length.

**Multiplication: Speed things up**

```strudel
sound("bd hh*2 rim hh*3 bd [- hh*2] rim hh*2")
```

**Multiplication: Speed up subsequences**

```strudel
sound("bd [hh rim]*2 bd [hh rim]*1.5")
```

**Multiplication: Speeeeeeeeed things up**

```strudel
sound("bd hh*32 rim hh*16")
```

Pitch = really fast rhythm

**Sub-Sub-Sequences with [[brackets]]**

```strudel
sound("bd [[rim rim] hh] bd cp")
```

You can go as deep as you want!

**Play sequences in parallel with comma**

```strudel
sound("hh hh hh, bd casio")
```

You can use as many commas as you want:

```strudel
sound("hh hh hh, bd bd, - casio")
```

Commas can also be used inside sub-sequences:

```strudel
sound("hh hh hh, bd [bd,casio]")
```

Notice how the 2 above are the same?

It is quite common that there are many ways to express the same idea.

**Multiple Lines with backticks**

```strudel
sound(\`bd*2, - cp, 
- - - oh, hh*4,
[- casio]*2\`)
```

**selecting sample numbers separately**

Instead of selecting sample numbers one by one:

```strudel
sound("jazz:0 jazz:1 [jazz:4 jazz:2] jazz:3*2")
```

We can also use the `n` function to make it shorter and more readable:

```strudel
n("0 1 [4 2] 3*2").sound("jazz")
```

## Recap

Now we've learned the basics of the so called Mini-Notation, the rhythm language of Tidal.
This is what we've learned so far:

| Concept           | Syntax   | Example                                                                 |
| ----------------- | -------- | ----------------------------------------------------------------------- |
| Sequence          | space    | `sound("bd bd sd hh")`               |
| Sample Number     | :x       | `sound("hh:0 hh:1 hh:2 hh:3")`       |
| Rests             | - or ~   | `sound("metal - jazz jazz:1")`       |
| Alternate         | \<\>     | `sound("<bd hh rim oh bd rim>")`     |
| Sub-Sequences     | \[\]     | `sound("bd wind [metal jazz] hh")`   |
| Sub-Sub-Sequences | \[\[\]\] | `sound("bd [metal [jazz [sd cp]]]")` |
| Speed up          | \*       | `sound("bd sd*2 cp*3")`              |
| Parallel          | ,        | `sound("bd*2, hh*2 [hh oh]")`        |

The Mini-Notation is usually used inside some function. These are the functions we've seen so far:

| Name   | Description                         | Example                                                                           |
| ------ | ----------------------------------- | --------------------------------------------------------------------------------- |
| sound  | plays the sound of the given name   | `sound("bd sd [- bd] sd")`                     |
| bank   | selects the sound bank              | `sound("bd sd [- bd] sd").bank("RolandTR909")` |
| setcpm | sets the tempo in cycles per minute | `setcpm(45); sound("bd sd [- bd] sd")`         |
| n      | select sample number                | `n("0 1 4 2 0 6 3 2").sound("jazz")`           |

## Examples

**Basic rock beat**

`setcpm(100/4)
sound("[bd sd]*2, hh*8").bank("RolandTR505")`

**Classic house**

```strudel
sound("bd*4, [- cp]*2, [- hh]*4").bank("RolandTR909")
```

Notice that the two patterns are extremely similar.
Certain drum patterns are reused across genres.

We Will Rock you

```strudel
setcpm(81/2)
sound("bd*2 cp").bank("RolandTR707")
```

**Yellow Magic Orchestra - Firecracker**

```strudel
setcpm(120/2)
sound("bd sd, - - - hh - hh - -, - perc - perc:1*2")
.bank("RolandCompurhythm1000")
```

**Imitation of a 16 step sequencer**

```strudel

setcpm(90/4)
sound(\`
[-  -  oh - ] [-  -  -  - ] [-  -  -  - ] [-  -  -  - ],
[hh hh -  - ] [hh -  hh - ] [hh -  hh - ] [hh -  hh - ],
[-  -  -  - ] [cp -  -  - ] [-  -  -  - ] [cp -  -  - ],
[bd -  -  - ] [-  -  -  bd] [-  -  bd - ] [-  -  -  bd]
\`)
```

**Another one**

```strudel
setcpm(88/4)
sound(\`
[-  -  -  - ] [-  -  -  - ] [-  -  -  - ] [-  -  oh:1 - ],
[hh hh hh hh] [hh hh hh hh] [hh hh hh hh] [hh hh -  - ],
[-  -  -  - ] [cp -  -  - ] [-  -  -  - ] [~  cp -  - ],
[bd bd -  - ] [-  -  bd - ] [bd bd - bd ] [-  -  -  - ]
\`).bank("RolandTR808")
```

**Not your average drums**

```strudel
setcpm(100/2)
s(\`jazz*2, 
insect [crow metal] - -, 
- space:4 - space:1,
- wind\`)
```

Now that we know the basics of how to make beats, let's look at how we can play [notes](/workshop/first-notes).


---

# First Notes

Let's look at how we can play notes

## numbers and notes

**play notes with numbers**

```strudel
note("48 52 55 59").sound("piano")
```

Try out different numbers!

Try decimal numbers, like 55.5

**play notes with letters**

```strudel
note("c e g b").sound("piano")
```

Try out different letters (a - g).

Can you find melodies that are actual words? Hint: ☕ 😉 ⚪

**add flats or sharps to play the black keys**

```strudel
note("db eb gb ab bb").sound("piano")
```

```strudel
note("c# d# f# g# a#").sound("piano")
```

**play notes with letters in different octaves**

```strudel
note("c2 e3 g4 b5").sound("piano")
```

Try out different octaves (1-8)

If you are not comfortable with the note letter system, it should be easier to use numbers instead.
Most of the examples below will use numbers for that reason.
We will also look at ways to make it easier to play the right notes later.

## changing the sound

Just like with unpitched sounds, we can change the sound of our notes with `sound`:

```strudel
note("36 43, 52 59 62 64").sound("piano")
```

{/* c2 g2, e3 b3 d4 e4 */}

Try out different sounds:

- gm_electric_guitar_muted
- gm_acoustic_bass
- gm_voice_oohs
- gm_blown_bottle
- sawtooth
- square
- triangle
- how about bd, sd or hh?
- remove `.sound('...')` completely

**switch between sounds**

```strudel
note("48 67 63 [62, 58]")
.sound("piano gm_electric_guitar_muted")
```

**stack multiple sounds**

```strudel
note("48 67 63 [62, 58]")
.sound("piano, gm_electric_guitar_muted")
```

The `note` and `sound` patterns are combined!

We will see more ways to combine patterns later..

## Longer Sequences

**Divide sequences with `/` to slow them down**

```strudel
note("[36 34 41 39]/4").sound("gm_acoustic_bass")
```

The `/4` plays the sequence in brackets over 4 cycles (=8s).

So each of the 4 notes is 2s long.

Try adding more notes inside the brackets and notice how it gets faster.

**Play one per cycle with `< ... >`**

In the last section, we learned that `< ... >` (angle brackets) can be used to play only one thing per cycle,
which is useful for longer melodies too:

```strudel
note("<36 34 41 39>").sound("gm_acoustic_bass")
```

Try adding more notes inside the brackets and notice how the tempo stays the same.

The angle brackets are actually just a shortcut:

`<a b c>` = `[a b c]/3`

`<a b c d>` = `[a b c d]/4`

...

**Play one sequence per cycle**

We can combine the 2 types of brackets in all sorts of different ways.
Here is an example of a repetitive bassline:

```strudel
note("<[36 48]*4 [34 46]*4 [41 53]*4 [39 51]*4>")
.sound("gm_acoustic_bass")
```

**Alternate between multiple things**

```strudel
note("60 <63 62 65 63>")
.sound("gm_xylophone")
```

This is also useful for unpitched sounds:

```strudel
sound("bd*4, [~ <sd cp>]*2, [~ hh]*4")
.bank("RolandTR909")
```

## Scales

Finding the right notes can be difficult.. Scales are here to help:

```strudel
setcpm(60)
n("0 2 4 <[6,8] [7,9]>")
.scale("C:minor").sound("piano")
```

Try out different numbers. Any number should sound good!

Try out different scales:

- C:major
- A2:minor
- D:dorian
- G:mixolydian
- A2:minor:pentatonic
- F:major:pentatonic

**automate scales**

Just like anything, we can automate the scale with a pattern:

```strudel
setcpm(60)
n("<0 -3>, 2 4 <[6,8] [7,9]>")
.scale("<C:major D:mixolydian>/4")
.sound("piano")
```

If you have no idea what these scale mean, don't worry.
These are just labels for different sets of notes that go well together.

Take your time and you'll find scales you like!

## Repeat & Elongate

**Elongate with @**

```strudel
note("c@3 eb").sound("gm_acoustic_bass")
```

Not using `@` is like using `@1`. In the above example, c is 3 units long and eb is 1 unit long.

Try changing that number!

**Elongate within sub-sequences**

```strudel
setcpm(60)
n("<[4@2 4] [5@2 5] [6@2 6] [5@2 5]>*2")
.scale("<C2:mixolydian F2:mixolydian>/4")
.sound("gm_acoustic_bass")
```

This groove is called a `shuffle`.
Each beat has two notes, where the first is twice as long as the second.
This is also sometimes called triplet swing. You'll often find it in blues and jazz.

**Replicate**

```strudel
setcpm(60)
note("c!2 [eb,<g a bb a>]").sound("piano")
```

Try switching between `!`, `*` and `@`

What's the difference?

## Recap

Let's recap what we've learned in this chapter:

| Concept   | Syntax | Example                                                  |
| --------- | ------ | -------------------------------------------------------- |
| Slow down | \/     | `note("[c a f e]/2")` |
| Alternate | \<\>   | `note("c a f <e g>")` |
| Elongate  | @      | `note("c@3 e")`       |
| Replicate | !      | `note("c!3 e")`       |

New functions:

| Name  | Description                   | Example                                                                           |
| ----- | ----------------------------- | --------------------------------------------------------------------------------- |
| note  | set pitch as number or letter | `note("b g e c").sound("piano")`               |
| scale | interpret `n` as scale degree | `n("6 4 2 0").scale("C:minor").sound("piano")` |
| $:    | play patterns in parallel     | `$: s("bd sd"); $: note("c eb g")`             |

## Examples

**Classy Bassline**

`note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>")
.sound("gm_synth_bass_1")
.lpf(800) // <-- we'll learn about this soon`

**Classy Melody**

```strudel
n(\`<
[~ 0] 2 [0 2] [~ 2]
[~ 0] 1 [0 1] [~ 1]
[~ 0] 3 [0 3] [~ 3]
[~ 0] 2 [0 2] [~ 2]
>*4\`).scale("C4:minor")
.sound("gm_synth_strings_1")
```

**Classy Drums**

```strudel
sound("bd*4, [~ <sd cp>]*2, [~ hh]*4")
.bank("RolandTR909")
```

**If there just was a way to play all the above at the same time.......**

You can use `$:` 😙

## Playing multiple patterns

If you want to play multiple patterns at the same time, make sure to write `$:` before each:

```strudel
$: note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>")
  .sound("gm_synth_bass_1").lpf(800)
  
$: n(\`<
  [~ 0] 2 [0 2] [~ 2]
  [~ 0] 1 [0 1] [~ 1]
  [~ 0] 3 [0 3] [~ 3]
  [~ 0] 2 [0 2] [~ 2]
  >*4\`).scale("C4:minor")
  .sound("gm_synth_strings_1")
  
$: sound("bd*4, [~ <sd cp>]*2, [~ hh]*4")
.bank("RolandTR909")
```

Try changing `$` to `_$` to mute a part!

This is starting to sound like actual music! We have sounds, we have notes, now the last piece of the puzzle is missing: [effects](/workshop/first-effects)


---

# First Effects

We have sounds, we have notes, now let's look at effects!

## Some basic effects

**low-pass filter**

```strudel
note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>")
.sound("sawtooth").lpf(800)
```

lpf = **l**ow **p**ass **f**ilter

- Change lpf to 200. Notice how it gets muffled. Think of it as standing in front of the club with the door closed 🚪.
- Now let's open the door... change it to 5000. Notice how it gets brighter ✨🪩

**pattern the filter**

```strudel
note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>")
.sound("sawtooth").lpf("200 1000 200 1000")
```

- Try adding more values
- Notice how the pattern in lpf does not change the overall rhythm

We will learn how to automate with waves later...

**vowel**

```strudel
note("<[c3,g3,e4] [bb2,f3,d4] [a2,f3,c4] [bb2,g3,eb4]>")
.sound("sawtooth").vowel("<a e i o>")
```

**gain**

```strudel
$: sound("hh*16").gain("[.25 1]*4")

$: sound("bd*4,[~ sd:1]*2")
```

Rhythm is all about dynamics!

- Remove `.gain(...)` and notice how flat it sounds.
- Bring it back by undoing (ctrl+z)

Let's combine all of the above into a little tune:

```strudel
$: sound("hh*8").gain("[.25 1]*4")

$: sound("bd*4,[~ sd:1]*2")

$: note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>")
.sound("sawtooth").lpf("200 1000 200 1000")

$: note("<[c3,g3,e4] [bb2,f3,d4] [a2,f3,c4] [bb2,g3,eb4]>")
.sound("sawtooth").vowel("<a e i o>")
```

**shape the sound with an adsr envelope**

```strudel
note("c3 bb2 f3 eb3")
.sound("sawtooth").lpf(600)
.attack(.1)
.decay(.1)
.sustain(.25)
.release(.2)
```

Try to find out what the numbers do.. Compare the following

- attack: `.5` vs `0`
- decay: `.5` vs `0`
- sustain: `1` vs `.25` vs `0`
- release: `0` vs `.5` vs `1`

Can you guess what they do?

- attack: time it takes to fade in
- decay: time it takes to fade to sustain
- sustain: level after decay
- release: time it takes to fade out after note is finished

![ADSR](https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/ADSR_parameter.svg/1920px-ADSR_parameter.svg.png)

**adsr short notation**

```strudel
note("c3 bb2 f3 eb3")
.sound("sawtooth").lpf(600)
.adsr(".1:.1:.5:.2")

```

**delay**

```strudel
$: note("[~ [<[d3,a3,f4]!2 [d3,bb3,g4]!2> ~]]*2")
  .sound("gm_electric_guitar_muted").delay(.5)

$: sound("bd rim").bank("RolandTR707").delay(".5")
```

Try some `delay` values between 0 and 1. Btw, `.5` is short for `0.5`

What happens if you use `.delay(".8:.125")` ? Can you guess what the second number does?

What happens if you use `.delay(".8:.06:.8")` ? Can you guess what the third number does?

`delay("a:b:c")`:

- a: delay volume
- b: delay time
- c: feedback (smaller number = quicker fade)

**room aka reverb**

```strudel
n("<4 [3@3 4] [<2 0> ~@16] ~>")
.scale("D4:minor").sound("gm_accordion:2")
.room(2)
```

Try different values!

Add a delay too!

**little dub tune**

```strudel
$: note("[~ [<[d3,a3,f4]!2 [d3,bb3,g4]!2> ~]]*2")
.sound("gm_electric_guitar_muted").delay(.5)

$: sound("bd rim").bank("RolandTR707").delay(.5)

$: n("<4 [3@3 4] [<2 0> ~@16] ~>")
.scale("D4:minor").sound("gm_accordion:2")
.room(2).gain(.5)
```

Let's add a bass to make this complete:

```strudel
$: note("[~ [<[d3,a3,f4]!2 [d3,bb3,g4]!2> ~]]*2")
.sound("gm_electric_guitar_muted").delay(.5)

$: sound("bd rim").bank("RolandTR707").delay(.5)

$: n("<4 [3@3 4] [<2 0> ~@16] ~>")
.scale("D4:minor").sound("gm_accordion:2")
.room(2).gain(.4)

$: n("[0 [~ 0] 4 [3 2] [0 ~] [0 ~] <0 2> ~]/2")
.scale("D2:minor")
.sound("sawtooth,triangle").lpf(800)
```

Try adding `.hush()` at the end of one of the patterns in the stack...

**pan**

```strudel
sound("numbers:1 numbers:2 numbers:3 numbers:4")
  .pan("0 0.3 .6 1")
```

**speed**

```strudel
sound("bd rim [~ bd] rim").speed("<1 2 -1 -2>").room(.2)
```

**fast and slow**

We can use `fast` and `slow` to change the tempo of a pattern outside of Mini-Notation:

```strudel
sound("bd*4,~ rim ~ cp").slow(2)
```

Change the `slow` value. Try replacing it with `fast`.

What happens if you use a pattern like `.fast("<1 [2 4]>")`?

By the way, inside Mini-Notation, `fast` is `*` and `slow` is `/`.

```strudel
sound("[bd*4,~ rim ~ cp]*<1 [2 4]>")
```

## modulation with signals

Instead of changing values stepwise, we can also control them with signals:

```strudel
sound("hh*16").gain(sine)
```

The basic waveforms for signals are `sine`, `saw`, `square`, `tri` 🌊

Try also random signals `rand` and `perlin`!

The gain is visualized as transparency in the pianoroll.

**setting a range**

By default, waves oscillate between 0 to 1. We can change that with `range`:

```strudel
sound("hh*16").lpf(saw.range(500, 2000))
```

What happens if you flip the range values?

We can change the modulation speed with slow / fast:

```strudel
note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>")
  .sound("sawtooth")
  .lpf(sine.range(100, 2000).slow(4))
```

The whole modulation will now take 8 cycles to repeat.

## Recap

| name    | example                                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------------------------- |
| lpf     | `note("c2 c3 c2 c3").s("sawtooth").lpf("<400 2000>")`                         |
| vowel   | `note("c3 eb3 g3").s("sawtooth").vowel("<a e i o>")`                          |
| gain    | `s("hh*16").gain("[.25 1]*2")`                                                |
| delay   | `s("bd rim bd cp").delay(.5)`                                                 |
| room    | `s("bd rim bd cp").room(.5)`                                                  |
| pan     | `s("bd rim bd cp").pan("0 1")`                                                |
| speed   | `s("bd rim bd cp").speed("<1 2 -1 -2>")`                                      |
| signals | `sine`, `saw`, `square`, `tri`, `rand`, `perlin`<br/>`s("hh*16").gain  (saw)` |
| range   | `s("hh*16").lpf(saw.range(200,4000))`                                         |

Let us now take a look at some of Tidal's typical [pattern effects](/workshop/pattern-effects).


---

# Pattern Effects

Up until now, most of the functions we've seen are what other music programs are typically capable of: sequencing sounds, playing notes, controlling effects.

In this chapter, we are going to look at functions that are more unique to tidal.

**reverse patterns with rev**

```strudel
n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").rev()
```

**play pattern left and modify it right with jux**

```strudel
n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").jux(rev)
```

This is the same as:

```strudel
$: n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").pan(0)
$: n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").pan(1).rev()
```

Let's visualize what happens here:

```strudel
$: n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").pan(0).color("cyan")
$: n("0 1 [4 3] 2 0 2 [~ 3] 4").sound("jazz").pan(1).color("magenta").rev()
```

Try commenting out one of the two by adding `//` before a line

**multiple tempos**

```strudel
note("c2, eb3 g3 [bb3 c4]").sound("piano").slow("0.5,1,1.5")
```

This is like doing

```strudel
$: note("c2, eb3 g3 [bb3 c4]").s("piano").slow(0.5).color('cyan')
$: note("c2, eb3 g3 [bb3 c4]").s("piano").slow(1).color('magenta')
$: note("c2, eb3 g3 [bb3 c4]").s("piano").slow(1.5).color('yellow')
```

Try commenting out one or more by adding `//` before a line

**add**

```strudel
setcpm(60)
note("c2 [eb3,g3] ".add("<0 <1 -1>>"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)
```

If you add a number to a note, the note will be treated as if it was a number

We can add as often as we like:

```strudel
setcpm(60)
note("c2 [eb3,g3]".add("<0 <1 -1>>").add("0,7"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)
```

**add with scale**

```strudel
n("0 [2 4] <3 5> [~ <4 1>]".add("<0 [0,2,4]>"))
.scale("C5:minor").release(.5)
.sound("gm_xylophone").room(.5)
```

**time to stack**

```strudel
$: n("0 [2 4] <3 5> [~ <4 1>]".add("<0 [0,2,4]>"))
  .scale("C5:minor")
  .sound("gm_xylophone")
  .room(.4).delay(.125)
$: note("c2 [eb3,g3]".add("<0 <1 -1>>"))
  .adsr("[.1 0]:.2:[1 0]")
  .sound("gm_acoustic_bass")
  .room(.5)
$: n("0 1 [2 3] 2").sound("jazz").jux(rev)
```

**ply**

```strudel
sound("hh hh, bd rim [~ cp] rim").bank("RolandTR707").ply(2)
```

this is like writing:

```strudel
sound("hh*2 hh*2, bd*2 rim*2 [~ cp*2] rim*2").bank("RolandTR707")
```

Try patterning the `ply` function, for example using `"<1 2 1 3>"`

**off**

```strudel
n("0 [4 <3 2>] <2 3> [~ 1]"
  .off(1/16, x=>x.add(4))
  //.off(1/8, x=>x.add(7))
).scale("<C5:minor Db5:mixolydian>/2")
.s("triangle").room(.5).dec(.1)
```

In the notation `.off(1/16, x=>x.add(4))`, says:

- take the original pattern named as `x`
- modify `x` with `.add(4)`, and
- play it offset to the original pattern by `1/16` of a cycle.

off is also useful for modifying other sounds, and can even be nested:

```strudel
s("bd sd [rim bd] sd,[~ hh]*4").bank("CasioRZ1")
  .off(2/16, x=>x.speed(1.5).gain(.25)
  .off(3/16, y=>y.vowel("<a e i o>*8")))
```

| name | description                    | example                                                                                     |
| ---- | ------------------------------ | ------------------------------------------------------------------------------------------- |
| rev  | reverse                        | `n("0 2 4 6 ~ 7 9 5").scale("C:minor").rev()`            |
| jux  | split left/right, modify right | `n("0 2 4 6 ~ 7 9 5").scale("C:minor").jux(rev)`         |
| add  | add numbers / notes            | `n("0 2 4 6 ~ 7 9 5".add("<0 1 2 1>")).scale("C:minor")` |
| ply  | speed up each event n times    | `s("bd sd [~ bd] sd").ply("<1 2 3>")`                    |
| off  | copy, shift time & modify      | `s("bd sd [~ bd] sd, hh*8").off(1/16, x=>x.speed(2))`    |


---

# Welcome

<div className="w-32 animate-pulse md:float-right ml-8">![Strudel Icon](/icons/strudel_icon.png)</div>

Welcome to the Strudel documentation pages!
You've come to the right place if you want to learn how to make music with code.

## What is Strudel?

With Strudel, you can expressively write dynamic music pieces.<br/>
It is an official port of the [Tidal Cycles](https://tidalcycles.org/) pattern language to JavaScript.<br/>
You don't need to know JavaScript or Tidal Cycles to make music with Strudel.
This interactive tutorial will guide you through the basics of Strudel.<br/>
The best place to actually make music with Strudel is the [Strudel REPL](https://strudel.cc/)

<div className="clear-both" />

## What can you do with Strudel?

- live code music: make music with code in real time
- algorithmic composition: compose music using tidal's unique approach to pattern manipulation
- teaching: focussing on a low barrier of entry, Strudel is a good fit for teaching music and code at the same time.
- integrate into your existing music setup: either via MIDI or OSC, you can use Strudel as a really flexible sequencer

## Examples

Here are some examples of how strudel can sound:

These examples cannot fully encompass the variety of things you can do, so [check out the showcase](/intro/showcase/) for some videos of how people use Strudel.

## Getting Started

The best way to start learning Strudel is the workshop.
If you're ready to dive in, let's start with your [first sounds](/workshop/first-sounds)
