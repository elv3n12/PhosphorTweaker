import type { Glyph } from "../../PhosphorField"
import { blurAmp, params } from "../params"

export type MeshNode = {
  id: number
  x: number
  y: number
  s: number
  a: number
}

type LinkCandidate = {
  index: number
  dist: number
}

export type Life = {
  born: number
  life: number
  unit: number
  last: number
}

export const nodeLives = new Map<number, Life>()
export const linkLives = new Map<string, Life>()

function rollUnit() {
  const roll = Math.random()
  if (roll < 0.2) return Math.random() * 0.38
  if (roll > 0.84) return 1 - Math.random() * 0.18
  return 0.38 + Math.random() * 0.46
}

function lifeDuration(min: number, max: number, unit: number) {
  return min + unit * (max - min)
}

function lifeEnvelope(born: number, life: number, now: number) {
  const age = (now - born) / life
  if (age <= 0 || age >= 1) return 0
  if (age < params.lifeIn) return age / params.lifeIn
  if (age > params.lifeHoldUntil) {
    return Math.max(0, (1 - age) / params.lifeOut)
  }
  return 1
}

function rollLife(min: number, max: number) {
  const unit = rollUnit()
  return { unit, life: Math.max(1, lifeDuration(min, max, unit)) }
}

function staggeredBorn(now: number, life: number) {
  return now - Math.random() * life
}

export function sampleLife<K>(
  map: Map<K, Life>,
  key: K,
  now: number,
  min: number,
  max: number,
) {
  let rec = map.get(key)
  if (!rec) {
    const rolled = rollLife(min, max)
    rec = {
      born: staggeredBorn(now, rolled.life),
      unit: rolled.unit,
      life: rolled.life,
      last: now,
    }
    map.set(key, rec)
  } else {
    rec.life = Math.max(1, lifeDuration(min, max, rec.unit))
    rec.last = now
    if (now - rec.born >= rec.life) {
      const rolled = rollLife(min, max)
      rec.unit = rolled.unit
      rec.life = rolled.life
      rec.born = staggeredBorn(now, rolled.life)
    }
  }
  return lifeEnvelope(rec.born, rec.life, now)
}

export function pruneLives<K>(map: Map<K, Life>, now: number) {
  map.forEach((rec, key) => {
    if (now - rec.last > params.pruneDelay) map.delete(key)
  })
}

export function project(glyph: Glyph, now: number): Omit<MeshNode, "a" | "id"> {
  const cx = window.innerWidth * 0.5
  const cy = window.innerHeight * 0.5
  const yaw = params.yawBase + Math.cos(now * params.yawFreq) * params.yawAmp
  const pitch =
    params.pitchBase + Math.sin(now * params.pitchFreq) * params.pitchAmp
  const cyaw = Math.cos(yaw)
  const syaw = Math.sin(yaw)
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const x0 = glyph.x - cx
  const y0 = glyph.y - cy
  const z0 = ((glyph.bits & 255) / 255 - 0.5) * params.depth
  const x1 = x0 * cyaw + z0 * syaw
  const z1 = -x0 * syaw + z0 * cyaw
  const y1 = y0 * cp - z1 * sp
  const z2 = y0 * sp + z1 * cp
  const scale = params.focal / (params.focal + z2)
  return {
    x: cx + x1 * scale,
    y: cy + y1 * scale,
    s: scale,
  }
}

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

export function depthT(scale: number) {
  return clamp01((scale - params.depthTOffset) / params.depthTSpan)
}

export function defocus(scale: number) {
  const delta = params.focus - scale
  if (delta >= 0) return clamp01(delta / params.defocusNear)
  return clamp01(-delta / params.defocusFar)
}

export function hash01(a: number, b: number, c: number) {
  const value = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453
  return value - Math.floor(value)
}

