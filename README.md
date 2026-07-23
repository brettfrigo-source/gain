# GRAIN — granular synthesizer

A production-ready **granular synthesizer** that runs entirely in the browser.
Pick a sound, sculpt clouds of overlapping grains, and play it like an
instrument — inspired by classic granular hardware.

**No build, no dependencies, no files required.** Open `index.html` in any
modern browser, click **POWER ON**, and play.

## Make sound instantly — 7 built-in sources

You never need to import anything. Choose a procedurally-synthesized source:

**Pad · Choir · Glass · Strings · Mallet · Bells · Vinyl**

Want your own material? Two more ways in:

- **Load file** — pick any audio file (`wav/mp3/ogg/flac/m4a/aac/aiff/opus…`),
  or **drag it anywhere** onto the window.
- **Sample mic** — record 4 seconds from your microphone and granulate it live.

## Controls

| Knob | Range | What it does |
|------|-------|--------------|
| **space** | 0–100% | Stereo spread — random panning per grain |
| **chaos** | 0–100% | Randomizes grain position, pitch and timing |
| **length** | 6–1000 ms | Grain length (short = grainy, long = smooth) |
| **grains** | 1.2–160 Hz / synced | Grain density. Toggle **SYNC** to lock to tempo (1/1 … 1/32t) |
| **position** | 0–100% | Read point in the source |
| **tune** | ±24 st | Master pitch in semitones |
| **reverb** | 0–100% | Built-in reverb send |
| **output** | −40…+12 dB | Master output (metered on the display) |

**Motion**

- **Scan** — drift the read position automatically (forward or reverse).
- **Freeze** — hold the read position for frozen textures.
- **Reverse** — play grains backwards.
- **Latch** — held notes stay on until pressed again.

**Grain window** — the amplitude envelope each grain is shaped by:
Hann, Tukey, Gauss, Triangle, Blackman, Square (click-safe), Perc.

**Patches** — one-tap factory presets (Init, Cloud, Texture, Shimmer, Stutter,
Frozen, Rewind) plus **Save** to store your own (persists in the browser).

## Keys

Polyphonic, up to 16 voices. On-screen keyboard or your computer keys:

```
play      A W S E D F T G Y H U J K …
octave    Z / X
```

Turn **DRONE** off to make sound only while keys are held.

## Under the hood

- Real-time granular engine on the Web Audio API with a look-ahead scheduler.
- Each grain is an independent windowed buffer source → per-grain panner →
  overlap-compensated bus → soft limiter → output, with a parallel convolution
  reverb and a live output meter.
- Overlap-aware gain staging plus a concurrency cap keep it clean and CPU-safe.
- Live CRT visualization: source waveform, the position/spray window, and every
  grain drawn as a fading particle as it fires.
- Fully responsive (desktop + mobile), keyboard-accessible knobs, and it
  respects `prefers-reduced-motion`.

## Tested

Ships with an automated Playwright QA suite (36 checks) covering every source,
real file decode, all presets, every grain window, the motion controls, sync,
polyphony, and preset save — run headless with **zero runtime errors**.

## Usage

Open `index.html`, click **POWER ON**, and pick a source. Drop in your own
audio or sample the mic any time. Headphones recommended.
