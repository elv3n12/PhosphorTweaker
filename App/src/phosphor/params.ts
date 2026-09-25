export type Rgb = [number, number, number]

export type PhosphorParams = {
  presence: number
  glyphSizeScale: number
  glyphSizeMin: number
  glyphSizeMax: number
  morphMin: number
  morphSpan: number
  clickMorphLifeFactor: number
  scrollLagRate: number
  fieldSpanMinTimes: number
  fieldSpanMaxTimes: number
  fieldLoopPad: number
  placeYOffset: number
  poolMin: number
  poolMax: number
  poolAreaDivisor: number
  clusterChance: number
  clusterSpreadMin: number
  clusterSpreadSpan: number
  pulseChance: number
  pulseFreq: number
  pulseAmpCenter: number
  pulseAmpRange: number
  spinChance: number
  spinMin: number
  spinSpan: number
  driftMin: number
  driftSpan: number
  speedMin: number
  speedSpan: number
  topFadeStart: number
  topFadeEnd: number
  columnGutterPresence: number
  columnCenterPresence: number
  ambientBase: number
  ambientColumn: number
  dprCap: number
  dtCap: number
  inkGain0: number
  inkGain1: number
  inkGain2: number
  inkGain3: number
  flickerMin: number
  flickerSpan: number
  flickerGapMin: number
  flickerGapSpan: number
  bitsShiftMs: number
  morphInitialMin: number
  morphInitialSpan: number
  reducedFlick: number
  paintAlphaBoldMul: number
  revealMin: number
  paintAlphaMin: number
  ink0: Rgb
  ink1: Rgb
  ink2: Rgb
  ink3: Rgb
  dotQuiet: number
  dotLit: number
  dotGrid: number
  dotStartY: number
  dotStartX: number
  occupyBase: number
  occupyLift: number
  occupyClick: number
  flickerPeriodMin: number
  flickerPeriodSpan: number
  flickerDepthMin: number
  flickerDepthSpan: number
  reducedDotFlicker: number
  clickDensity: number
  pingLife: number
  tapDragPx: number
  maxPings: number
  clickRadiusBase: number
  touchClickRadiusBase: number
  radiusBoostStamp: number
  radiusBoostDecay: number
  spotStrengthRate: number
  discShoulder: number
  discFeather: number
  pingRadiusBase: number
  pingRadiusGrow: number
  pingAgeFall: number
  pingFacetOuter: number
  pingFacetInnerBase: number
  pingFacetInnerGrow: number
  pingStrokeOuterAlpha: number
  pingStrokeInnerAlpha: number
  spotLifeMin: number
  spotLifeSpan: number
  spotRadiusMin: number
  spotRadiusSpan: number
  spotDensityMin: number
  spotDensitySpan: number
  spotEnvelopeIn: number
  spotEnvelopeHold: number
  reducedSpotEnvelope: number
  spotJitterMin: number
  spotJitterSpan: number
  spotDensityJitter: number
  spotDensityMinMul: number
  spotDensityMaxMul: number
  spotRadiusJitter: number
  spotRadiusMinMul: number
  spotRadiusMaxMul: number
  spotCount: number
  spotPhase: number
  persistAdmitMin: number
  persistAdmitBase: number
  persistAdmitSpan: number
  bogeyClickMin: number
  quietAlphaBase: number
  quietAlphaColumn: number
  clickedAlphaBase: number
  clickedAlphaColumn: number
  alphaSpreadMin: number
  alphaSpreadSpan: number
  quietSpreadMin: number
  quietSpreadSpan: number
  clickLitMin: number
  maxHolds: number
  holdSpacing: number
  holdLifeMin: number
  holdLifeMax: number
  holdRadius: number
  holdLatchMax: number
  holdFadeHold: number
  seedHoldX: number
  seedHoldY: number
  seedHoldGain: number
  links: number
  linkMin: number
  linkMax: number
  focal: number
  depth: number
  focus: number
  meshFar: Rgb
  meshNear: Rgb
  nodeLifeMin: number
  nodeLifeMax: number
  linkLifeMin: number
  linkLifeMax: number
  mixedNodeLifeMin: number
  mixedNodeLifeMax: number
  mixedLinkLifeMin: number
  mixedLinkLifeMax: number
  mixedBogeyLifeMin: number
  mixedBogeyLifeMax: number
  pruneDelay: number
  lifeIn: number
  lifeHoldUntil: number
  lifeOut: number
  yawBase: number
  yawAmp: number
  yawFreq: number
  pitchBase: number
  pitchAmp: number
  pitchFreq: number
  depthTOffset: number
  depthTSpan: number
  defocusNear: number
  defocusFar: number
  focusVeilBlurMin: number
  linkFallBase: number
  linkFallSpan: number
  linkWidthBase: number
  linkWidthBlur: number
  mobileBlurMax: number
  linkAlphaMin: number
  mixedShownMin: number
  mixedLifeMin: number
  mixedBlurAlphaBase: number
  mixedBlurAlphaSpan: number
  mixedDotRadius: number
  mixedDotBlur: number
  mixedSquareBase: number
  mixedSquareBlur: number
  mixedCrossBlur: number
  mixedCrossArm: number
  mixedScaleBase: number
  mixedScaleSpan: number
  mixedSpinMin: number
  mixedSpinSpan: number
  mixedBogeyBlurMax: number
  mixedBogeyAlphaMin: number
  mixedBogeyLiveMin: number
  mixedBogeyMaxAlpha: number
  mixedBogeyOffsetX: number
  mixedBogeyOffsetY: number
  bogeyChance: number
  bogeyRgb: Rgb
}

