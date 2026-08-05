import { CanvasTexture, LinearFilter, SRGBColorSpace } from "three"

function makeCanvas(size = 256) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("2d context unavailable")
  return { canvas, ctx, size }
}

function toTexture(canvas: HTMLCanvasElement) {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

/** Big emoji glyph centered — reads instantly as the item. */
function createEmojiTexture(emoji: string) {
  const { canvas, ctx, size } = makeCanvas(256)
  ctx.clearRect(0, 0, size, size)
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  // Slight shadow so it pops on bright/dark sky
  ctx.font = "180px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"
  ctx.fillText(emoji, size / 2 + 2, size / 2 + 8)
  ctx.fillText(emoji, size / 2, size / 2 + 6)
  return toTexture(canvas)
}

let mateTexture: CanvasTexture | null = null
let medialunaTexture: CanvasTexture | null = null
let magnetTexture: CanvasTexture | null = null

export function getMateTexture() {
  if (typeof document === "undefined") return null
  mateTexture ??= createEmojiTexture("🧉")
  return mateTexture
}

export function getMedialunaTexture() {
  if (typeof document === "undefined") return null
  medialunaTexture ??= createEmojiTexture("🥐")
  return medialunaTexture
}

export function getMagnetTexture() {
  if (typeof document === "undefined") return null
  magnetTexture ??= createEmojiTexture("🧲")
  return magnetTexture
}