export function focusVeil(id: number, blur: number, now: number) {
  if (blur <= params.focusVeilBlurMin) return 1
  const seed = hash01(id, 4.7, 22.3)
  const breath =
    0.55 + 0.45 * Math.sin(now * (0.00048 + seed * 0.0016) + seed * 12.566)
  const remnant = 0.04 + seed * 0.36 * breath
  return 1 - blur * (1 - remnant)
}

export function mixRgb(t: number): [number, number, number] {
  const far = params.meshFar
  const near = params.meshNear
  return [
    Math.round(far[0] + (near[0] - far[0]) * t),
    Math.round(far[1] + (near[1] - far[1]) * t),
    Math.round(far[2] + (near[2] - far[2]) * t),
  ]
}

export function rgba(rgb: [number, number, number], alpha: number) {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${clamp01(alpha)})`
}

export function styleAlpha(ctx: CanvasRenderingContext2D) {
  const value = String(ctx.fillStyle)
  const start = value.lastIndexOf(",")
  const end = value.lastIndexOf(")")
  if (start < 0 || end < 0) return 1
  const parsed = Number(value.slice(start + 1, end))
  return Number.isFinite(parsed) ? parsed : 1
}

function drawLink(
  ctx: CanvasRenderingContext2D,
  from: MeshNode,
  to: MeshNode,
  dist: number,
  linkLife: number,
  now: number,
) {
  const t = (depthT(from.s) + depthT(to.s)) * 0.5
  const blur = Math.max(defocus(from.s), defocus(to.s))
  const fall = 1 - (dist - params.linkMin) / (params.linkMax - params.linkMin)
  const veil = focusVeil(from.id * 1.13 + to.id * 0.71, blur, now)
  const alpha =
    from.a *
    to.a *
    fall *
    (params.linkFallBase + params.linkFallSpan * (1 - blur)) *
    linkLife *
    veil
  if (alpha < params.linkAlphaMin) return
  ctx.strokeStyle = rgba(mixRgb(t), alpha)
  ctx.lineWidth = params.linkWidthBase + blur * params.linkWidthBlur * blurAmp()
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
}

export type MeshLinkLifeSpan = {
  min: number
  max: number
}

export function paintMesh<T extends MeshNode>(
  ctx: CanvasRenderingContext2D,
  nodes: T[],
  now: number,
  paintNode: (ctx: CanvasRenderingContext2D, node: T, now: number) => void,
  lives: Map<string, Life> = linkLives,
  shown?: (node: T, now: number) => boolean,
  linkLifeSpan?: MeshLinkLifeSpan,
) {
  const linkMin = linkLifeSpan?.min ?? params.linkLifeMin
  const linkMax = linkLifeSpan?.max ?? params.linkLifeMax
  const live = shown ? nodes.filter((node) => shown(node, now)) : nodes
  if (live.length === 0) return
  const order = live.slice().sort((a, b) => a.s - b.s)

  ctx.save()
  ctx.imageSmoothingEnabled = true
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.globalCompositeOperation = "lighter"

  const seen = new Set<string>()
  order.forEach((node, index) => {
    const near: LinkCandidate[] = []
    order.forEach((other, otherIndex) => {
      if (otherIndex === index) return
      const dist = Math.hypot(node.x - other.x, node.y - other.y)
      if (dist < params.linkMin || dist > params.linkMax) return
      near.push({ index: otherIndex, dist })
    })
    near.sort((a, b) => a.dist - b.dist)
    near.slice(0, params.links).forEach(({ index: otherIndex, dist }) => {
      const other = order[otherIndex]
      if (!other) return
      const a = Math.min(node.id, other.id)
      const b = Math.max(node.id, other.id)
      const key = `${a}:${b}`
      if (seen.has(key)) return
      seen.add(key)
      const linkLife = sampleLife(lives, key, now, linkMin, linkMax)
      if (linkLife <= 0.02) return
      drawLink(ctx, node, other, dist, linkLife, now)
    })
  })

  order.forEach((node) => paintNode(ctx, node, now))
  ctx.restore()
}
