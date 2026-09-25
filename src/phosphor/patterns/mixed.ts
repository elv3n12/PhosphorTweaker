import type { Glyph, PhosphorPattern } from "../../PhosphorField"
import {
  type Life,
  type MeshNode,
  defocus,
  depthT,
  focusVeil,
  hash01,
  mixRgb,
  paintMesh,
  project,
  pruneLives,
  rgba,
  sampleLife,
  styleAlpha,
} from "./mesh"
import { blurAmp, params } from "../params"

const KINDS = ["dot", "square", "cross"] as const
type MixedKind = typeof KINDS[number]

const nodeLives = new Map<number, Life>()
const linkLives = new Map<string, Life>()
const bogeyLives = new Map<number, Life>()

type MixedNode = MeshNode & {
  kind: MixedKind
  rot: number
  bits: number
  bogey: boolean
  size: number
}

function pickKind(rng: () => number, _filled: boolean) {
  return KINDS[Math.floor(rng() * KINDS.length)] ?? "dot"
}

function asKind(kind: string): MixedKind {
  return KINDS.includes(kind as MixedKind) ? kind as MixedKind : "dot"
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

let meshAt = -1
const mesh: MixedNode[] = []

function bogeyTag(id: number, bits: number) {
  const index = Math.floor(hash01(id, 4.2, bits) * BOGEY_TAGS.length)
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

function mixedShown(node: MixedNode, now: number) {
  const blur = defocus(node.s)
  const veil = focusVeil(node.id, blur, now)
  const alpha =
    node.a *
    (params.mixedBlurAlphaBase +
      params.mixedBlurAlphaSpan * (1 - blur) * (1 - blur)) *
    veil
  return alpha >= params.mixedShownMin
}

function strokeMixedNode(
  ctx: CanvasRenderingContext2D,
  node: MixedNode,
  now: number,
  blur: number,
) {
  const sizeScale = Math.max(0.35, node.size / 8)
  const scale =
    (params.mixedScaleBase + node.s * params.mixedScaleSpan) * sizeScale
  const spin =
    node.kind === "dot"
      ? 0
      : (hash01(node.id, 2.1, 9.4) > 0.5 ? 1 : -1) *
        (params.mixedSpinMin + hash01(node.id, 7.7, 1.3) * params.mixedSpinSpan)
  const span = blurAmp()
  ctx.rotate(node.rot + now * spin)

  switch (node.kind) {
    case "dot": {
      const radius =
        (params.mixedDotRadius + blur * params.mixedDotBlur * span) * sizeScale
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case "square": {
      const half = Math.max(
        1.5,
        params.mixedSquareBase * scale + blur * params.mixedSquareBlur * span,
      )
      ctx.fillRect(-half, -half, half * 2, half * 2)
      break
    }
    case "cross": {
      const arm = Math.max(2.2, params.mixedCrossArm * scale)
      ctx.lineWidth = 1 + blur * params.mixedCrossBlur * span
      ctx.beginPath()
      ctx.moveTo(-arm, 0)
      ctx.lineTo(arm, 0)
      ctx.moveTo(0, -arm)
      ctx.lineTo(0, arm)
      ctx.stroke()
      break
    }
    default: {
      const exhaustive: never = node.kind
      void exhaustive
    }
  }
}

function drawMixedNode(
  ctx: CanvasRenderingContext2D,
  node: MixedNode,
  now: number,
) {
  const t = depthT(node.s)
  const blur = defocus(node.s)
  const rgb = mixRgb(t)
  const veil = focusVeil(node.id, blur, now)
  const alpha =
    node.a *
    (params.mixedBlurAlphaBase +
      params.mixedBlurAlphaSpan * (1 - blur) * (1 - blur)) *
    veil
  if (alpha < params.mixedLifeMin) return
  ctx.save()
  ctx.translate(node.x, node.y)
  ctx.lineCap = blur > 0.42 ? "round" : "square"
  ctx.strokeStyle = rgba(rgb, alpha)
  ctx.fillStyle = rgba(rgb, alpha)
  strokeMixedNode(ctx, node, now, blur)
  ctx.restore()

  if (
    !node.bogey ||
    blur > params.mixedBogeyBlurMax ||
    alpha < params.mixedBogeyAlphaMin
  )
    return
  const bogeyLive = sampleLife(
    bogeyLives,
    node.id,
    now,
    params.mixedBogeyLifeMin,
    params.mixedBogeyLifeMax,
  )
  if (bogeyLive <= params.mixedBogeyLiveMin) return
  ctx.fillStyle = rgba(
    params.bogeyRgb,
    Math.min(params.mixedBogeyMaxAlpha, alpha * bogeyLive),
  )
  drawOled(
    ctx,
    bogeyTag(node.id, node.bits),
    node.x + params.mixedBogeyOffsetX,
    node.y - params.mixedBogeyOffsetY,
  )
}

function draw(ctx: CanvasRenderingContext2D, glyph: Glyph, now: number) {
  if (now !== meshAt) {
    paintMesh(ctx, mesh, meshAt, drawMixedNode, linkLives, mixedShown, {
      min: params.mixedLinkLifeMin,
      max: params.mixedLinkLifeMax,
    })
    pruneLives(nodeLives, now)
    pruneLives(linkLives, now)
    pruneLives(bogeyLives, now)
    mesh.length = 0
    meshAt = now
  }
  const id = glyph.gate
  const live = sampleLife(
    nodeLives,
    id,
    now,
    params.mixedNodeLifeMin,
    params.mixedNodeLifeMax,
  )
  if (live <= params.mixedLifeMin) return
  const point = project(glyph, now)
  mesh.push({
    id,
    x: point.x,
    y: point.y,
    s: point.s,
    a: styleAlpha(ctx) * live,
    kind: asKind(glyph.kind),
    rot: glyph.rot,
    bits: glyph.bits,
    bogey: hash01(glyph.gate, 8.4, glyph.bits) < params.bogeyChance,
    size: glyph.size,
  })
}

const mixedPattern: PhosphorPattern = {
  id: "mixed",
  label: "Mixed",
  pickKind,
  draw,
  hideLinks: true,
  persistClicks: true,
  seedHold: true,
}

export default mixedPattern
