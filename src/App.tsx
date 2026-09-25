import { useEffect, useMemo, useRef, useState } from "react"
import PhosphorField from "./PhosphorField"
import mixedPattern from "./phosphor/patterns/mixed"
import {
  applyPhosphorParams,
  cloneParams,
  defaultPhosphorParams,
  params,
  type PhosphorParams,
  type Rgb,
} from "./phosphor/params"
import { groups, LAYOUT_KEYS, type ColorSpec, type SliderSpec } from "./controls"
import {
  readStoredPreviewBg,
  storePreviewBg,
} from "./previewBg"

function rgbToHex(rgb: Rgb) {
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
}

function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "")
  const n = Number.parseInt(value, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function randomSliderValue(slider: SliderSpec) {
  const span = slider.max - slider.min
  if (span <= 0) return slider.min
  const steps = Math.max(1, Math.round(span / slider.step))
  const raw = slider.min + Math.floor(Math.random() * (steps + 1)) * slider.step
  return Number(Math.min(slider.max, raw).toPrecision(12))
}

function midpointSliderValue(slider: SliderSpec) {
  const span = slider.max - slider.min
  if (span <= 0) return slider.min
  const steps = Math.max(1, Math.round(span / slider.step))
  const raw = slider.min + Math.round(steps / 2) * slider.step
  return Number(Math.min(slider.max, raw).toPrecision(12))
}

function randomRgb(): Rgb {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ]
}

function orderPair(
  next: Partial<PhosphorParams>,
  minKey: keyof PhosphorParams,
  maxKey: keyof PhosphorParams,
) {
  const min = next[minKey]
  const max = next[maxKey]
  if (typeof min !== "number" || typeof max !== "number" || min <= max) return
  next[minKey] = max as never
  next[maxKey] = min as never
}

function isRgbValue(value: unknown): value is Rgb {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (channel) => typeof channel === "number" && Number.isFinite(channel),
    )
  )
}

function parseImportedPreset(raw: unknown): {
  previewBg?: string
  params: Partial<PhosphorParams>
} {
  if (!raw || typeof raw !== "object") throw new Error("not an object")
  const body = raw as Record<string, unknown>
  const previewBg =
    typeof body.previewBg === "string" && /^#[0-9a-fA-F]{6}$/.test(body.previewBg)
      ? body.previewBg
      : undefined
  const nested = body.params
  const source = (
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? nested
      : body
  ) as Record<string, unknown>
  const next: Partial<PhosphorParams> = {}
  ;(Object.keys(defaultPhosphorParams) as (keyof PhosphorParams)[]).forEach(
    (key) => {
      if (!(key in source)) return
      const value = source[key]
      const fallback = defaultPhosphorParams[key]
      if (Array.isArray(fallback)) {
        if (!isRgbValue(value)) throw new Error(`bad color ${key}`)
        next[key] = [value[0], value[1], value[2]] as never
        return
      }
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(`bad number ${key}`)
      }
      next[key] = value as never
    },
  )
  if (Object.keys(next).length === 0) throw new Error("no parameters")
  return { previewBg, params: next }
}

function formatNumber(value: number) {
  if (Math.abs(value) >= 10) return value.toFixed(value % 1 === 0 ? 0 : 2)
  if (Math.abs(value) >= 1) return value.toFixed(2)
  return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "")
}

