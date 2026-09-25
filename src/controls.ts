import type { PhosphorParams } from "./phosphor/params"

export type SliderSpec = {
  key: keyof PhosphorParams
  label: string
  min: number
  max: number
  step: number
}

export type ColorSpec = {
  key: "meshFar" | "meshNear" | "bogeyRgb" | "ink0" | "ink1" | "ink2" | "ink3"
  label: string
}

export type GroupSpec = {
  id: string
  label: string
  sliders: SliderSpec[]
  colors?: ColorSpec[]
}

export const LAYOUT_KEYS = new Set<keyof PhosphorParams>([
  "poolMin",
  "poolMax",
  "poolAreaDivisor",
  "clusterChance",
  "clusterSpreadMin",
  "clusterSpreadSpan",
  "fieldSpanMinTimes",
  "fieldSpanMaxTimes",
])

export const groups: GroupSpec[] = [
  {
    id: "field",
    label: "Field",
    sliders: [
      { key: "presence", label: "Presence", min: 0, max: 1, step: 0.01 },
      { key: "glyphSizeScale", label: "Glyph size scale", min: 0.4, max: 4, step: 0.01 },
      { key: "glyphSizeMin", label: "Glyph size min", min: 1, max: 20, step: 1 },
      { key: "glyphSizeMax", label: "Glyph size max", min: 4, max: 80, step: 1 },
      { key: "poolMin", label: "Pool min", min: 200, max: 3000, step: 10 },
      { key: "poolMax", label: "Pool max", min: 400, max: 6000, step: 10 },
      { key: "poolAreaDivisor", label: "Pool area divisor", min: 120, max: 1600, step: 10 },
      { key: "clusterChance", label: "Cluster chance", min: 0, max: 1, step: 0.01 },
      { key: "scrollLagRate", label: "Scroll lag rate", min: 0.1, max: 6, step: 0.05 },
      { key: "morphMin", label: "Morph min (ms)", min: 200, max: 12000, step: 50 },
      { key: "morphSpan", label: "Morph span (ms)", min: 0, max: 20000, step: 50 },
      { key: "clickMorphLifeFactor", label: "Click morph life ×", min: 1, max: 20, step: 0.5 },
      { key: "pulseChance", label: "Pulse chance", min: 0, max: 1, step: 0.01 },
      { key: "pulseFreq", label: "Pulse freq", min: 0.0001, max: 0.008, step: 0.00005 },
      { key: "spinMin", label: "Spin min (rad/s)", min: 0, max: 0.4, step: 0.002 },
      { key: "spinSpan", label: "Spin span (rad/s)", min: 0, max: 0.6, step: 0.002 },
      { key: "driftMin", label: "Drift min (px/s)", min: 0, max: 80, step: 1 },
      { key: "driftSpan", label: "Drift span (px/s)", min: 0, max: 120, step: 1 },
      { key: "speedMin", label: "Parallax min", min: 0, max: 1, step: 0.01 },
      { key: "speedSpan", label: "Parallax span", min: 0, max: 1.5, step: 0.01 },
      { key: "topFadeStart", label: "Top fade start", min: 0, max: 200, step: 1 },
      { key: "topFadeEnd", label: "Top fade end", min: 20, max: 320, step: 1 },
      { key: "columnGutterPresence", label: "Gutter presence", min: 0, max: 1, step: 0.01 },
      { key: "columnCenterPresence", label: "Column presence", min: 0, max: 1, step: 0.01 },
      { key: "ambientBase", label: "Ambient hash floor", min: 0, max: 0.2, step: 0.001 },
      { key: "ambientColumn", label: "Ambient × column", min: 0, max: 0.6, step: 0.005 },
      { key: "dtCap", label: "dt cap (s)", min: 0.016, max: 0.2, step: 0.001 },
    ],
    colors: [
      { key: "ink0", label: "Ink 0 olive" },
      { key: "ink1", label: "Ink 1 lime" },
      { key: "ink2", label: "Ink 2 amber" },
      { key: "ink3", label: "Ink 3 magenta" },
    ],
  },
  {
    id: "spots",
    label: "Spots and clicks",
    sliders: [
      { key: "dotQuiet", label: "Dot quiet alpha", min: 0, max: 1, step: 0.005 },
      { key: "dotLit", label: "Dot lit alpha", min: 0, max: 1, step: 0.01 },
      { key: "dotGrid", label: "Dot grid (px)", min: 6, max: 48, step: 1 },
      { key: "clickDensity", label: "Click density", min: 0, max: 1, step: 0.01 },
      { key: "clickRadiusBase", label: "Click radius base", min: 20, max: 400, step: 1 },
      { key: "touchClickRadiusBase", label: "Touch click radius", min: 20, max: 400, step: 1 },
      { key: "radiusBoostStamp", label: "Radius boost stamp", min: 0, max: 600, step: 1 },
      { key: "radiusBoostDecay", label: "Radius boost decay", min: 0.02, max: 2, step: 0.01 },
      { key: "spotStrengthRate", label: "Spotlight fade rate", min: 0.02, max: 2, step: 0.01 },
      { key: "discShoulder", label: "Disc shoulder", min: 0, max: 0.8, step: 0.01 },
      { key: "discFeather", label: "Disc feather", min: 0, max: 2, step: 0.01 },
      { key: "pingLife", label: "Ping life (ms)", min: 400, max: 16000, step: 25 },
      { key: "tapDragPx", label: "Tap vs drag (px)", min: 2, max: 40, step: 1 },
      { key: "maxPings", label: "Max pings", min: 1, max: 12, step: 1 },
      { key: "pingRadiusBase", label: "Ping radius start", min: 8, max: 240, step: 1 },
      { key: "pingRadiusGrow", label: "Ping radius grow", min: 20, max: 800, step: 5 },
      { key: "spotCount", label: "Wander spots", min: 1, max: 6, step: 1 },
      { key: "spotLifeMin", label: "Spot life min (ms)", min: 2000, max: 40000, step: 100 },
      { key: "spotLifeSpan", label: "Spot life span (ms)", min: 0, max: 40000, step: 100 },
      { key: "spotRadiusMin", label: "Spot radius min", min: 4, max: 200, step: 1 },
      { key: "spotRadiusSpan", label: "Spot radius span", min: 0, max: 400, step: 1 },
      { key: "spotEnvelopeIn", label: "Spot fade-in", min: 0.01, max: 0.4, step: 0.01 },
      { key: "spotEnvelopeHold", label: "Spot hold until", min: 0.3, max: 0.95, step: 0.01 },
      { key: "quietAlphaBase", label: "Quiet alpha base", min: 0, max: 0.4, step: 0.005 },
      { key: "clickedAlphaBase", label: "Click alpha base", min: 0, max: 2, step: 0.02 },
      { key: "clickedAlphaColumn", label: "Click alpha × column", min: 0, max: 6, step: 0.05 },
    ],
  },
  {
    id: "holds",
    label: "Holds",
    sliders: [
      { key: "maxHolds", label: "Max holds", min: 1, max: 24, step: 1 },
      { key: "holdSpacing", label: "Hold spacing", min: 4, max: 120, step: 1 },
      { key: "holdLifeMin", label: "Hold life min (ms)", min: 1000, max: 40000, step: 100 },
      { key: "holdLifeMax", label: "Hold life max (ms)", min: 2000, max: 60000, step: 100 },
      { key: "holdRadius", label: "Hold radius", min: 40, max: 1600, step: 10 },
      { key: "holdLatchMax", label: "Latch max (ms)", min: 2000, max: 120000, step: 500 },
      { key: "holdFadeHold", label: "Hold fade until", min: 0.3, max: 0.95, step: 0.01 },
      { key: "seedHoldX", label: "Seed X (fraction)", min: 0, max: 1, step: 0.01 },
      { key: "seedHoldY", label: "Seed Y (fraction)", min: 0, max: 1, step: 0.01 },
      { key: "seedHoldGain", label: "Seed gain", min: 0, max: 1, step: 0.01 },
      { key: "persistAdmitMin", label: "Admit min", min: 0, max: 0.4, step: 0.005 },
      { key: "persistAdmitBase", label: "Admit hash floor", min: 0, max: 1, step: 0.01 },
      { key: "persistAdmitSpan", label: "Admit hash × disc", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    id: "mesh",
    label: "Mesh",
    sliders: [
      { key: "links", label: "Links per node", min: 1, max: 16, step: 1 },
      { key: "linkMin", label: "Link min (px)", min: 1, max: 40, step: 1 },
      { key: "linkMax", label: "Link max (px)", min: 20, max: 240, step: 1 },
      { key: "focal", label: "Focal length", min: 120, max: 2000, step: 10 },
      { key: "depth", label: "Depth", min: 0.1, max: 4, step: 0.05 },
      { key: "focus", label: "Focus scale", min: 0.6, max: 1.6, step: 0.01 },
      { key: "yawBase", label: "Yaw base", min: 0, max: 1.2, step: 0.01 },
      { key: "yawAmp", label: "Yaw amp", min: 0, max: 1, step: 0.01 },
      { key: "yawFreq", label: "Yaw freq", min: 0, max: 0.002, step: 0.00001 },
      { key: "pitchBase", label: "Pitch base", min: 0, max: 1.2, step: 0.01 },
      { key: "pitchAmp", label: "Pitch amp", min: 0, max: 0.4, step: 0.005 },
      { key: "pitchFreq", label: "Pitch freq", min: 0, max: 0.008, step: 0.00005 },
      { key: "mixedNodeLifeMin", label: "Node life min (ms)", min: 80, max: 20000, step: 10 },
      { key: "mixedNodeLifeMax", label: "Node life max (ms)", min: 400, max: 60000, step: 50 },
      { key: "mixedLinkLifeMin", label: "Link life min (ms)", min: 80, max: 20000, step: 10 },
      { key: "mixedLinkLifeMax", label: "Link life max (ms)", min: 400, max: 60000, step: 50 },
      { key: "lifeIn", label: "Life attack", min: 0.01, max: 0.4, step: 0.01 },
      { key: "lifeHoldUntil", label: "Life sustain until", min: 0.3, max: 0.95, step: 0.01 },
      { key: "lifeOut", label: "Life release", min: 0.05, max: 0.5, step: 0.01 },
      { key: "pruneDelay", label: "Prune delay (ms)", min: 40, max: 800, step: 10 },
      { key: "mixedScaleBase", label: "Shape scale base", min: 0.2, max: 2, step: 0.02 },
      { key: "mixedScaleSpan", label: "Shape scale × s", min: 0, max: 2, step: 0.02 },
      { key: "mixedDotRadius", label: "Dot radius", min: 0.3, max: 6, step: 0.05 },
      { key: "mixedDotBlur", label: "Dot defocus", min: 0, max: 20, step: 0.1 },
      { key: "mixedSquareBase", label: "Square size", min: 0.4, max: 8, step: 0.05 },
      { key: "mixedCrossArm", label: "Cross arm", min: 0.8, max: 10, step: 0.05 },
      { key: "linkWidthBase", label: "Link width", min: 0.2, max: 4, step: 0.05 },
      { key: "linkWidthBlur", label: "Link width × blur", min: 0, max: 12, step: 0.1 },
    ],
    colors: [
      { key: "meshFar", label: "Far ink" },
      { key: "meshNear", label: "Near ink" },
    ],
  },
  {
    id: "bogeys",
    label: "Bogeys",
    sliders: [
      { key: "bogeyChance", label: "Bogey chance", min: 0, max: 1, step: 0.01 },
      { key: "mixedBogeyLifeMin", label: "Tag life min (ms)", min: 40, max: 6000, step: 10 },
      { key: "mixedBogeyLifeMax", label: "Tag life max (ms)", min: 200, max: 30000, step: 50 },
      { key: "mixedBogeyBlurMax", label: "Max blur to show", min: 0, max: 1, step: 0.01 },
      { key: "mixedBogeyAlphaMin", label: "Min node alpha", min: 0, max: 1, step: 0.01 },
      { key: "mixedBogeyLiveMin", label: "Min tag envelope", min: 0, max: 0.5, step: 0.01 },
      { key: "mixedBogeyMaxAlpha", label: "Tag alpha cap", min: 0.1, max: 1, step: 0.01 },
      { key: "mixedBogeyOffsetX", label: "Tag offset X", min: 0, max: 24, step: 1 },
      { key: "mixedBogeyOffsetY", label: "Tag offset Y", min: 0, max: 24, step: 1 },
      { key: "bogeyClickMin", label: "HUD bogey click min", min: 0, max: 1, step: 0.01 },
    ],
    colors: [{ key: "bogeyRgb", label: "Tag color" }],
  },
]
