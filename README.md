# GRAIN — granular synthesizer

A boutique **granular synthesizer** that runs entirely in the browser. Load a
sound, sculpt clouds of overlapping grains, and play it like an instrument —
inspired by classic granular hardware.

**No build, no dependencies.** Open `index.html` in any modern browser.

## What it does

GRAIN reads tiny overlapping "grains" out of a sample and layers hundreds of
them per second into an evolving cloud. Move the read position and it becomes a
time-stretch/scrub; shorten the grains and it becomes a texture; detune them
and it becomes a pad. It ships with a built-in pad so it makes sound the
instant you power it on — or drop in your own audio.

## Controls

| Knob | Range | What it does |
|------|-------|--------------|
| **space** | 0–100% | Stereo spread — random panning per grain |
| **chaos** | 0–100% | Randomizes grain position, pitch and timing |
| **length** | 6–1000 ms | Grain length (short = grainy, long = smooth) |
| **grains** | 1.2–160 Hz / synced | Grain density. Toggle **SYNC** to lock to tempo (1/4 … 1/32t) |
| **position** | 0–100% | Read point in the loaded sample |
| **tune** | ±24 st | Master pitch in semitones |
| **reverb** | 0–100% | Built-in reverb send |
| **output** | −40…+12 dB | Master output |

**Grain window** — choose the amplitude envelope each grain is shaped by:
Hann, Tukey, Gauss, Triangle, Blackman, Square (click-safe), Perc.

**Keys** — play it polyphonically (up to 16 voices). Use the on-screen keyboard
or your computer keys:

```
play      A W S E D F T G Y H U J K …
octave    Z / X
```

Turn **DRONE** off if you want sound only while keys are held.

## Under the hood

- Real-time granular engine on the Web Audio API with a look-ahead scheduler.
- Every grain is an independent windowed buffer source → panner → overlap-
  compensated bus → soft limiter → output, with a parallel convolution reverb.
- Live CRT visualization: sample waveform, the position/spray window, and each
  grain drawn as a fading particle as it fires.
- Overlap-aware gain staging and a concurrency cap keep it clean and CPU-safe.

## Usage

Open `index.html` and click **POWER ON**. Drag any audio file onto the display
(or use **LOAD FILE**) to granulate your own sound. Headphones recommended.