export const defaultPhosphorParams: PhosphorParams = {
  presence: 0.62,
  glyphSizeScale: 0.91,
  glyphSizeMin: 2,
  glyphSizeMax: 16,
  morphMin: 12000,
  morphSpan: 0,
  clickMorphLifeFactor: 20,
  scrollLagRate: 1,
  fieldSpanMinTimes: 2,
  fieldSpanMaxTimes: 5,
  fieldLoopPad: 80,
  placeYOffset: 40,
  poolMin: 200,
  poolMax: 2790,
  poolAreaDivisor: 610,
  clusterChance: 0.41,
  clusterSpreadMin: 0.07,
  clusterSpreadSpan: 0.06,
  pulseChance: 1,
  pulseFreq: 0.0054,
  pulseAmpCenter: 0.62,
  pulseAmpRange: 0.76,
  spinChance: 0.6,
  spinMin: 0.106,
  spinSpan: 0.138,
  driftMin: 5,
  driftSpan: 9,
  speedMin: 0.09,
  speedSpan: 0.55,
  topFadeStart: 66,
  topFadeEnd: 116,
  columnGutterPresence: 1,
  columnCenterPresence: 0.1,
  ambientBase: 0.095,
  ambientColumn: 0.6,
  dprCap: 2,
  dtCap: 0.016,
  inkGain0: 1,
  inkGain1: 0.85,
  inkGain2: 0.8,
  inkGain3: 0.7,
  flickerMin: 0.5,
  flickerSpan: 0.1,
  flickerGapMin: 70,
  flickerGapSpan: 190,
  bitsShiftMs: 280,
  morphInitialMin: 2250,
  morphInitialSpan: 5250,
  reducedFlick: 0.8,
  paintAlphaBoldMul: 5,
  revealMin: 0.05,
  paintAlphaMin: 0.012,
  ink0: [217, 255, 0],
  ink1: [184, 201, 65],
  ink2: [66, 244, 106],
  ink3: [11, 199, 63],
  dotQuiet: 0.085,
  dotLit: 0.66,
  dotGrid: 12,
  dotStartY: 84,
  dotStartX: 4,
  occupyBase: 0.5,
  occupyLift: 0.04,
  occupyClick: 0.06,
  flickerPeriodMin: 700,
  flickerPeriodSpan: 2400,
  flickerDepthMin: 0.4,
  flickerDepthSpan: 0.6,
  reducedDotFlicker: 0.85,
  clickDensity: 0,
  pingLife: 2900,
  tapDragPx: 10,
  maxPings: 4,
  clickRadiusBase: 400,
  touchClickRadiusBase: 125,
  radiusBoostStamp: 0,
  radiusBoostDecay: 0.02,
  spotStrengthRate: 0.02,
  discShoulder: 0.51,
  discFeather: 2,
  pingRadiusBase: 75,
  pingRadiusGrow: 295,
  pingAgeFall: 0.35,
  pingFacetOuter: 190,
  pingFacetInnerBase: 28,
  pingFacetInnerGrow: 90,
  pingStrokeOuterAlpha: 0.28,
  pingStrokeInnerAlpha: 0.12,
  spotLifeMin: 9600,
  spotLifeSpan: 17400,
  spotRadiusMin: 17,
  spotRadiusSpan: 400,
  spotDensityMin: 0.5,
  spotDensitySpan: 0.14,
  spotEnvelopeIn: 0.15,
  spotEnvelopeHold: 0.85,
  reducedSpotEnvelope: 0.82,
  spotJitterMin: 90,
  spotJitterSpan: 180,
  spotDensityJitter: 0.08,
  spotDensityMinMul: 0.72,
  spotDensityMaxMul: 1.2,
  spotRadiusJitter: 16,
  spotRadiusMinMul: 0.82,
  spotRadiusMaxMul: 1.18,
  spotCount: 3,
  spotPhase: 0.46,
  persistAdmitMin: 0.1,
  persistAdmitBase: 0,
  persistAdmitSpan: 0.4,
  bogeyClickMin: 1,
  quietAlphaBase: 0.31,
  quietAlphaColumn: 0.12,
  clickedAlphaBase: 0.5,
  clickedAlphaColumn: 0.15,
  alphaSpreadMin: 0.6,
  alphaSpreadSpan: 0.8,
  quietSpreadMin: 0.82,
  quietSpreadSpan: 1.85,
  clickLitMin: 0.08,
  maxHolds: 3,
  holdSpacing: 36,
  holdLifeMin: 19700,
  holdLifeMax: 4200,
  holdRadius: 250,
  holdLatchMax: 67500,
  holdFadeHold: 0.61,
  seedHoldX: 0.48,
  seedHoldY: 0.32,
  seedHoldGain: 0.42,
  links: 3,
  linkMin: 9,
  linkMax: 84,
  focal: 1190,
  depth: 1.7,
  focus: 1.01,
  meshFar: [238, 255, 0],
  meshNear: [0, 255, 204],
  nodeLifeMin: 1200,
  nodeLifeMax: 20000,
  linkLifeMin: 1200,
  linkLifeMax: 10000,
  mixedNodeLifeMin: 3790,
  mixedNodeLifeMax: 17600,
  mixedLinkLifeMin: 7520,
  mixedLinkLifeMax: 10000,
  mixedBogeyLifeMin: 6000,
  mixedBogeyLifeMax: 8050,
  pruneDelay: 610,
  lifeIn: 0.12,
  lifeHoldUntil: 0.85,
  lifeOut: 0.21,
  yawBase: 0,
  yawAmp: 0.2,
  yawFreq: 0.00009,
  pitchBase: 0.54,
  pitchAmp: 0.095,
  pitchFreq: 0.00035,
  depthTOffset: 0.7,
  depthTSpan: 0.48,
  defocusNear: 0.22,
  defocusFar: 0.4,
  focusVeilBlurMin: 0.05,
  linkFallBase: 0.12,
  linkFallSpan: 0.5,
  linkWidthBase: 0.5,
  linkWidthBlur: 1.7,
  mobileBlurMax: 3,
  linkAlphaMin: 0.02,
  mixedShownMin: 0.05,
  mixedLifeMin: 0.02,
  mixedBlurAlphaBase: 0.22,
  mixedBlurAlphaSpan: 0.78,
  mixedDotRadius: 0.95,
  mixedDotBlur: 0.5,
  mixedSquareBase: 0.5,
  mixedSquareBlur: 2.4,
  mixedCrossBlur: 1.4,
  mixedCrossArm: 1.15,
  mixedScaleBase: 1.68,
  mixedScaleSpan: 0.2,
  mixedSpinMin: 0.00042,
  mixedSpinSpan: 0.0009,
  mixedBogeyBlurMax: 1,
  mixedBogeyAlphaMin: 0.36,
  mixedBogeyLiveMin: 0.44,
  mixedBogeyMaxAlpha: 0.82,
  mixedBogeyOffsetX: 4,
  mixedBogeyOffsetY: 12,
  bogeyChance: 0.16,
  bogeyRgb: [255, 200, 0],
}

