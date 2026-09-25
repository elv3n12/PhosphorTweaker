import { useEffect, useRef } from "react"
import { inkGain, inkRgb, params } from "./phosphor/params"

/*
STANDALONE MIXED PHOSPHOR FIELD
Full-viewport canvas (class phosphor-field). pointer-events:none;
window pointerdown and pointermove (while the primary button is down)
drive the spotlight. aria-hidden.

LOOP
measure() builds Scene + Motion. rAF calls step() then draw().
prefers-reduced-motion or a hidden document stops the loop and draw()
paints one frozen frame (scroll lag 0, wandering-spot envelope 0.82).
Resize rebuilds the glyph pool and keeps click disc position,
strength, radius boost, and the painting flag. Setting canvas.width
clears the buffer; fit() only does that when the size changed.

COORDINATES
Glyph baseX is viewport px. baseY is a fraction of fieldSpan (page
height, clamped to 2x–5x the viewport). Screen y wraps:
  ((baseY * span - scrollLag * speed) mod (span+80)) - 40
scrollLag eases toward window.scrollY. About half the glyphs get lazy
parallax speed; the rest stay put in the viewport. Click positions are
canvas-local (clientX/clientY when the canvas fills the viewport).

WHAT GETS DRAWN
Dots, optional ambient links and bogey tags (HUD pattern), then glyphs.
Mixed pattern replaces glyph drawing with depth-mesh dots, squares, and
crosses while keeping the same admission, holds, and scroll lag.

Admission sources:
  ambient   hash(gate) passes a column-scaled cutoff. Always on, quiet.
  wander    wandering discs fade in, hold, fade out, then relocate.
  click     pointer disc and drag, plus ping rings; persistClicks stamps
            holds so Mixed latches lit glyphs. seedHold seeds one quiet
            hold on enter.

SPOTLIGHT
discAt() is full to discShoulder, then cosine falloff through the rim
and discFeather. Click and drag follow the pointer; tap adds one ping.
Touch commits on pointerup without scroll. spotStrength eases out on
release (no iris).

COLUMN
columnPresence() quiets glyphs in a central column; gutters stay louder.
topFade clears the top band for headers.

JITTER
Spin, pulse, drift, morph clocks, independent dot flicker. Reduced
motion uses steady envelopes instead of animation.

INKS
0 olive, 1 lime, 2 amber, 3 magenta. Ink does not change under the pointer.
*/

const STROKES = [
  "ring",
  "box",
  "corners",
  "target",
  "chevron",
  "hash",
  "capsule",
  "window",
  "glitch",
  "ticks",
  "node",
  "reticle",
  "dial",
  "orbit",
  "bracket",
  "trace",
] as const

const FILLS = ["cells", "glitch", "fill", "cells"] as const

export type Kind = typeof STROKES[number] | typeof FILLS[number]

/* baseX/baseY are layout space. x/y are the current screen position.
   gate salts hash01 so each glyph accepts or rejects a spotlight.
   bits drive cells and dash orientation. rotSpeed is steady spin (rad/s).
   flickAt/morphAt are the next jitter timestamps. persistClicks latches
   clickHeld at clickHoldAt until HOLD_LATCH_MAX. */
export type Glyph = {
  baseX: number
  baseY: number
  x: number
  y: number
  size: number
  kind: string
  ink: number
  bits: number
  boldness: number
  filled: boolean
  speed: number
  speedRoll: number
  driftX: number
  driftY: number
  driftRoll: number
  driftAngle: number
  homeSize: number
  sizeLegacy: number
  sizeJitter: number
  pulses: boolean
  pulseRoll: number
  gate: number
  rot: number
  rotSpeed: number
  spinOnRoll: number
  spinSign: number
  spinAmt: number
  spinRolled: boolean
  morphRoll: number
  morphAnchor: number
  flick: number
  flickAt: number
  morphAt: number
  clickMorphLife: boolean
  clickHeld: boolean
  clickHoldAt: number
  clickHoldGain: number
  dead: boolean
}

export type PhosphorPattern = {
  id: string
  label: string
  pickKind: (rng: () => number, filled: boolean) => string
  draw: (ctx: CanvasRenderingContext2D, glyph: Glyph, now: number) => void
  hideLinks?: boolean
  persistClicks?: boolean
  seedHold?: boolean
}

/* Wandering density patch. radius and density jitter around the base
   values and are clamped back to them. seed changes when the spot is
   replaced, which changes which glyphs it admits. */
type Spot = {
  x: number
  y: number
  radius: number
  baseRadius: number
  radiusRoll: number
  radiusScale: number
  density: number
  baseDensity: number
  densityRoll: number
  densityScale: number
  seed: number
  born: number
  life: number
  lifeRoll: number
  jitterAt: number
}

type Scene = {
  width: number
  height: number
  span: number
  dpr: number
  glyphs: Glyph[]
  pattern: PhosphorPattern
}

type Ping = {
  x: number
  y: number
  born: number
  scale: number
}

type Hold = {
  x: number
  y: number
  radius: number
  born: number
  life: number
  lifeRoll: number
  gain: number
  seeded: boolean
  scale: number
}

/* Click disc. radiusBoost is extra radius from clicks and drag stamps.
   spotStrength is 0..1 and is what makes the click disc fade out.
   painting stays true while the primary button is held. */
type Motion = {
  pings: Ping[]
  holds: Hold[]
  bitsAt: number
  scrollY: number
  scrollLag: number
  spots: Spot[]
  spotX: number
  spotY: number
  radiusBoost: number
  spotStrength: number
  impactScale: number
  painting: boolean
}

type Shown = {
  glyph: Glyph
  reveal: number
  linked: boolean
  bogey: boolean
}

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash01(a: number, b: number, c: number) {
  const value = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453
  return value - Math.floor(value)
}

function fieldSpan(height: number) {
  const page = Math.max(height, document.documentElement.scrollHeight || height)
  return Math.min(
    Math.max(page, height * params.fieldSpanMinTimes),
    height * params.fieldSpanMaxTimes,
  )
}

function contentColumn(width: number) {
  if (width <= 560) return width - 24
  if (width <= 960) return Math.min(width - 32, 768)
  return Math.min(1008, width - 48)
}

/* 0.9 in the gutters, 0.08 through the text column. */
function columnPresence(x: number, width: number) {
  const gutter = Math.max(0, (width - contentColumn(width)) / 2)
  const mid = Math.abs(x - width / 2) / Math.max(1, width * 0.5)
  if (gutter < 36) {
    return params.columnCenterPresence + 0.82 * Math.min(1, mid / 0.62)
  }
  if (x <= gutter || x >= width - gutter) return params.columnGutterPresence
  const inset = Math.min(x - gutter, width - gutter - x)
  const feather = Math.min(88, gutter * 0.55)
  if (inset >= feather) return params.columnCenterPresence
  return (
    params.columnCenterPresence +
    (params.columnGutterPresence - params.columnCenterPresence) *
      (1 - inset / feather)
  )
}

