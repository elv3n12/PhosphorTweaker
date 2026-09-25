# Parameters

The tuner exposes most tuning through panel groups. The renderer reads a single live `PhosphorParams` object every frame. Keys wired to sliders or color pickers are listed under each group. Everything else lives under [Internal parameters](#internal-parameters).

The app **opens on `defaultPhosphorParams`**. **Reset all** moves only panel sliders to the **midpoint** of each slider’s min–max range (snapped to step) and resets color pickers to the shipped RGB defaults; it does **not** restore the numeric defaults in `defaultPhosphorParams`. A group **reset** does restore that group’s shipped defaults for its sliders and colors. Internal keys are unchanged by Reset all unless you reload or import a preset that includes them.

---

## Field

| Label | Key | Min | Max | Step | Effect |
| --- | --- | ---: | ---: | ---: | --- |
| Presence | `presence` | 0 | 1 | 0.01 | Global multiplier on painted glyph alpha. |
| Glyph size scale | `glyphSizeScale` | 0.4 | 4 | 0.01 | Scales legacy glyph sizes after the built-in third-size shrink. |
| Glyph size min | `glyphSizeMin` | 1 | 20 | 1 | Lower clamp on final glyph size in pixels. |
| Glyph size max | `glyphSizeMax` | 4 | 80 | 1 | Upper clamp on final glyph size in pixels. |
| Pool min | `poolMin` | 200 | 3000 | 10 | Minimum glyph count after area-based pool sizing. |
| Pool max | `poolMax` | 400 | 6000 | 10 | Maximum glyph count after area-based pool sizing. |
| Pool area divisor | `poolAreaDivisor` | 120 | 1600 | 10 | Viewport area divided by this value estimates pool size before clamping. |
| Cluster chance | `clusterChance` | 0 | 1 | 0.01 | Fraction of glyphs placed near random cluster anchors instead of uniformly. |
| Scroll lag rate | `scrollLagRate` | 0.1 | 6 | 0.05 | How quickly the field’s scroll follower catches up to the window scroll position. |
| Morph min (ms) | `morphMin` | 200 | 12000 | 50 | Base delay before an ambient glyph morphs to a new kind. |
| Morph span (ms) | `morphSpan` | 0 | 20000 | 50 | Random extra delay added to ambient morph timing. |
| Click morph life × | `clickMorphLifeFactor` | 1 | 20 | 0.5 | Multiplier on remaining morph life when a glyph is admitted by a click or hold. |
| Pulse chance | `pulseChance` | 0 | 1 | 0.01 | Probability a glyph’s size oscillates on a sine wave. |
| Pulse freq | `pulseFreq` | 0.0001 | 0.008 | 0.00005 | Frequency of the size pulse sine (per millisecond of time). |
| Spin min (rad/s) | `spinMin` | 0 | 0.4 | 0.002 | Minimum rotation speed for spinning glyphs. |
| Spin span (rad/s) | `spinSpan` | 0 | 0.6 | 0.002 | Random extra rotation speed added to spin min. |
| Drift min (px/s) | `driftMin` | 0 | 80 | 1 | Minimum world drift speed for glyph motion. |
| Drift span (px/s) | `driftSpan` | 0 | 120 | 1 | Random extra drift speed added to drift min. |
| Parallax min | `speedMin` | 0 | 1 | 0.01 | Minimum scroll-lag coupling for vertical parallax. |
| Parallax span | `speedSpan` | 0 | 1.5 | 0.01 | Random span added to parallax min per glyph. |
| Top fade start | `topFadeStart` | 0 | 200 | 1 | Viewport Y below which glyph alpha is forced to zero (header clearance). |
| Top fade end | `topFadeEnd` | 20 | 320 | 1 | Viewport Y where top fade reaches full strength. |
| Gutter presence | `columnGutterPresence` | 0 | 1 | 0.01 | Presence multiplier in side gutters outside the text column. |
| Column presence | `columnCenterPresence` | 0 | 1 | 0.01 | Presence multiplier deep inside the text column (quieter center). |
| Ambient hash floor | `ambientBase` | 0 | 0.2 | 0.001 | Base hash threshold for always-on “whisper” glyphs. |
| Ambient × column | `ambientColumn` | 0 | 0.6 | 0.005 | Extra ambient admission scaled by column presence. |
| dt cap (s) | `dtCap` | 0.016 | 0.2 | 0.001 | Maximum frame delta time used in simulation (seconds). |

**Color pickers (Field)**

| Label | Key | Default RGB |
| --- | --- | --- |
| Ink 0 olive | `ink0` | 217, 255, 0 |
| Ink 1 lime | `ink1` | 184, 201, 65 |
| Ink 2 amber | `ink2` | 66, 244, 106 |
| Ink 3 magenta | `ink3` | 11, 199, 63 |

---

## Spots and clicks

| Label | Key | Min | Max | Step | Effect |
| --- | --- | ---: | ---: | ---: | --- |
| Dot quiet alpha | `dotQuiet` | 0 | 1 | 0.005 | Alpha of idle dot specks before presence and column weighting. |
| Dot lit alpha | `dotLit` | 0 | 1 | 0.01 | Alpha of dot specks at full pointer or hold lighting. |
| Dot grid (px) | `dotGrid` | 6 | 48 | 1 | Spacing of the dot speck grid in pixels. |
| Click density | `clickDensity` | 0 | 1 | 0.01 | Extra hash-gated glyphs admitted by the pointer disc (alongside spot discs). |
| Click radius base | `clickRadiusBase` | 20 | 400 | 1 | Base radius of the pointer lighting disc on desktop. |
| Touch click radius | `touchClickRadiusBase` | 20 | 400 | 1 | Base radius of the pointer lighting disc on touch. |
| Radius boost stamp | `radiusBoostStamp` | 0 | 600 | 1 | Instant radius added on pointer down before decay. |
| Radius boost decay | `radiusBoostDecay` | 0.02 | 2 | 0.01 | Exponential decay rate of the radius boost (per second). |
| Spotlight fade rate | `spotStrengthRate` | 0.02 | 2 | 0.01 | Rate at which click strength eases toward 0 or 1 when not painting. |
| Disc shoulder | `discShoulder` | 0 | 0.8 | 0.01 | Normalized radius where the lighting disc stays flat before cosine falloff. |
| Disc feather | `discFeather` | 0 | 2 | 0.01 | Shapes the cosine rim of the disc (used with shoulder in falloff). |
| Ping life (ms) | `pingLife` | 400 | 16000 | 25 | Duration of a tap ping ripple. |
| Tap vs drag (px) | `tapDragPx` | 2 | 40 | 1 | Movement threshold: below this, release fires a ping instead of paint-only. |
| Max pings | `maxPings` | 1 | 12 | 1 | Maximum simultaneous ping ripples. |
| Ping radius start | `pingRadiusBase` | 8 | 240 | 1 | Starting radius of a ping. |
| Ping radius grow | `pingRadiusGrow` | 20 | 800 | 5 | Ping radius growth per millisecond of age. |
| Wander spots | `spotCount` | 1 | 6 | 1 | Number of autonomous wandering spotlight discs. |
| Spot life min (ms) | `spotLifeMin` | 2000 | 40000 | 100 | Minimum lifetime of a wandering spot. |
| Spot life span (ms) | `spotLifeSpan` | 0 | 40000 | 100 | Random extra lifetime added to spot life min. |
| Spot radius min | `spotRadiusMin` | 4 | 200 | 1 | Minimum wandering spot radius in pixels. |
| Spot radius span | `spotRadiusSpan` | 0 | 400 | 1 | Random extra radius added to spot radius min. |
| Spot fade-in | `spotEnvelopeIn` | 0.01 | 0.4 | 0.01 | Fraction of spot life used to fade the spot envelope in. |
| Spot hold until | `spotEnvelopeHold` | 0.3 | 0.95 | 0.01 | Normalized age before the spot envelope fades out. |
| Quiet alpha base | `quietAlphaBase` | 0 | 0.4 | 0.005 | Base reveal for quiet (unlit) glyphs. |
| Click alpha base | `clickedAlphaBase` | 0 | 2 | 0.02 | Base reveal for lit glyphs under the pointer or holds. |
| Click alpha × column | `clickedAlphaColumn` | 0 | 6 | 0.05 | Extra lit reveal scaled by column presence. |

---

## Holds

| Label | Key | Min | Max | Step | Effect |
| --- | --- | ---: | ---: | ---: | --- |
| Max holds | `maxHolds` | 1 | 24 | 1 | Maximum persistent hold discs kept in memory. |
| Hold spacing | `holdSpacing` | 4 | 120 | 1 | Minimum pixel distance between new hold stamps. |
| Hold life min (ms) | `holdLifeMin` | 1000 | 40000 | 100 | Minimum duration of a hold disc. |
| Hold life max (ms) | `holdLifeMax` | 2000 | 60000 | 100 | Maximum duration sampled for a hold disc. |
| Hold radius | `holdRadius` | 40 | 1600 | 10 | Radius of each hold lighting disc. |
| Latch max (ms) | `holdLatchMax` | 2000 | 120000 | 500 | Time a glyph stays latched after hold admission. |
| Hold fade until | `holdFadeHold` | 0.3 | 0.95 | 0.01 | Normalized hold age before the hold visual fades out. |
| Seed X (fraction) | `seedHoldX` | 0 | 1 | 0.01 | Horizontal fraction of the viewport for the initial seed hold. |
| Seed Y (fraction) | `seedHoldY` | 0 | 1 | 0.01 | Vertical fraction of the viewport for the initial seed hold. |
| Seed gain | `seedHoldGain` | 0 | 1 | 0.01 | Lighting gain of the seed hold on mount (field starts partly “painted”). |
| Admit min | `persistAdmitMin` | 0 | 0.4 | 0.005 | Minimum hold disc strength required for latch admission. |
| Admit hash floor | `persistAdmitBase` | 0 | 1 | 0.01 | Base hash threshold for latching a glyph inside a hold. |
| Admit hash × disc | `persistAdmitSpan` | 0 | 1 | 0.01 | Hash threshold increase scaled by hold disc strength at the glyph. |

---

## Mesh

| Label | Key | Min | Max | Step | Effect |
| --- | --- | ---: | ---: | ---: | --- |
| Links per node | `links` | 1 | 16 | 1 | Maximum neighbor links drawn from each visible mesh node. |
| Link min (px) | `linkMin` | 1 | 40 | 1 | Minimum screen distance for a link to a neighbor. |
| Link max (px) | `linkMax` | 20 | 240 | 1 | Maximum screen distance for a link to a neighbor. |
| Focal length | `focal` | 120 | 2000 | 10 | Perspective focal length for projecting mesh nodes. |
| Depth | `depth` | 0.1 | 4 | 0.05 | Z extent of nodes derived from glyph bits. |
| Focus scale | `focus` | 0.6 | 1.6 | 0.01 | Scale at which mesh elements are sharpest (defocus grows away from this). |
| Yaw base | `yawBase` | 0 | 1.2 | 0.01 | Base yaw rotation of the mesh (radians). |
| Yaw amp | `yawAmp` | 0 | 1 | 0.01 | Amplitude of slow yaw oscillation. |
| Yaw freq | `yawFreq` | 0 | 0.002 | 0.00001 | Frequency of yaw oscillation. |
| Pitch base | `pitchBase` | 0 | 1.2 | 0.01 | Base pitch rotation of the mesh (radians). |
| Pitch amp | `pitchAmp` | 0 | 0.4 | 0.005 | Amplitude of slow pitch oscillation. |
| Pitch freq | `pitchFreq` | 0 | 0.008 | 0.00005 | Frequency of pitch oscillation. |
| Node life min (ms) | `mixedNodeLifeMin` | 80 | 20000 | 10 | Minimum mixed mesh node envelope duration. |
| Node life max (ms) | `mixedNodeLifeMax` | 400 | 60000 | 50 | Maximum mixed mesh node envelope duration. |
| Link life min (ms) | `mixedLinkLifeMin` | 80 | 20000 | 10 | Minimum mixed link envelope duration. |
| Link life max (ms) | `mixedLinkLifeMax` | 400 | 60000 | 50 | Maximum mixed link envelope duration. |
| Life attack | `lifeIn` | 0.01 | 0.4 | 0.01 | Normalized attack portion of mesh life envelopes. |
| Life sustain until | `lifeHoldUntil` | 0.3 | 0.95 | 0.01 | Normalized age before mesh life envelopes release. |
| Life release | `lifeOut` | 0.05 | 0.5 | 0.01 | Normalized release tail of mesh life envelopes. |
| Prune delay (ms) | `pruneDelay` | 40 | 800 | 10 | Delay before dropping unseen mesh life keys from memory. |
| Shape scale base | `mixedScaleBase` | 0.2 | 2 | 0.02 | Base size scale for mixed node shapes. |
| Shape scale × s | `mixedScaleSpan` | 0 | 2 | 0.02 | Extra shape scale multiplied by perspective scale. |
| Dot radius | `mixedDotRadius` | 0.3 | 6 | 0.05 | Radius of dot-shaped mesh nodes. |
| Dot defocus | `mixedDotBlur` | 0 | 20 | 0.1 | Defocus contribution for dot nodes. |
| Square size | `mixedSquareBase` | 0.4 | 8 | 0.05 | Base size of square mesh nodes. |
| Cross arm | `mixedCrossArm` | 0.8 | 10 | 0.05 | Arm length of cross mesh nodes. |
| Link width | `linkWidthBase` | 0.2 | 4 | 0.05 | Base stroke width of mesh links. |
| Link width × blur | `linkWidthBlur` | 0 | 12 | 0.1 | Extra link width scaled by node defocus. |

**Color pickers (Mesh)**

| Label | Key | Default RGB |
| --- | --- | --- |
| Far ink | `meshFar` | 238, 255, 0 |
| Near ink | `meshNear` | 0, 255, 204 |

---

## Bogeys

| Label | Key | Min | Max | Step | Effect |
| --- | --- | ---: | ---: | ---: | --- |
| Bogey chance | `bogeyChance` | 0 | 1 | 0.01 | Hash probability that a visible node gets a 3×5 tag mark. |
| Tag life min (ms) | `mixedBogeyLifeMin` | 40 | 6000 | 10 | Minimum envelope duration for bogey tags. |
| Tag life max (ms) | `mixedBogeyLifeMax` | 200 | 30000 | 50 | Maximum envelope duration for bogey tags. |
| Max blur to show | `mixedBogeyBlurMax` | 0 | 1 | 0.01 | Defocus level above which tags are hidden. |
| Min node alpha | `mixedBogeyAlphaMin` | 0 | 1 | 0.01 | Minimum node alpha required to draw a tag. |
| Min tag envelope | `mixedBogeyLiveMin` | 0 | 0.5 | 0.01 | Minimum tag life envelope before drawing. |
| Tag alpha cap | `mixedBogeyMaxAlpha` | 0.1 | 1 | 0.01 | Upper cap on tag opacity. |
| Tag offset X | `mixedBogeyOffsetX` | 0 | 24 | 1 | Horizontal offset of the tag bitmap from the node (pixels). |
| Tag offset Y | `mixedBogeyOffsetY` | 0 | 24 | 1 | Vertical offset magnitude of the tag bitmap (pixels). |
| HUD bogey click min | `bogeyClickMin` | 0 | 1 | 0.01 | Minimum click strength for HUD-style bogey emphasis (Mixed mesh tags use separate gates). |

**Color pickers (Bogeys)**

| Label | Key | Default RGB |
| --- | --- | --- |
| Tag color | `bogeyRgb` | 255, 200, 0 |

---

## Core formulas

These relationships drive layout and lighting. Values come from `PhosphorParams` and the current viewport; they are adapted from the main phosphor field reference without optional page-destruction features.

### Pool size

The renderer estimates how many glyphs fit the viewport, then scales for the vertical field span:

```
visible = clamp(round((width × height) / poolAreaDivisor), poolMin, poolMax)
count   = round(visible × (span / height))
```

`span` is the page height clamped between `height × fieldSpanMinTimes` and `height × fieldSpanMaxTimes`. About `clusterChance` of glyphs spawn near random anchors (spread from `clusterSpreadMin` and `clusterSpreadSpan`); the rest are uniform.

### Screen position

Each glyph has a fractional vertical position `baseY` on the span and a horizontal `baseX` in pixels. Vertical motion combines scroll lag and parallax:

```
loop = span + fieldLoopPad
y    = ((baseY × span − scrollLag × speed) mod loop) − placeYOffset
x    = baseX
```

`speed` is `speedMin + random × speedSpan`. Drift updates `baseX` and `baseY` each frame and wraps within the field.

### Scroll lag

The simulated scroll position follows the window smoothly (not a fixed delay buffer):

```
scrollLag += (scrollY − scrollLag) × (1 − exp(−dt × scrollLagRate))
```

### Column presence

A text-column band (max width 1008px with side padding on narrow viewports) lowers presence in the center and raises it in the gutters. Values feather over a band at the column edge so marks are sparser and dimmer over typographic copy.

### Disc falloff

Wandering spots, pointer discs, and holds use a radial envelope. Inside `discShoulder` of the normalized radius the disc is full strength; toward the rim a cosine feather goes to zero:

```
t = distance / radius
t ≤ discShoulder → 1
else             → 0.5 + 0.5 × cos(π × (t − discShoulder) / (1 − discShoulder))
```

Spot strength also multiplies a time envelope (fade-in, hold, fade-out) and jittered density and radius.

---

## Internal parameters

Keys below are not wired to the tuner panel. They stay at `defaultPhosphorParams` on a fresh load unless a preset JSON includes them.

| Key | Default | Effect |
| --- | ---: | --- |
| `fieldSpanMinTimes` | 2 | Minimum vertical field length as a multiple of viewport height. |
| `fieldSpanMaxTimes` | 5 | Maximum vertical field length as a multiple of viewport height. |
| `fieldLoopPad` | 80 | Extra vertical wrap padding when glyphs loop on the span (pixels). |
| `placeYOffset` | 40 | Vertical offset applied when mapping looped Y to screen space (pixels). |
| `clusterSpreadMin` | 0.07 | Minimum anchor spread for clustered glyph placement (fraction of field). |
| `clusterSpreadSpan` | 0.06 | Random extra cluster spread added to cluster spread min. |
| `spinChance` | 0.6 | Probability a glyph receives a non-zero spin speed. |
| `pulseAmpCenter` | 0.62 | Center of the size pulse multiplier wave. |
| `pulseAmpRange` | 0.76 | Half-range of the size pulse multiplier wave. |
| `dprCap` | 2 | Maximum device pixel ratio used for the canvas backing store. |
| `inkGain0` | 1 | Alpha gain for ink index 0 (olive). |
| `inkGain1` | 0.85 | Alpha gain for ink index 1 (lime). |
| `inkGain2` | 0.8 | Alpha gain for ink index 2 (amber). |
| `inkGain3` | 0.7 | Alpha gain for ink index 3 (magenta). |
| `flickerMin` | 0.5 | Minimum per-glyph flicker multiplier. |
| `flickerSpan` | 0.1 | Random span added to flicker min each flicker tick. |
| `flickerGapMin` | 70 | Minimum milliseconds between flicker updates. |
| `flickerGapSpan` | 190 | Random extra gap added to flicker gap min. |
| `bitsShiftMs` | 280 | Timing offset used when shifting glyph bit patterns. |
| `morphInitialMin` | 2250 | Minimum initial morph schedule offset on spawn (ms). |
| `morphInitialSpan` | 5250 | Random extra initial morph offset (ms). |
| `reducedFlick` | 0.8 | Flicker scale when reduced motion is preferred. |
| `paintAlphaBoldMul` | 5 | Multiplier tying boldness and flicker into final glyph alpha. |
| `revealMin` | 0.05 | Skip drawing glyphs whose reveal product falls below this. |
| `paintAlphaMin` | 0.012 | Skip drawing glyphs whose final alpha falls below this. |
| `dotStartY` | 84 | Vertical start of the dot speck grid (pixels). |
| `dotStartX` | 4 | Horizontal start of the dot speck grid (pixels). |
| `occupyBase` | 0.5 | Base hash occupancy for dot grid cells. |
| `occupyLift` | 0.04 | Extra occupancy when a cell is lit. |
| `occupyClick` | 0.06 | Extra occupancy under strong click lighting. |
| `flickerPeriodMin` | 700 | Minimum dot flicker period (ms). |
| `flickerPeriodSpan` | 2400 | Random extra dot flicker period (ms). |
| `flickerDepthMin` | 0.4 | Minimum dot flicker depth. |
| `flickerDepthSpan` | 0.6 | Random extra dot flicker depth. |
| `reducedDotFlicker` | 0.85 | Dot flicker scale when reduced motion is preferred. |
| `pingAgeFall` | 0.35 | How quickly ping stroke alpha falls with age. |
| `pingFacetOuter` | 190 | Outer facet size for ping ring drawing. |
| `pingFacetInnerBase` | 28 | Inner facet base size for ping rings. |
| `pingFacetInnerGrow` | 90 | Inner facet growth with ping age. |
| `pingStrokeOuterAlpha` | 0.28 | Alpha of the outer ping stroke. |
| `pingStrokeInnerAlpha` | 0.12 | Alpha of the inner ping stroke. |
| `spotDensityMin` | 0.5 | Base density multiplier inside wandering spots. |
| `spotDensitySpan` | 0.14 | Random span added to spot density min. |
| `reducedSpotEnvelope` | 0.82 | Wandering spot envelope scale when reduced motion is preferred. |
| `spotJitterMin` | 90 | Minimum interval between spot jitter updates (ms). |
| `spotJitterSpan` | 180 | Random extra spot jitter interval (ms). |
| `spotDensityJitter` | 0.08 | Amplitude of spot density jitter. |
| `spotDensityMinMul` | 0.72 | Lower bound multiplier when jittering spot density. |
| `spotDensityMaxMul` | 1.2 | Upper bound multiplier when jittering spot density. |
| `spotRadiusJitter` | 16 | Amplitude of spot radius jitter (pixels). |
| `spotRadiusMinMul` | 0.82 | Lower bound multiplier when jittering spot radius. |
| `spotRadiusMaxMul` | 1.18 | Upper bound multiplier when jittering spot radius. |
| `spotPhase` | 0.46 | Phase offset between multiple wandering spots. |
| `quietAlphaColumn` | 0.12 | Extra quiet reveal scaled by column presence. |
| `alphaSpreadMin` | 0.6 | Minimum per-glyph alpha spread factor for lit glyphs. |
| `alphaSpreadSpan` | 0.8 | Random span added to alpha spread min. |
| `quietSpreadMin` | 0.82 | Minimum per-glyph quiet spread factor. |
| `quietSpreadSpan` | 1.85 | Random span added to quiet spread min. |
| `clickLitMin` | 0.08 | Minimum lit factor contributed by click strength. |
| `nodeLifeMin` | 1200 | Minimum life for non-mixed network node envelopes (ms). |
| `nodeLifeMax` | 20000 | Maximum life for non-mixed network node envelopes (ms). |
| `linkLifeMin` | 1200 | Minimum life for default mesh link envelopes (ms). |
| `linkLifeMax` | 10000 | Maximum life for default mesh link envelopes (ms). |
| `depthTOffset` | 0.7 | Offset when mapping perspective scale to depth tint. |
| `depthTSpan` | 0.48 | Span when mapping perspective scale to depth tint. |
| `defocusNear` | 0.22 | Defocus rate when scale is below focus. |
| `defocusFar` | 0.4 | Defocus rate when scale is above focus. |
| `focusVeilBlurMin` | 0.05 | Minimum veil alpha for out-of-focus mesh nodes. |
| `linkFallBase` | 0.12 | Base link alpha falloff with distance. |
| `linkFallSpan` | 0.5 | Span of link alpha falloff between link min and max distance. |
| `mobileBlurMax` | 3 | Blur amplitude multiplier on narrow viewports (≤560px). |
| `linkAlphaMin` | 0.02 | Minimum alpha for drawing a link segment. |
| `mixedShownMin` | 0.05 | Minimum glyph alpha to participate in the mixed mesh. |
| `mixedLifeMin` | 0.02 | Minimum normalized life before mixed elements draw. |
| `mixedBlurAlphaBase` | 0.22 | Base mesh node alpha versus defocus. |
| `mixedBlurAlphaSpan` | 0.78 | Span of mesh node alpha versus defocus. |
| `mixedSquareBlur` | 2.4 | Defocus contribution for square nodes. |
| `mixedCrossBlur` | 1.4 | Defocus contribution for cross nodes. |
| `mixedSpinMin` | 0.00042 | Minimum spin rate for mixed node shapes (rad/s). |
| `mixedSpinSpan` | 0.0009 | Random extra mixed shape spin (rad/s). |

Presets may include any of these keys; importing merges them into the live `params` object alongside panel values.
