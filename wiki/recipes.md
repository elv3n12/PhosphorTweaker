# Recipes

Each recipe is a **combination** of sliders—move them together toward the zones below, then fine-tune by eye. Use **Rebuild field** after large pool or cluster changes. Internal parameters stay at defaults unless you edit presets by hand.

---

## 1. Dense quiet specks

**Look:** A tight grain of dim dots with few large glyphs; the center column feels empty while gutters shimmer slightly.

**Move together:**

- **Raise** Pool min and Pool max toward the upper third of their ranges; **lower** Pool area divisor moderately so the area estimate stays high.
- **Lower** Presence and Dot quiet alpha; keep Dot lit alpha moderate so clicks still read.
- **Lower** Glyph size scale and Glyph size max; keep Glyph size min small.
- **Raise** Column presence (center) and **lower** Gutter presence slightly so the type band stays sparse.
- **Lower** Ambient hash floor and Ambient × column to reduce always-on whispers.
- **Tighten** Dot grid toward the lower half of its range.

---

## 2. Slow constellation (mesh)

**Look:** A deep, drifting star map—links breathe in and out, shapes rotate slowly, ink shifts from far to near color.

**Move together:**

- **Raise** Focal length and Depth; set Focus scale near the middle of its range for a soft sharp plane.
- **Lower** Yaw amp, Pitch amp, and their frequencies for gentle motion; keep Yaw base and Pitch base in the mid range.
- **Raise** Node life min/max and Link life min/max toward the upper middle so nodes and edges linger.
- **Widen** Life sustain until and **lengthen** Life release slightly; **raise** Prune delay so envelopes do not snap off.
- **Lower** Links per node and **narrow** Link max; **raise** Link min so only close neighbors connect.
- **Lower** Shape scale base and Dot radius for finer points; **raise** Link width slightly for visible filaments.
- Tune Far ink and Near ink toward contrasting hues (defaults are a strong starting point).

---

## 3. Paintable hold field

**Look:** Clicks and drags leave broad, long-lived pools of light; the seed hold makes the field feel pre-warmed but still dark until you paint.

**Move together:**

- **Raise** Max holds, Hold radius, and Latch max; **lower** Hold spacing so stamps can stack nearby.
- **Raise** Hold life min/max; **raise** Hold fade until so discs stay bright longer.
- **Raise** Seed gain; place Seed X/Y where you want the opening vignette.
- **Raise** Admit hash × disc and **lower** Admit hash floor so holds latch glyphs readily inside discs.
- **Raise** Click radius base and Touch click radius; optional **raise** Radius boost stamp with moderate Radius boost decay.
- **Lower** Spotlight fade rate so pointer strength decays slowly when you lift.
- **Raise** Click alpha base and Click alpha × column; **lower** Quiet alpha base for stronger before/after contrast.

---

## 4. Deep parallax scroll

**Look:** Marks slide at different speeds when you scroll; vertical wrap feels tall and laggy, like looking through layered glass.

**Move together:**

- **Raise** Scroll lag rate only partway (too high feels snappy; too low feels disconnected)—aim for the upper middle.
- **Raise** Parallax span and **lower** Parallax min so speed varies widely per glyph.
- **Raise** Field span min/max via preset internals `fieldSpanMinTimes` and `fieldSpanMaxTimes` if you export JSON; on-panel, **raise** Pool max and rebuild so the tall span has enough glyphs.
- **Raise** Drift span and Drift min moderately for horizontal shear.
- **Lower** Top fade end relative to top fade start if the header band should stay clearer during scroll tests.
- Scroll the preview page while tuning; use Rebuild field after changing pool layout.

---

## 5. Loud bogey tags

**Look:** Frequent amber 3×5 tags on sharp nodes; tags pop on nodes that stay bright and in focus.

**Move together:**

- **Raise** Bogey chance toward the upper third.
- **Raise** Tag life min/max; **raise** Tag alpha cap and **lower** Min tag envelope so tags appear quickly.
- **Raise** Min node alpha; **raise** Max blur to show so slightly soft nodes still qualify.
- **Raise** Tag offset X/Y if tags should clear node shapes.
- Set Tag color to a high-contrast RGB against your preview background.
- In **Mesh**, **raise** mixed node alpha indirectly by **lowering** Dot defocus and keeping Focus scale where defocus stays low on-screen.
- Optional: **raise** Shape scale base so tags sit on larger nodes.

---

## 6. Sparse large marks

**Look:** Few glyphs, big and slow; pulses and spin on a subset; strong gutter presence with a quiet center.

**Move together:**

- **Lower** Pool min and Pool max toward the bottom third; **raise** Pool area divisor so the estimate stays small.
- **Lower** Cluster chance for a more even, airy layout.
- **Raise** Glyph size scale and Glyph size max; **raise** Glyph size min moderately so nothing shrinks to specks.
- **Raise** Presence and Pulse chance; **lower** Pulse freq for slow breathing size waves.
- **Raise** Spin min and Spin span with Spin chance at default (internal) or preset—visible rotation on a fraction of glyphs.
- **Raise** Gutter presence; **lower** Column presence and quiet alphas so the middle stays calm.
- **Raise** Morph min and Morph span so shape changes are infrequent.
