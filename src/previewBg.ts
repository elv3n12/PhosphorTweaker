export const DEFAULT_PREVIEW_BG = "#1a1a17"

const STORAGE_KEY = "phosphor-tuner-preview-bg"

export function isPreviewBg(hex: string) {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

export function readStoredPreviewBg() {
  if (typeof sessionStorage === "undefined") return DEFAULT_PREVIEW_BG
  const value = sessionStorage.getItem(STORAGE_KEY)
  return value && isPreviewBg(value) ? value : DEFAULT_PREVIEW_BG
}

export function storePreviewBg(hex: string) {
  if (!isPreviewBg(hex) || typeof sessionStorage === "undefined") return
  sessionStorage.setItem(STORAGE_KEY, hex)
}
