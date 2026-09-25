import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import {
  defaultPhosphorParams,
  type PhosphorParams,
  type Rgb,
} from "./src/phosphor/params"

const root = path.dirname(fileURLToPath(import.meta.url))
const presetsDir = path.resolve(root, "presets")

function readBody(req: { on: (event: string, fn: (chunk?: Buffer) => void) => void }) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk) => chunks.push(chunk as Buffer))
    req.on("end", () => resolve(Buffer.concat(chunks).toString()))
    req.on("error", reject)
  })
}

function isRgb(value: unknown): value is Rgb {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255)
  )
}

function sanitizeParams(body: unknown): PhosphorParams {
  if (!body || typeof body !== "object") throw new Error("bad body")
  const source = body as Record<string, unknown>
  const keys = Object.keys(defaultPhosphorParams) as (keyof PhosphorParams)[]
  const next = {} as PhosphorParams
  keys.forEach((key) => {
    const value = source[key]
    const fallback = defaultPhosphorParams[key]
    if (Array.isArray(fallback)) {
      if (!isRgb(value)) throw new Error(`bad color ${key}`)
      next[key] = [value[0], value[1], value[2]] as never
      return
    }
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(`bad number ${key}`)
    }
    next[key] = value as never
  })
  return next
}

function nextPresetName() {
  fs.mkdirSync(presetsDir, { recursive: true })
  let max = 0
  fs.readdirSync(presetsDir).forEach((file) => {
    const match = /^preset_(\d+)\.json$/.exec(file)
    if (!match) return
    max = Math.max(max, Number(match[1]))
  })
  return `preset_${String(max + 1).padStart(3, "0")}.json`
}

function savePresetPlugin(): Plugin {
  return {
    name: "save-phosphor-preset",
    configureServer(server) {
      server.middlewares.use("/__save-preset", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405
          res.end("POST only")
          return
        }
        void readBody(req)
          .then((raw) => {
            const payload = JSON.parse(raw) as {
              params?: unknown
              previewBg?: unknown
            }
            const values = sanitizeParams(payload.params ?? payload)
            const previewBg =
              typeof payload.previewBg === "string" && /^#[0-9a-fA-F]{6}$/.test(payload.previewBg)
                ? payload.previewBg
                : "#1a1a17"
            const file = nextPresetName()
            fs.writeFileSync(
              path.join(presetsDir, file),
              `${JSON.stringify({ previewBg, params: values }, null, 2)}\n`,
            )
            res.setHeader("content-type", "application/json")
            res.end(JSON.stringify({ file }))
          })
          .catch((error) => {
            res.statusCode = 400
            res.end(error instanceof Error ? error.message : "save failed")
          })
      })
    },
  }
}

export default defineConfig({
  root,
  plugins: [react(), savePresetPlugin()],
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [root],
    },
  },
})