export default function App() {
  const [version, setVersion] = useState(0)
  const [fieldKey, setFieldKey] = useState(0)
  const [presetState, setPresetState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  )
  const [presetFile, setPresetFile] = useState("")
  const [previewBg, setPreviewBg] = useState(readStoredPreviewBg)
  const [importState, setImportState] = useState<"idle" | "loaded" | "error">(
    "idle",
  )
  const [importName, setImportName] = useState("")
  const importRef = useRef<HTMLInputElement>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set())
  const snapshot = useMemo(() => cloneParams(params), [version])

  useEffect(() => {
    storePreviewBg(previewBg)
  }, [previewBg])

  function updatePreviewBg(hex: string) {
    setPreviewBg(hex)
    storePreviewBg(hex)
  }

  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function bump(rebuild: boolean) {
    setVersion((count) => count + 1)
    if (rebuild) setFieldKey((count) => count + 1)
  }

  function setNumber(key: keyof PhosphorParams, value: number, rebuild: boolean) {
    applyPhosphorParams({ [key]: value })
    bump(rebuild)
  }

  function setColor(key: ColorSpec["key"], hex: string) {
    applyPhosphorParams({ [key]: hexToRgb(hex) })
    bump(false)
  }

  function resetGroup(keys: (keyof PhosphorParams)[]) {
    keys.forEach((key) => {
      const value = defaultPhosphorParams[key]
      applyPhosphorParams(
        Array.isArray(value)
          ? { [key]: [...value] as Rgb }
          : { [key]: value },
      )
    })
    bump(keys.some((key) => LAYOUT_KEYS.has(key)))
  }

  function resetAllToMidpoints() {
    const next: Partial<PhosphorParams> = {}
    groups.forEach((group) => {
      group.sliders.forEach((slider) => {
        next[slider.key] = midpointSliderValue(slider) as never
      })
      group.colors?.forEach((color) => {
        const rgb = defaultPhosphorParams[color.key]
        if (Array.isArray(rgb)) {
          next[color.key] = [...rgb] as Rgb as never
        }
      })
    })
    orderPair(next, "glyphSizeMin", "glyphSizeMax")
    orderPair(next, "poolMin", "poolMax")
    orderPair(next, "topFadeStart", "topFadeEnd")
    orderPair(next, "holdLifeMin", "holdLifeMax")
    orderPair(next, "linkMin", "linkMax")
    orderPair(next, "fieldSpanMinTimes", "fieldSpanMaxTimes")
    orderPair(next, "mixedNodeLifeMin", "mixedNodeLifeMax")
    orderPair(next, "mixedLinkLifeMin", "mixedLinkLifeMax")
    orderPair(next, "mixedBogeyLifeMin", "mixedBogeyLifeMax")
    applyPhosphorParams(next)
    bump(true)
  }

  async function savePreset() {
    setPresetState("saving")
    try {
      const response = await fetch("/__save-preset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ previewBg, params }),
      })
      if (!response.ok) throw new Error(await response.text())
      const result = (await response.json()) as { file: string }
      setPresetFile(result.file)
      setPresetState("saved")
    } catch {
      setPresetState("error")
    }
    window.setTimeout(() => setPresetState("idle"), 2200)
  }

  async function importPreset(file: File) {
    try {
      const parsed = parseImportedPreset(JSON.parse(await file.text()))
      applyPhosphorParams(parsed.params)
      if (parsed.previewBg) updatePreviewBg(parsed.previewBg)
      setImportName(file.name)
      setImportState("loaded")
      bump(true)
    } catch {
      setImportState("error")
    }
    window.setTimeout(() => setImportState("idle"), 2200)
  }

  function randomizeAll() {
    const next: Partial<PhosphorParams> = {}
    groups.forEach((group) => {
      group.sliders.forEach((slider) => {
        next[slider.key] = randomSliderValue(slider) as never
      })
      group.colors?.forEach((color) => {
        next[color.key] = randomRgb()
      })
    })
    orderPair(next, "glyphSizeMin", "glyphSizeMax")
    orderPair(next, "poolMin", "poolMax")
    orderPair(next, "topFadeStart", "topFadeEnd")
    orderPair(next, "holdLifeMin", "holdLifeMax")
    orderPair(next, "linkMin", "linkMax")
    orderPair(next, "fieldSpanMinTimes", "fieldSpanMaxTimes")
    orderPair(next, "mixedNodeLifeMin", "mixedNodeLifeMax")
    orderPair(next, "mixedLinkLifeMin", "mixedLinkLifeMax")
    orderPair(next, "mixedBogeyLifeMin", "mixedBogeyLifeMax")
    applyPhosphorParams(next)
    bump(true)
  }

  return (
    <div className="tuner">
      <aside className="panel">
        <header className="panel-head">
          <h1>Phosphor tuner</h1>
          <div className="toolbar">
          <input
            ref={importRef}
            className="file-hidden"
            type="file"
            accept="application/json,.json"
            aria-label="Import parameters JSON"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              if (file) void importPreset(file)
            }}
          />
          <button
            type="button"
            onClick={() => importRef.current?.click()}
          >
            {importState === "loaded"
              ? importName
              : importState === "error"
                ? "Import failed"
                : "Import"}
          </button>
          <button
            type="button"
            onClick={savePreset}
            disabled={presetState === "saving"}
          >
            {presetState === "saving"
              ? "Saving…"
              : presetState === "saved"
                ? presetFile
                : presetState === "error"
                  ? "Save failed"
                  : "Save"}
          </button>
          <button type="button" onClick={resetAllToMidpoints}>
            Reset all
          </button>
          <button type="button" onClick={randomizeAll}>
            Random
          </button>
          <button type="button" onClick={() => setFieldKey((count) => count + 1)}>
            Rebuild field
          </button>
          </div>
        </header>
        <div className="panel-body">
        <p>
          Live Mixed field preview. Save writes a snapshot into{" "}
          <code>presets/preset_nnn.json</code> in this project. Sliders change
          the running canvas immediately. Pool size and clusters rebuild the
          glyph layout. Rebuild field starts that layout over.
        </p>
        {groups.map((group) => {
          const keys = [
            ...group.sliders.map((slider) => slider.key),
            ...(group.colors?.map((color) => color.key) ?? []),
          ]
          const open = !collapsedGroups.has(group.id)
          return (
            <section
              className={`group${open ? "" : " group-collapsed"}`}
              key={group.id}
            >
              <div className="group-head">
                <button
                  type="button"
                  className="group-toggle"
                  aria-expanded={open}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span className="group-chevron" aria-hidden="true" />
                  {group.label}
                </button>
                <button type="button" onClick={() => resetGroup(keys)}>
                  reset
                </button>
              </div>
              {open ? (
                <div className="group-body">
                  {group.sliders.map((slider) => (
                    <Slider
                      key={slider.key}
                      slider={slider}
                      value={snapshot[slider.key] as number}
                      onChange={(value) =>
                        setNumber(
                          slider.key,
                          value,
                          LAYOUT_KEYS.has(slider.key),
                        )
                      }
                    />
                  ))}
                  {group.colors?.map((color) => (
                    <label className="control" key={color.key}>
                      {color.label}
                      <input
                        type="color"
                        value={rgbToHex(snapshot[color.key])}
                        onChange={(event) =>
                          setColor(color.key, event.target.value)
                        }
                      />
                    </label>
                  ))}
                </div>
              ) : null}
            </section>
          )
        })}
        </div>
      </aside>
      <div className="workspace">
        <div
          className={`preview${isLight(previewBg) ? " preview-light" : ""}`}
          style={{ background: previewBg, ["--preview-bg" as string]: previewBg }}
        >
          <div className="preview-frame">
            <PhosphorField key={fieldKey} pattern={mixedPattern} />
            <header className="preview-header" />
            <label className="preview-bg">
              Background
              <input
                type="color"
                value={previewBg}
                aria-label="Preview background"
                onChange={(event) => updatePreviewBg(event.target.value)}
              />
              <span>{previewBg}</span>
            </label>
          </div>
          <div className="preview-page">
            <div className="preview-copy">
              <p>Interactive preview</p>
              <h1>Phosphor field</h1>
              <p>
                Click and drag in the preview to paint holds. Scroll this
                column to see the field follow with lag while the sticky canvas
                stays in view.
              </p>
              <section className="scroll-block">
                <h2>Scroll stretch</h2>
                <p>
                  Extra height here lets you test scroll lag and parallax over a
                  long page without leaving the tuner.
                </p>
              </section>
              <section className="scroll-block">
                <h2>More copy</h2>
                <p>
                  Placeholder text blocks stand in for real page content. Adjust
                  sliders on the left and watch the mesh respond in real time.
                </p>
              </section>
              <section className="scroll-block">
                <h2>Lower section</h2>
                <p>
                  Keep scrolling to exercise the tall field span and how glyphs
                  wrap across the viewport height.
                </p>
              </section>
              <section className="scroll-block">
                <h2>Near the footer</h2>
                <p>
                  Scroll to the bottom to check how the preview chrome meets the
                  footer band.
                </p>
              </section>
            </div>
            <footer className="preview-footer" />
          </div>
        </div>
      </div>
    </div>
  )
}

function isLight(hex: string) {
  const [r, g, b] = hexToRgb(hex)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.62
}

function Slider({
  slider,
  value,
  onChange,
}: {
  slider: SliderSpec
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="control">
      {slider.label}
      <input
        type="range"
        min={slider.min}
        max={slider.max}
        step={slider.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="value">
        {formatNumber(slider.min)} – {formatNumber(value)} – {formatNumber(slider.max)}
      </span>
    </label>
  )
}