export const params: PhosphorParams = { ...cloneParams(defaultPhosphorParams) }

export function cloneParams(source: PhosphorParams): PhosphorParams {
  return {
    ...source,
    ink0: [...source.ink0],
    ink1: [...source.ink1],
    ink2: [...source.ink2],
    ink3: [...source.ink3],
    meshFar: [...source.meshFar],
    meshNear: [...source.meshNear],
    bogeyRgb: [...source.bogeyRgb],
  }
}

export function resetPhosphorParams() {
  Object.assign(params, cloneParams(defaultPhosphorParams))
}

export function applyPhosphorParams(next: Partial<PhosphorParams>) {
  Object.assign(params, next)
}

export function inkGain(index: number) {
  switch (index) {
    case 1:
      return params.inkGain1
    case 2:
      return params.inkGain2
    case 3:
      return params.inkGain3
    default:
      return params.inkGain0
  }
}

export function inkRgb(index: number): Rgb {
  switch (index) {
    case 1:
      return params.ink1
    case 2:
      return params.ink2
    case 3:
      return params.ink3
    default:
      return params.ink0
  }
}

export function blurAmp() {
  if (typeof window === "undefined") return 1
  return window.innerWidth <= 560 ? params.mobileBlurMax : 1
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.join(", ")}]`
  return String(value)
}

export function paramsAsTypeScript(source: PhosphorParams = params) {
  const lines = Object.entries(source).map(
    ([key, value]) => `  ${key}: ${formatValue(value)},`,
  )
  return `export const defaultPhosphorParams: PhosphorParams = {\n${lines.join("\n")}\n}\n`
}