function paint(ctx: CanvasRenderingContext2D, ink: number, alpha: number) {
  const [r, g, b] = inkRgb(ink)
  const color = `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
  ctx.fillStyle = color
  ctx.strokeStyle = color
}

function topFade(y: number) {
  if (y < params.topFadeStart) return 0
  if (y < params.topFadeEnd) {
    return (y - params.topFadeStart) / (params.topFadeEnd - params.topFadeStart)
  }
  return 1
}

function sizeLegacyFor(kind: string, rng: () => number) {
  const step = Math.floor(rng() * 5)
  let size = 6
  switch (kind) {
    case "fill":
      size = rng() > 0.86 ? 11 + step * 2 : 3 + step * 2
      break
    case "cells":
      size = rng() > 0.5 ? 15 : 11
      break
    case "chevron":
    case "hash":
      size = 10 + step * 4
      break
    case "target":
    case "ticks":
    case "node":
    case "capsule":
    case "reticle":
    case "dial":
    case "orbit":
    case "bracket":
    case "trace":
      size = 14 + step * 6
      break
    case "ring":
    case "box":
    case "corners":
    case "window":
    case "glitch":
      size = rng() > 0.9 ? 36 + step * 4 : 9 + step * 5
      break
    default:
      size = 10 + step * 4
      break
  }
  return size
}

function scaledSize(legacy: number, jitter = 1) {
  return Math.max(
    params.glyphSizeMin,
    Math.min(
      params.glyphSizeMax,
      Math.round((legacy / 3) * params.glyphSizeScale * jitter),
    ),
  )
}

function pickKind(rng: () => number, filled: boolean) {
  const palette = filled ? FILLS : STROKES
  return palette[Math.floor(rng() * palette.length)] ?? "ring"
}

function applyGlyphLive(glyph: Glyph) {
  if (glyph.spinOnRoll <= params.spinChance && !glyph.spinRolled) {
    glyph.spinSign = hash01(glyph.gate, 1.7, 2.2) > 0.5 ? 1 : -1
    glyph.spinAmt = hash01(glyph.gate, 3.1, 4.4)
    glyph.spinRolled = true
  }
  glyph.pulses = glyph.pulseRoll < params.pulseChance
  glyph.homeSize = scaledSize(glyph.sizeLegacy, glyph.sizeJitter)
  if (!glyph.pulses) glyph.size = glyph.homeSize
  const drift = params.driftMin + glyph.driftRoll * params.driftSpan
  glyph.driftX = Math.cos(glyph.driftAngle) * drift
  glyph.driftY = Math.sin(glyph.driftAngle) * drift
  glyph.speed = params.speedMin + glyph.speedRoll * params.speedSpan
  glyph.rotSpeed =
    glyph.spinOnRoll <= params.spinChance
      ? glyph.spinSign * (params.spinMin + glyph.spinAmt * params.spinSpan)
      : 0
  if (!glyph.clickMorphLife) {
    glyph.morphAt =
      glyph.morphAnchor + params.morphMin + glyph.morphRoll * params.morphSpan
  }
}

function glyphAmbientAlways(glyph: Glyph, width: number) {
  return (
    hash01(glyph.gate, 2.3, glyph.bits) <
    params.ambientBase + params.ambientColumn * columnPresence(glyph.x, width)
  )
}

function morphDelay(rng: () => number = Math.random) {
  return params.morphMin + rng() * params.morphSpan
}

function applyClickMorphLife(
  glyph: Glyph,
  motion: Motion,
  now: number,
  width: number,
) {
  const clicked = clickStrength(glyph.x, glyph.y, motion, now)
  if (
    clicked <= params.clickLitMin ||
    glyphAmbientAlways(glyph, width) ||
    glyph.clickMorphLife
  ) {
    return
  }
  glyph.clickMorphLife = true
  const left = Math.max(0, glyph.morphAt - now)
  const base = left > 0 ? left : morphDelay()
  glyph.morphAt = now + base * params.clickMorphLifeFactor
}

function rollGlyph(
  rng: () => number,
  width: number,
  anchorX: number,
  anchorY: number,
  clustered: boolean,
  pick: PhosphorPattern["pickKind"],
): Glyph {
  const filled = rng() > 0.5
  const kind = pick(rng, filled)
  const inkRoll = rng()
  const ink = inkRoll > 0.97 ? 3 : inkRoll > 0.91 ? 2 : inkRoll > 0.74 ? 1 : 0
  const spread = clustered
    ? params.clusterSpreadMin + rng() * params.clusterSpreadSpan
    : 0.5
  const baseX = clustered
    ? Math.min(
        width - 8,
        Math.max(8, (anchorX + (rng() - 0.5) * spread) * width),
      )
    : 8 + rng() * Math.max(16, width - 16)
  const baseY = clustered
    ? Math.min(0.98, Math.max(0.02, anchorY + (rng() - 0.5) * spread))
    : rng()
  const rot = rng() * Math.PI * 2
  const sizeLegacy = sizeLegacyFor(kind, rng)
  const driftAngle = rng() * Math.PI * 2
  const driftRoll = rng()
  const pulseRoll = rng()
  const bits = Math.floor(rng() * 512)
  const boldness = filled ? 0.62 + rng() * 0.38 : 0.28 + rng() * 0.72
  const speedRoll = rng()
  const gate = rng() * 1000
  const spinOnRoll = rng()
  let spinSign = 1
  let spinAmt = 0
  let spinRolled = false
  if (spinOnRoll <= params.spinChance) {
    spinSign = rng() > 0.5 ? 1 : -1
    spinAmt = rng()
    spinRolled = true
  }
  const flick = 0.35 + rng() * 0.65
  const flickRoll = rng()
  const morphRoll = rng()
  const glyph: Glyph = {
    baseX,
    baseY,
    x: 0,
    y: 0,
    size: 0,
    homeSize: 0,
    sizeLegacy,
    sizeJitter: 1,
    pulses: false,
    pulseRoll,
    kind,
    ink,
    bits,
    boldness,
    filled,
    speed: 0,
    speedRoll,
    driftX: 0,
    driftY: 0,
    driftRoll,
    driftAngle,
    gate,
    rot,
    rotSpeed: 0,
    spinOnRoll,
    spinSign,
    spinAmt,
    spinRolled,
    flick,
    flickAt: flickRoll * 300,
    morphAt: 0,
    morphRoll,
    morphAnchor: 0,
    clickMorphLife: false,
    clickHeld: false,
    clickHoldAt: 0,
    clickHoldGain: 1,
    dead: false,
  }
  applyGlyphLive(glyph)
  glyph.morphAt = params.morphInitialMin + morphRoll * params.morphInitialSpan
  return glyph
}

/* Pool size tracks the viewport, then is stretched by span/height so
   the on-screen count stays stable while the page is tall. Seed is
   fixed, so a resize rebuilds the same layout for the same size. */
function layout(
  width: number,
  height: number,
  dpr: number,
  pattern: PhosphorPattern,
): Scene {
  const rng = mulberry32(0x50484f53)
  const span = fieldSpan(height)
  const visible = Math.round(
    Math.min(
      params.poolMax,
      Math.max(params.poolMin, (width * height) / params.poolAreaDivisor),
    ),
  )
  const count = Math.round(visible * (span / height))
  const anchors = Array.from({ length: 14 }, () => ({
    x: rng(),
    y: rng(),
  }))
  const glyphs: Glyph[] = []
  for (let i = 0; i < count; i += 1) {
    const clustered = rng() < params.clusterChance
    const anchor = anchors[Math.floor(rng() * anchors.length)] ?? {
      x: 0.5,
      y: 0.5,
    }
    glyphs.push(
      rollGlyph(rng, width, anchor.x, anchor.y, clustered, pattern.pickKind),
    )
  }
  return { width, height, span, dpr, glyphs, pattern }
}

function applySpotLive(spot: Spot) {
  spot.baseRadius =
    params.spotRadiusMin + spot.radiusRoll * params.spotRadiusSpan
  spot.baseDensity =
    params.spotDensityMin + spot.densityRoll * params.spotDensitySpan
  spot.life = params.spotLifeMin + spot.lifeRoll * params.spotLifeSpan
  spot.radius = Math.max(
    spot.baseRadius * params.spotRadiusMinMul,
    Math.min(
      spot.baseRadius * params.spotRadiusMaxMul,
      spot.baseRadius * spot.radiusScale,
    ),
  )
  spot.density = Math.max(
    spot.baseDensity * params.spotDensityMinMul,
    Math.min(
      spot.baseDensity * params.spotDensityMaxMul,
      spot.baseDensity * spot.densityScale,
    ),
  )
}

function makeSpot(width: number, height: number, born: number): Spot {
  const x = 28 + Math.random() * Math.max(40, width - 56)
  const y = 120 + Math.random() * Math.max(48, height - 200)
  const spot: Spot = {
    x,
    y,
    radius: 0,
    baseRadius: 0,
    radiusRoll: Math.random(),
    radiusScale: 1,
    density: 0,
    baseDensity: 0,
    densityRoll: Math.random(),
    densityScale: 1,
    seed: Math.random() * 1000,
    born,
    life: 0,
    lifeRoll: Math.random(),
    jitterAt: born + 120,
  }
  applySpotLive(spot)
  return spot
}

/* 0 outside life. Rises over the first 12%, holds until 78%, falls
   across the last 22%. Reduced motion holds 0.82. */
function envelope(spot: Spot, now: number, reduced: boolean) {
  if (reduced) return params.reducedSpotEnvelope
  const age = (now - spot.born) / spot.life
  if (age <= 0 || age >= 1) return 0
  if (age < params.spotEnvelopeIn) return age / params.spotEnvelopeIn
  if (age > params.spotEnvelopeHold) {
    return Math.max(0, (1 - age) / (1 - params.spotEnvelopeHold))
  }
  return 1
}

/* 1 inside the shoulder, cosine through the rim and discFeather past
   it. Shared by the pointer spotlight and the wandering spots. */
function discAt(
  x: number,
  y: number,
  originX: number,
  originY: number,
  radius: number,
) {
  if (radius <= 0) return 0
  const distance = Math.hypot(x - originX, y - originY)
  const feather = Math.max(0, params.discFeather)
  const outer = radius * (1 + feather)
  if (distance >= outer) return 0
  const t = distance / radius
  const shoulder = Math.min(params.discShoulder, 0.95)
  if (t <= shoulder) return 1
  const span = 1 + feather - shoulder
  if (span <= 0) return 0
  const u = (t - shoulder) / span
  return 0.5 + 0.5 * Math.cos(Math.PI * u)
}

function pointerImpactScale(pointerType: string) {
  if (pointerType !== "touch" || params.clickRadiusBase <= 0) return 1
  return params.touchClickRadiusBase / params.clickRadiusBase
}

function clickRadius(motion: Motion) {
  return (params.clickRadiusBase + motion.radiusBoost) * motion.impactScale
}

/* 1 until 78% of this hold's own life, then a slow fade. Life is
   rolled per click so neighboring patches do not expire together. */
function holdFade(hold: Hold, now: number) {
  const age = (now - hold.born) / hold.life
  if (age < 0 || age >= 1) return 0
  if (age < params.holdFadeHold) return 1
  return (1 - age) / (1 - params.holdFadeHold)
}

/* Spatial admission only. Fade does not shrink this disc; latched
   glyphs stay until their own life ends. */
function holdAdmit(x: number, y: number, motion: Motion) {
  let open = 0
  motion.holds.forEach((hold) => {
    open = Math.max(open, discAt(x, y, hold.x, hold.y, hold.radius))
  })
  return open
}

function holdOpen(x: number, y: number, motion: Motion, now: number) {
  let open = 0
  motion.holds.forEach((hold) => {
    const fade = holdFade(hold, now)
    if (fade <= 0) return
    open = Math.max(open, discAt(x, y, hold.x, hold.y, hold.radius) * fade)
  })
  return open
}

function clickDisc(
  x: number,
  y: number,
  motion: Motion,
  now: number,
  includeHolds = true,
) {
  let open = 0
  if (motion.spotStrength >= 0.012) {
    open = Math.max(
      open,
      discAt(x, y, motion.spotX, motion.spotY, clickRadius(motion)) *
        motion.spotStrength,
    )
  }
  if (!includeHolds) return open
  return Math.max(open, holdOpen(x, y, motion, now))
}

function quietAlpha(column: number) {
  return params.quietAlphaBase + params.quietAlphaColumn * column
}

function clickedAlpha(column: number) {
  return params.clickedAlphaBase + params.clickedAlphaColumn * column
}

/* Quiet marks span a wide range. Click marks stay in 0.6..1.4. */
function alphaSpread(glyph: Glyph, salt: number) {
  return (
    params.alphaSpreadMin +
    params.alphaSpreadSpan * hash01(glyph.gate, salt, glyph.bits)
  )
}

function quietSpread(glyph: Glyph) {
  return (
    params.quietSpreadMin +
    params.quietSpreadSpan * hash01(glyph.gate, 31, glyph.bits)
  )
}

function pingOpen(x: number, y: number, pings: Ping[], now: number) {
  let open = 0
  pings.forEach((ping) => {
    const age = (now - ping.born) / params.pingLife
    if (age < 0 || age > 1) return
    const distance = Math.hypot(x - ping.x, y - ping.y)
    const radius =
      (params.pingRadiusBase + age * params.pingRadiusGrow) * ping.scale
    if (distance > radius) return
    const falloff = (1 - distance / radius) * (1 - age * params.pingAgeFall)
    open = Math.max(open, falloff)
  })
  return open
}

function moveSpotlight(motion: Motion, x: number, y: number) {
  motion.spotX = x
  motion.spotY = y
  motion.spotStrength = 1
  motion.radiusBoost = Math.max(motion.radiusBoost, params.radiusBoostStamp)
}

function pushClickPing(
  motion: Motion,
  x: number,
  y: number,
  now: number,
  scale = motion.impactScale,
) {
  motion.pings.push({ x, y, born: now, scale })
  if (motion.pings.length > params.maxPings) motion.pings.shift()
}

function holdGain(x: number, y: number, motion: Motion) {
  let gain = 0
  motion.holds.forEach((hold) => {
    if (discAt(x, y, hold.x, hold.y, hold.radius) <= 0.04) return
    gain = Math.max(gain, hold.gain)
  })
  return gain
}

function applyHoldLive(hold: Hold) {
  hold.radius = params.holdRadius * hold.scale
  hold.life =
    params.holdLifeMin +
    hold.lifeRoll * (params.holdLifeMax - params.holdLifeMin)
}

function stampHold(
  motion: Motion,
  x: number,
  y: number,
  now: number,
  gain = 1,
  seeded = false,
  scale = 1,
) {
  const near = motion.holds.some(
    (hold) => Math.hypot(hold.x - x, hold.y - y) < params.holdSpacing,
  )
  if (near) return
  const hold: Hold = {
    x,
    y,
    radius: 0,
    born: now,
    life: 0,
    lifeRoll: Math.random(),
    gain,
    seeded,
    scale,
  }
  applyHoldLive(hold)
  motion.holds.push(hold)
  if (motion.holds.length > params.maxHolds) motion.holds.shift()
}

function clickStrength(
  x: number,
  y: number,
  motion: Motion,
  now: number,
  includeHolds = true,
) {
  const ping = pingOpen(x, y, motion.pings, now)
  const disc = clickDisc(x, y, motion, now, includeHolds)
  return Math.max(ping, disc)
}

type GlyphView = {
  reveal: number
  linked: boolean
  bogey: boolean
}

/* Ambient glyphs are linked. Wander admits hidden glyphs at quietAlpha.
   clickStrength is what makes a glyph readable. */
function glyphView(
  glyph: Glyph,
  motion: Motion,
  now: number,
  reduced: boolean,
  width: number,
  persistClicks = false,
): GlyphView {
  const column = columnPresence(glyph.x, width)
  const quiet = quietAlpha(column) * quietSpread(glyph)
  const clicked = clickStrength(glyph.x, glyph.y, motion, now, !persistClicks)
  if (persistClicks) {
    if (!glyph.clickHeld) {
      const admit = holdAdmit(glyph.x, glyph.y, motion)
      if (
        admit > params.persistAdmitMin &&
        hash01(glyph.gate, 12.2, glyph.bits) <
          params.persistAdmitBase + params.persistAdmitSpan * admit
      ) {
        glyph.clickHeld = true
        glyph.clickHoldAt = now
        glyph.clickHoldGain = Math.max(0.08, holdGain(glyph.x, glyph.y, motion))
      }
    } else if (now - glyph.clickHoldAt >= params.holdLatchMax) {
      glyph.clickHeld = false
      glyph.clickHoldAt = 0
      glyph.clickHoldGain = 1
    } else {
      glyph.clickHoldGain = Math.max(
        glyph.clickHoldGain,
        holdGain(glyph.x, glyph.y, motion),
      )
    }
  }
  const held = persistClicks && glyph.clickHeld
  const persist = held ? 1 : 0
  const lit =
    clickedAlpha(column) *
    (0.82 + 0.2 * Math.max(clicked, persist)) *
    alphaSpread(glyph, 47)
  const bogey =
    (clicked > params.bogeyClickMin || held) &&
    hash01(glyph.gate, 8.4, glyph.bits) < params.bogeyChance
  if (held) {
    return { reveal: lit, linked: false, bogey }
  }
  if (
    hash01(glyph.gate, 2.3, glyph.bits) <
    params.ambientBase + params.ambientColumn * column
  ) {
    return { reveal: clicked > 0 ? lit : quiet, linked: true, bogey }
  }
  let open = 0
  motion.spots.forEach((spot) => {
    const env = envelope(spot, now, reduced)
    if (env <= 0) return
    const spatial = discAt(glyph.x, glyph.y, spot.x, spot.y, spot.radius)
    open = Math.max(open, env * spatial * spot.density)
  })
  if (!persistClicks) {
    open = Math.max(
      open,
      clickDisc(glyph.x, glyph.y, motion, now) * params.clickDensity,
      clicked * params.clickDensity,
    )
  }
  if (open <= 0 || hash01(glyph.gate, 9.1, glyph.bits) > open) {
    return { reveal: 0, linked: false, bogey: false }
  }
  return { reveal: clicked > 0 ? lit : quiet, linked: false, bogey }
}

/* Same alpha draw() paints, clamped to the pixel that actually shows. */
function glyphPaintAlpha(glyph: Glyph, reveal: number, reduced: boolean) {
  const gain = inkGain(glyph.ink)
  const flick = reduced ? params.reducedFlick : glyph.flick
  const persistGain = glyph.clickHeld ? glyph.clickHoldGain : 1
  return Math.min(
    1,
    params.paintAlphaBoldMul *
      glyph.boldness *
      flick *
      reveal *
      gain *
      persistGain *
      params.presence,
  )
}

/* Writes glyph.x/y. The modulo form stays positive when parallax is negative. */
function place(glyph: Glyph, scrollLag: number, span: number) {
  const loop = span + params.fieldLoopPad
  let y = glyph.baseY * span - scrollLag * glyph.speed
  y = (((y % loop) + loop) % loop) - params.placeYOffset
  glyph.x = glyph.baseX
  glyph.y = y
}

function facet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  const steps = radius < 6 ? 8 : radius < 12 ? 12 : 16
  ctx.beginPath()
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2
    const px = Math.round(x + Math.cos(angle) * radius)
    const py = Math.round(y + Math.sin(angle) * radius)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
}

function pixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const left = w < 0 ? x + w : x
  const top = h < 0 ? y + h : y
  ctx.fillRect(left, top, Math.abs(w), Math.abs(h))
}

function createMotion(width: number, height: number): Motion {
  const scrollY = window.scrollY || 0
  const now = performance.now()
  const first = makeSpot(width, height, now)
  const spots = [first]
  for (let i = 1; i < params.spotCount; i += 1) {
    spots.push(makeSpot(width, height, now - first.life * params.spotPhase * i))
  }
  return {
    pings: [],
    holds: [],
    bitsAt: 0,
    scrollY,
    scrollLag: scrollY,
    spots,
    spotX: -1000,
    spotY: -1000,
    radiusBoost: 0,
    spotStrength: 0,
    impactScale: 1,
    painting: false,
  }
}

function step(scene: Scene, motion: Motion, now: number, dt: number) {
  motion.scrollY = window.scrollY || 0
  motion.scrollLag +=
    (motion.scrollY - motion.scrollLag) *
    (1 - Math.exp(-dt * params.scrollLagRate))
  scene.span = fieldSpan(scene.height)

  while (motion.spots.length < params.spotCount) {
    motion.spots.push(makeSpot(scene.width, scene.height, now))
  }
  while (motion.spots.length > Math.max(1, params.spotCount)) {
    motion.spots.pop()
  }

  motion.spots.forEach((spot) => {
    if (now > spot.born + spot.life) {
      const next = makeSpot(scene.width, scene.height, now)
      spot.x = next.x
      spot.y = next.y
      spot.radiusRoll = next.radiusRoll
      spot.densityRoll = next.densityRoll
      spot.lifeRoll = next.lifeRoll
      spot.radiusScale = 1
      spot.densityScale = 1
      spot.seed = next.seed
      spot.born = now
      spot.jitterAt = now + 150
    }
    if (now > spot.jitterAt) {
      spot.jitterAt =
        now + params.spotJitterMin + Math.random() * params.spotJitterSpan
      const densityNudge =
        spot.baseDensity > 0
          ? ((Math.random() - 0.5) * params.spotDensityJitter) /
            spot.baseDensity
          : 0
      const radiusNudge =
        spot.baseRadius > 0
          ? ((Math.random() - 0.5) * params.spotRadiusJitter) / spot.baseRadius
          : 0
      spot.densityScale = Math.max(
        params.spotDensityMinMul,
        Math.min(params.spotDensityMaxMul, spot.densityScale + densityNudge),
      )
      spot.radiusScale = Math.max(
        params.spotRadiusMinMul,
        Math.min(params.spotRadiusMaxMul, spot.radiusScale + radiusNudge),
      )
    }
    applySpotLive(spot)
  })

  if (motion.painting) {
    motion.spotStrength = 1
  } else {
    motion.spotStrength +=
      (0 - motion.spotStrength) * (1 - Math.exp(-dt * params.spotStrengthRate))
    motion.radiusBoost *= Math.exp(-dt * params.radiusBoostDecay)
    if (motion.radiusBoost < 0.6) motion.radiusBoost = 0
  }
  if (motion.spotStrength < 0.01) motion.spotStrength = 0

  scene.glyphs.forEach((glyph) => {
    if (glyph.dead) return
    applyGlyphLive(glyph)
    const spanX = scene.width + 80
    glyph.baseX += glyph.driftX * dt
    glyph.baseX = ((glyph.baseX % spanX) + spanX) % spanX
    glyph.baseY += (glyph.driftY * dt) / Math.max(scene.span, 1)
    glyph.baseY = ((glyph.baseY % 1) + 1) % 1
    place(glyph, motion.scrollLag, scene.span)
    if (glyph.pulses) {
      const wave =
        params.pulseAmpCenter +
        params.pulseAmpRange *
          (0.5 + 0.5 * Math.sin(now * params.pulseFreq + glyph.gate))
      glyph.size = Math.max(
        params.glyphSizeMin,
        Math.min(params.glyphSizeMax, Math.round(glyph.homeSize * wave)),
      )
    }
    if (glyph.rotSpeed !== 0) {
      glyph.rot += glyph.rotSpeed * dt
    }
    if (now > glyph.flickAt) {
      glyph.flickAt =
        now + params.flickerGapMin + Math.random() * params.flickerGapSpan
      glyph.flick = params.flickerMin + Math.random() * params.flickerSpan
    }
    applyClickMorphLife(glyph, motion, now, scene.width)
    if (now > glyph.morphAt) {
      glyph.morphAnchor = now
      glyph.morphRoll = Math.random()
      glyph.clickMorphLife = false
      glyph.morphAt = now + params.morphMin + glyph.morphRoll * params.morphSpan
      glyph.kind = scene.pattern.pickKind(
        Math.random,
        glyph.filled && Math.random() > 0.2,
      )
      glyph.filled = FILLS.some((kind) => kind === glyph.kind)
      glyph.bits = Math.floor(Math.random() * 512)
      if (glyph.pulses) glyph.sizeJitter *= 0.82 + Math.random() * 0.65
      applyGlyphLive(glyph)
      glyph.boldness = Math.max(
        0.4,
        Math.min(1, glyph.boldness + (Math.random() - 0.5) * 0.35),
      )
    }
  })

  motion.pings = motion.pings.filter(
    (ping) => now - ping.born < params.pingLife,
  )
  motion.holds.forEach((hold) => {
    if (hold.seeded && scene.pattern.seedHold) {
      hold.x = scene.width * params.seedHoldX
      hold.y = scene.height * params.seedHoldY
      hold.gain = params.seedHoldGain
    }
    applyHoldLive(hold)
  })
  while (motion.holds.length > params.maxHolds) {
    const extra = motion.holds.findIndex((hold) => !hold.seeded)
    if (extra < 0) break
    motion.holds.splice(extra, 1)
  }
  motion.holds = motion.holds.filter((hold) => now - hold.born < hold.life)

  if (now > motion.bitsAt) {
    motion.bitsAt = now + params.bitsShiftMs
    scene.glyphs.forEach((glyph) => {
      if (glyph.dead || glyph.kind !== "cells") return
      glyph.bits = ((glyph.bits << 1) | (Math.random() > 0.48 ? 1 : 0)) & 0x1ff
    })
  }
}

function bitOn(bits: number, index: number) {
  return (bits & (1 << (index & 15))) !== 0
}

function brokenBox(
  ctx: CanvasRenderingContext2D,
  half: number,
  size: number,
  bits: number,
) {
  const x = -half + 0.5
  const y = -half + 0.5
  const sides = [0, 1, 2, 3].filter((side) => bitOn(bits, side))
  const draw = sides.length >= 2 ? sides : [0, 1, 2]
  ctx.beginPath()
  draw.forEach((side) => {
    if (side === 0) {
      ctx.moveTo(x, y)
      ctx.lineTo(x + size, y)
    } else if (side === 1) {
      ctx.moveTo(x + size, y)
      ctx.lineTo(x + size, y + size)
    } else if (side === 2) {
      ctx.moveTo(x, y + size)
      ctx.lineTo(x + size, y + size)
    } else {
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + size)
    }
  })
  ctx.stroke()
}

function brokenRing(
  ctx: CanvasRenderingContext2D,
  radius: number,
  bits: number,
) {
  if ((bits & 0xff) === 0) {
    facet(ctx, 0, 0, radius)
    return
  }
  const steps = radius < 6 ? 8 : radius < 12 ? 12 : 16
  ctx.beginPath()
  let drawing = false
  for (let i = 0; i <= steps; i += 1) {
    const on = bitOn(bits, Math.floor((i / steps) * 8))
    const angle = (i / steps) * Math.PI * 2
    const px = Math.round(Math.cos(angle) * radius)
    const py = Math.round(Math.sin(angle) * radius)
    if (!on) {
      drawing = false
      continue
    }
    if (!drawing) {
      ctx.moveTo(px, py)
      drawing = true
    } else ctx.lineTo(px, py)
  }
  ctx.stroke()
}

function drawGlyph(ctx: CanvasRenderingContext2D, glyph: Glyph, now = 0) {
  const size = glyph.size
  const half = Math.round(size / 2)
  const bits = glyph.bits
  ctx.save()
  ctx.translate(glyph.x, glyph.y)
  ctx.rotate(glyph.rot)

  switch (glyph.kind) {
    case "fill":
      ctx.fillRect(
        -half,
        -half,
        bitOn(bits, 0) ? Math.max(2, size - 2) : size,
        size,
      )
      break
    case "box":
      brokenBox(ctx, half, size, bits)
      break
    case "ring":
      brokenRing(ctx, half, bits)
      break
    case "target":
      brokenRing(ctx, half, bits)
      brokenRing(ctx, Math.max(3, half * 0.42), bits >> 3)
      if (bitOn(bits, 1)) ctx.fillRect(-1, -1, 2, 2)
      break
    case "corners": {
      const arm = Math.max(3, Math.round(size * 0.28))
      const signs = [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ] as const
      signs.forEach(([sx, sy], index) => {
        if (!bitOn(bits, index) && index > 0) return
        pixelRect(ctx, sx * half, sy * half, sx * arm, 1)
        pixelRect(ctx, sx * half, sy * half, 1, sy * arm)
      })
      break
    }
    case "cells": {
      const cell = glyph.size > 12 ? 3 : 2
      const gap = 1
      const span = cell * 3 + gap * 2
      const x0 = Math.round(-span / 2)
      const y0 = Math.round(-span / 2)
      for (let i = 0; i < 9; i += 1) {
        if ((bits & (1 << i)) === 0) continue
        ctx.fillRect(
          x0 + (i % 3) * (cell + gap),
          y0 + Math.floor(i / 3) * (cell + gap),
          cell,
          cell,
        )
      }
      break
    }
    case "glitch": {
      const rows = 3 + (bits & 3)
      const band = Math.max(1, Math.round(size / (rows + 1)))
      for (let i = 0; i < rows; i += 1) {
        if (!bitOn(bits, i + 2) && i !== 0) continue
        const shift = ((bits >> (i + 4)) & 3) - 1
        const width = Math.max(
          3,
          Math.round(size * (0.4 + ((bits >> i) & 3) * 0.16)),
        )
        ctx.fillRect(
          -Math.round(width / 2) + shift * 2,
          -half + i * (band + 1),
          width,
          band,
        )
      }
      break
    }
    case "window": {
      brokenBox(ctx, half, size, bits | 0b0101)
      const bar = Math.max(2, Math.round(size * 0.22))
      ctx.fillRect(
        -half,
        -half,
        bitOn(bits, 4) ? size : Math.round(size * 0.62),
        1,
      )
      if (bitOn(bits, 5))
        ctx.strokeRect(-half + 2.5, -half + bar + 1.5, size - 4, size - bar - 3)
      break
    }
    case "capsule": {
      const r = Math.max(2, Math.round(half * 0.55))
      const body = Math.max(r + 1, half)
      brokenRing(ctx, r, bits)
      ctx.beginPath()
      ctx.moveTo(-body + r, -r)
      ctx.lineTo(body - r, -r)
      if (bitOn(bits, 2)) {
        ctx.moveTo(-body + r, r)
        ctx.lineTo(body - r, r)
      }
      ctx.stroke()
      ctx.translate(body - r, 0)
      brokenRing(ctx, r, bits >> 2)
      ctx.translate(-(body - r) * 2, 0)
      brokenRing(ctx, r, bits >> 4)
      break
    }
    case "chevron":
      ctx.beginPath()
      ctx.moveTo(-Math.round(half * 0.35), -half)
      ctx.lineTo(Math.round(half * 0.55), 0)
      ctx.lineTo(-Math.round(half * 0.35), half)
      if (bitOn(bits, 0)) {
        ctx.moveTo(-half, -Math.round(half * 0.45))
        ctx.lineTo(0, 0)
        ctx.lineTo(-half, Math.round(half * 0.45))
      }
      ctx.stroke()
      break
    case "ticks": {
      brokenRing(ctx, Math.max(2, Math.round(half * 0.28)), bits)
      for (let i = 0; i < 8; i += 1) {
        if (!bitOn(bits, i)) continue
        const angle = (i / 8) * Math.PI * 2
        const inner = Math.round(half * 0.48)
        const outer = half
        ctx.beginPath()
        ctx.moveTo(
          Math.round(Math.cos(angle) * inner),
          Math.round(Math.sin(angle) * inner),
        )
        ctx.lineTo(
          Math.round(Math.cos(angle) * outer),
          Math.round(Math.sin(angle) * outer),
        )
        ctx.stroke()
      }
      break
    }
    case "node": {
      const r = Math.max(2, Math.round(half * 0.38))
      brokenRing(ctx, r, bits)
      ctx.beginPath()
      ctx.moveTo(r, 0)
      ctx.lineTo(half, 0)
      if (bitOn(bits, 3)) {
        ctx.moveTo(half, -2)
        ctx.lineTo(half, 2)
      }
      if (bitOn(bits, 4)) {
        ctx.moveTo(-r, 0)
        ctx.lineTo(-half, bitOn(bits, 5) ? -Math.round(half * 0.4) : 0)
      }
      ctx.stroke()
      break
    }
    case "hash": {
      const inset = Math.max(2, Math.round(half * 0.35))
      ctx.beginPath()
      if (bitOn(bits, 0)) {
        ctx.moveTo(-inset, -half)
        ctx.lineTo(-inset, half)
      }
      if (bitOn(bits, 1) || !bitOn(bits, 0)) {
        ctx.moveTo(inset, -half)
        ctx.lineTo(inset, half)
      }
      if (bitOn(bits, 2)) {
        ctx.moveTo(-half, -inset)
        ctx.lineTo(half, -inset)
      }
      if (bitOn(bits, 3) || !bitOn(bits, 2)) {
        ctx.moveTo(-half, inset)
        ctx.lineTo(half, inset)
      }
      ctx.stroke()
      break
    }
    case "reticle": {
      brokenRing(ctx, half, bits)
      brokenRing(ctx, Math.max(2, Math.round(half * 0.38)), bits >> 2)
      const gap = Math.max(2, Math.round(half * 0.22))
      ctx.beginPath()
      ctx.moveTo(-half, 0)
      ctx.lineTo(-gap, 0)
      ctx.moveTo(gap, 0)
      ctx.lineTo(half, 0)
      ctx.moveTo(0, -half)
      ctx.lineTo(0, -gap)
      ctx.moveTo(0, gap)
      ctx.lineTo(0, half)
      ctx.stroke()
      if (bitOn(bits, 6)) ctx.fillRect(-1, -1, 2, 2)
      break
    }
    case "dial": {
      brokenRing(ctx, half, bits | 0b11110000)
      const sweep = now * 0.0014 + (bits & 7)
      for (let i = 0; i < 12; i += 1) {
        if (!bitOn(bits, i)) continue
        const angle = sweep + (i / 12) * Math.PI * 2
        const inner = Math.round(half * (i % 3 === 0 ? 0.62 : 0.78))
        ctx.beginPath()
        ctx.moveTo(
          Math.round(Math.cos(angle) * inner),
          Math.round(Math.sin(angle) * inner),
        )
        ctx.lineTo(
          Math.round(Math.cos(angle) * half),
          Math.round(Math.sin(angle) * half),
        )
        ctx.stroke()
      }
      const mark = sweep
      ctx.beginPath()
      ctx.arc(0, 0, Math.max(3, half * 0.55), mark, mark + 0.9)
      ctx.stroke()
      break
    }
    case "orbit": {
      brokenRing(ctx, Math.max(2, Math.round(half * 0.22)), bits)
      const count = 2 + (bits & 1)
      for (let i = 0; i < count; i += 1) {
        const angle = now * 0.001 + glyph.gate + (i / count) * Math.PI * 2
        const radius = half * (0.62 + (i % 2) * 0.28)
        const x = Math.round(Math.cos(angle) * radius)
        const y = Math.round(Math.sin(angle) * radius)
        if (bitOn(bits, i + 2)) ctx.fillRect(x, y, 2, 2)
        else facet(ctx, x, y, 2)
      }
      break
    }
    case "bracket": {
      const arm = Math.max(3, Math.round(half * 0.35))
      ctx.beginPath()
      ctx.moveTo(-half, -half + arm)
      ctx.lineTo(-half, -half)
      ctx.lineTo(-half + arm, -half)
      ctx.moveTo(half - arm, -half)
      ctx.lineTo(half, -half)
      ctx.lineTo(half, -half + arm)
      ctx.moveTo(-half, half - arm)
      ctx.lineTo(-half, half)
      ctx.lineTo(-half + arm, half)
      ctx.moveTo(half - arm, half)
      ctx.lineTo(half, half)
      ctx.lineTo(half, half - arm)
      ctx.stroke()
      const bob = Math.round(
        Math.sin(now * 0.002 + glyph.gate) * Math.max(1, half * 0.2),
      )
      ctx.fillRect(-1, bob - 1, 2, 2)
      if (bitOn(bits, 1)) {
        ctx.beginPath()
        ctx.moveTo(-half, 0)
        ctx.lineTo(half, 0)
        ctx.stroke()
      }
      break
    }
    case "trace": {
      const lanes = 3
      for (let i = 0; i < lanes; i += 1) {
        if (!bitOn(bits, i) && i > 0) continue
        const y = -half + Math.round((i + 0.5) * (size / lanes))
        const shift = Math.round(
          ((now * 0.02 + glyph.gate + i * 9) % (size + 6)) - half,
        )
        const width = Math.max(3, Math.round(size * 0.35))
        ctx.fillRect(shift, y, width, 1)
      }
      const angle = now * 0.0016 + glyph.gate
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(
        Math.round(Math.cos(angle) * half),
        Math.round(Math.sin(angle) * half * 0.45),
      )
      ctx.stroke()
      break
    }
    default:
      break
  }
  ctx.restore()
}

export const hudPattern: PhosphorPattern = {
  id: "hud",
  label: "HUD",
  pickKind,
  draw: drawGlyph,
}

function fieldLift(
  x: number,
  y: number,
  motion: Motion,
  now: number,
  reduced: boolean,
  includeHolds = true,
) {
  let lift = clickDisc(x, y, motion, now, includeHolds)
  motion.spots.forEach((spot) => {
    const env = envelope(spot, now, reduced)
    if (env <= 0) return
    lift = Math.max(lift, env * discAt(x, y, spot.x, spot.y, spot.radius))
  })
  return lift
}

/* 0..1 per cell. Period and phase come from the cell hash so neighbors
   do not blink together. Some cells dip to 0, others only dim a little. */
function dotFlicker(x: number, y: number, now: number, reduced: boolean) {
  if (reduced) return params.reducedDotFlicker
  const phase = hash01(x, y, 11)
  const period =
    params.flickerPeriodMin + hash01(x, y, 17) * params.flickerPeriodSpan
  const wave = 0.5 + 0.5 * Math.cos((now / period + phase) * Math.PI * 2)
  const depth =
    params.flickerDepthMin + hash01(x, y, 23) * params.flickerDepthSpan
  return 1 - depth * (1 - wave)
}

/* Specks only. The pointer and wandering discs reveal more of them.
   Do not draw axis-aligned traces here. */
function drawDots(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  motion: Motion,
  now: number,
  reduced: boolean,
) {
  const { width, height } = scene
  const includeHolds = !scene.pattern.persistClicks
  for (let y = params.dotStartY; y < height; y += params.dotGrid) {
    const veil = topFade(y)
    if (veil < 0.2) continue
    for (let x = params.dotStartX; x < width; x += params.dotGrid) {
      const n = hash01(x, y, 3)
      const lift = fieldLift(x, y, motion, now, reduced, includeHolds)
      const clicked = clickStrength(x, y, motion, now, includeHolds)
      const occupy =
        params.occupyBase +
        lift * params.occupyLift +
        clicked * params.occupyClick
      if (n > occupy) continue
      const flick = dotFlicker(x, y, now, reduced)
      if (flick < 0.04) continue
      const alpha =
        (params.dotQuiet + (params.dotLit - params.dotQuiet) * clicked) *
        flick *
        veil *
        params.presence
      if (alpha < 0.008) continue
      paint(ctx, n > 0.9 ? 2 : 0, alpha)
      ctx.fillRect(x, y, n > 0.72 ? 2 : 1, n > 0.72 ? 2 : 1)
    }
  }
}

/* Nearest ambient neighbor within 52px, each pair once. Pointer-only
   glyphs are not linked, so the cursor does not draw new lines. */
function drawLinks(ctx: CanvasRenderingContext2D, shown: Shown[]) {
  const seen = new Set<string>()
  shown.forEach((entry, index) => {
    let best = -1
    let bestDistance = 52 * 52
    shown.forEach((other, otherIndex) => {
      if (otherIndex === index) return
      const dx = entry.glyph.x - other.glyph.x
      const dy = entry.glyph.y - other.glyph.y
      const distance = dx * dx + dy * dy
      if (distance < bestDistance) {
        bestDistance = distance
        best = otherIndex
      }
    })
    if (best < 0) return
    const a = Math.min(index, best)
    const b = Math.max(index, best)
    const key = `${a}:${b}`
    if (seen.has(key)) return
    seen.add(key)
    const from = shown[a]
    const to = shown[b]
    if (!from || !to) return
    if (!from.linked || !to.linked) return
    const reveal = Math.min(from.reveal, to.reveal)
    paint(ctx, 0, 0.14 * reveal * params.presence)
    ctx.beginPath()
    ctx.moveTo(from.glyph.x, from.glyph.y)
    ctx.lineTo(to.glyph.x, to.glyph.y)
    ctx.stroke()
  })
}

const BOGEY_TAGS = [
  "A1",
  "B12",
  "C0",
  "D2",
  "K7",
  "M",
  "SF",
  "01",
  "9D",
  "Q3",
] as const

const OLED: Record<string, readonly number[]> = {
  A: [2, 5, 7, 5, 5],
  B: [6, 5, 6, 5, 6],
  C: [3, 4, 4, 4, 3],
  D: [6, 5, 5, 5, 6],
  F: [7, 4, 6, 4, 4],
  K: [5, 5, 6, 5, 5],
  M: [5, 7, 7, 5, 5],
  Q: [7, 5, 5, 7, 3],
  S: [3, 4, 2, 1, 6],
  "0": [7, 5, 5, 5, 7],
  "1": [2, 6, 2, 2, 7],
  "2": [7, 1, 7, 4, 7],
  "3": [7, 1, 3, 1, 7],
  "7": [7, 1, 2, 2, 2],
  "9": [7, 5, 7, 1, 7],
}

function bogeyTag(glyph: Glyph) {
  const index = Math.floor(
    hash01(glyph.gate, 4.2, glyph.bits) * BOGEY_TAGS.length,
  )
  return BOGEY_TAGS[index] ?? "A1"
}

function drawOled(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
) {
  let cursor = Math.round(x)
  const top = Math.round(y)
  for (const char of text) {
    const rows = OLED[char]
    if (!rows) continue
    rows.forEach((row, rowIndex) => {
      for (let col = 0; col < 3; col += 1) {
        if ((row & (1 << (2 - col))) === 0) continue
        ctx.fillRect(cursor + col, top + rowIndex, 1, 1)
      }
    })
    cursor += 4
  }
}

/* Traveling segment between click-lit marks. Not a sweep. */
function drawBogeyLinks(
  ctx: CanvasRenderingContext2D,
  shown: Shown[],
  now: number,
) {
  const bogeys = shown.filter((entry) => entry.bogey)
  const seen = new Set<string>()
  bogeys.forEach((entry, index) => {
    let best = -1
    let bestDistance = 168 * 168
    bogeys.forEach((other, otherIndex) => {
      if (otherIndex === index) return
      const dx = entry.glyph.x - other.glyph.x
      const dy = entry.glyph.y - other.glyph.y
      const distance = dx * dx + dy * dy
      if (distance < bestDistance && distance > 18 * 18) {
        bestDistance = distance
        best = otherIndex
      }
    })
    if (best < 0) return
    const a = Math.min(index, best)
    const b = Math.max(index, best)
    const key = `${bogeys[a]?.glyph.gate}:${bogeys[b]?.glyph.gate}`
    if (seen.has(key)) return
    seen.add(key)
    const from = bogeys[a]
    const to = bogeys[b]
    if (!from || !to) return
    const dx = to.glyph.x - from.glyph.x
    const dy = to.glyph.y - from.glyph.y
    const phase = hash01(from.glyph.gate, to.glyph.gate, 6)
    const head = (now / 1100 + phase) % 1
    const tail = Math.max(0, head - 0.42)
    paint(ctx, 1, 0.55 * Math.min(from.reveal, to.reveal))
    ctx.beginPath()
    ctx.moveTo(from.glyph.x + dx * tail, from.glyph.y + dy * tail)
    ctx.lineTo(from.glyph.x + dx * head, from.glyph.y + dy * head)
    ctx.stroke()
  })
}

function drawBogeyTags(ctx: CanvasRenderingContext2D, shown: Shown[]) {
  shown.forEach(({ glyph, reveal, bogey }) => {
    if (!bogey || reveal < 0.2) return
    paint(ctx, 1, Math.min(0.9, reveal))
    drawOled(ctx, bogeyTag(glyph), glyph.x + glyph.size * 0.5 + 3, glyph.y - 6)
  })
}

/* Order: clear, dots, collect shown glyphs, links, glyphs, click rings.
   Reduced motion returns before the click chrome. */
function draw(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  motion: Motion,
  now: number,
  reduced: boolean,
) {
  const { width, height } = scene
  ctx.setTransform(scene.dpr, 0, 0, scene.dpr, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, width, height)
  ctx.lineWidth = 1
  ctx.lineJoin = "bevel"
  ctx.lineCap = "butt"

  if (reduced) {
    scene.glyphs.forEach((glyph) => place(glyph, 0, scene.span))
  }

  drawDots(ctx, scene, motion, now, reduced)

  const shown: Shown[] = []
  scene.glyphs.forEach((glyph) => {
    if (glyph.dead) return
    if (glyph.y < -glyph.size || glyph.y > height + glyph.size) return
    const view = glyphView(
      glyph,
      motion,
      now,
      reduced,
      width,
      scene.pattern.persistClicks,
    )
    if (view.reveal < params.revealMin) return
    const veil = topFade(glyph.y)
    if (veil <= 0) return
    shown.push({
      glyph,
      reveal: view.reveal * veil,
      linked: view.linked,
      bogey: view.bogey,
    })
  })

  if (!scene.pattern.hideLinks) {
    drawLinks(ctx, shown)
    drawBogeyLinks(ctx, shown, now)
  }
  shown.forEach(({ glyph, reveal }) => {
    const alpha = glyphPaintAlpha(glyph, reveal, reduced)
    if (alpha < params.paintAlphaMin) return
    paint(ctx, glyph.ink, alpha)
    scene.pattern.draw(ctx, glyph, now)
  })
  if (!scene.pattern.hideLinks) drawBogeyTags(ctx, shown)

  if (reduced) return

  motion.pings.forEach((ping) => {
    const age = (now - ping.born) / params.pingLife
    const fade = Math.max(0, 1 - age) * params.presence * topFade(ping.y)
    paint(ctx, 1, params.pingStrokeOuterAlpha * fade)
    facet(ctx, ping.x, ping.y, age * params.pingFacetOuter * ping.scale)
    paint(ctx, 1, params.pingStrokeInnerAlpha * fade)
    facet(
      ctx,
      ping.x,
      ping.y,
      (params.pingFacetInnerBase + age * params.pingFacetInnerGrow) *
        ping.scale,
    )
  })
}

function fit(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpr: number,
) {
  const bufferWidth = Math.max(1, Math.round(width * dpr))
  const bufferHeight = Math.max(1, Math.round(height * dpr))
  if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
    canvas.width = bufferWidth
    canvas.height = bufferHeight
  }
}

/* Listeners are on window because the canvas has pointer-events: none.
   Mouse click stamps the disc; drag while the primary button is down
   paints a trail. Touch only commits on tap (pointerup, no scroll).
   On release, spotStrength eases to 0 inside step(). */
export default function PhosphorField({ pattern = hudPattern }: {
  pattern?: PhosphorPattern
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d", { alpha: true })
    if (!context) return

    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduced = motionMedia.matches
    let scene = layout(1, 1, 1, pattern)
    let motion = createMotion(1, 1)
    let raf = 0
    let last = performance.now()
    let tapX = 0
    let tapY = 0
    let tapDragged = false
    let pendingTouch = false
    const touchScrollSlop = 16

    const abortTouch = () => {
      pendingTouch = false
      tapDragged = true
      motion.painting = false
    }

    const commitTap = (x: number, y: number) => {
      moveSpotlight(motion, x, y)
      if (scene.pattern.persistClicks) {
        stampHold(motion, x, y, performance.now(), 1, false, motion.impactScale)
      }
      pushClickPing(motion, x, y, performance.now())
    }

    const measure = () => {
      const width = canvas.clientWidth || window.innerWidth
      const height = canvas.clientHeight || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, params.dprCap)
      scene = layout(width, height, dpr, pattern)
      const scrollY = window.scrollY
      motion = {
        ...createMotion(width, height),
        scrollY,
        scrollLag: scrollY,
        spotX: motion.spotX,
        spotY: motion.spotY,
        radiusBoost: motion.radiusBoost,
        spotStrength: motion.spotStrength,
        impactScale: motion.impactScale,
        painting: motion.painting,
        holds: motion.holds,
      }
      fit(canvas, width, height, dpr)
    }

    const paint = (now: number) => {
      draw(context, scene, motion, now, reduced)
    }

    const loop = (now: number) => {
      if (reduced || document.hidden) return
      raf = requestAnimationFrame(loop)
      const dt = Math.min(params.dtCap, (now - last) / 1000)
      last = now
      step(scene, motion, now, dt)
      paint(now)
    }

    const start = () => {
      if (reduced || document.hidden) return
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const resize = () => {
      measure()
      if (reduced) paint(0)
    }

    const onScroll = () => {
      motion.scrollY = window.scrollY
      if (pendingTouch) abortTouch()
    }

    const onMotion = () => {
      reduced = motionMedia.matches
      if (reduced) {
        stop()
        paint(0)
        return
      }
      start()
    }

    const onVisibility = () => {
      if (document.hidden) {
        stop()
        return
      }
      start()
    }

    const canvasPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top, rect }
    }

    const onDown = (event: PointerEvent) => {
      if (reduced || event.button !== 0) return
      const point = canvasPoint(event)
      if (
        point.x < 0 ||
        point.y < 0 ||
        point.x > point.rect.width ||
        point.y > point.rect.height
      ) {
        return
      }
      tapX = point.x
      tapY = point.y
      tapDragged = false
      motion.impactScale = pointerImpactScale(event.pointerType)
      if (event.pointerType === "touch") {
        pendingTouch = true
        motion.painting = false
        return
      }
      pendingTouch = false
      motion.painting = true
      moveSpotlight(motion, point.x, point.y)
      if (scene.pattern.persistClicks) {
        stampHold(
          motion,
          point.x,
          point.y,
          performance.now(),
          1,
          false,
          motion.impactScale,
        )
      }
    }

    const onMove = (event: PointerEvent) => {
      if (reduced) return
      const point = canvasPoint(event)
      if (pendingTouch) {
        if (Math.hypot(point.x - tapX, point.y - tapY) > touchScrollSlop) {
          abortTouch()
        }
        return
      }
      if (!motion.painting) return
      if ((event.buttons & 1) === 0) {
        motion.painting = false
        return
      }
      if (Math.hypot(point.x - tapX, point.y - tapY) > params.tapDragPx) {
        tapDragged = true
      }
      moveSpotlight(motion, point.x, point.y)
      if (scene.pattern.persistClicks) {
        stampHold(
          motion,
          point.x,
          point.y,
          performance.now(),
          1,
          false,
          motion.impactScale,
        )
      }
    }

    const onCancel = () => {
      abortTouch()
    }

    const onUp = (event: PointerEvent) => {
      if (event.button !== 0) return
      motion.painting = false
      if (pendingTouch) {
        const wasTap = !tapDragged
        pendingTouch = false
        if (wasTap && !reduced) commitTap(tapX, tapY)
        return
      }
      if (!tapDragged && !reduced) {
        pushClickPing(motion, tapX, tapY, performance.now())
      }
    }

    measure()
    if (pattern.seedHold && pattern.persistClicks && !reduced) {
      stampHold(
        motion,
        canvas.clientWidth * params.seedHoldX,
        canvas.clientHeight * params.seedHoldY,
        performance.now(),
        params.seedHoldGain,
        true,
      )
    }
    if (reduced) paint(0)
    else start()

    const observer = new ResizeObserver(() => resize())
    observer.observe(canvas)
    window.addEventListener("resize", resize)
    window.visualViewport?.addEventListener("resize", resize)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onCancel)
    document.addEventListener("visibilitychange", onVisibility)
    motionMedia.addEventListener("change", onMotion)

    return () => {
      stop()
      observer.disconnect()
      window.removeEventListener("resize", resize)
      window.visualViewport?.removeEventListener("resize", resize)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      document.removeEventListener("visibilitychange", onVisibility)
      motionMedia.removeEventListener("change", onMotion)
    }
  }, [pattern])

  return (
    <canvas ref={canvasRef} className="phosphor-field" aria-hidden="true" />
  )
}
