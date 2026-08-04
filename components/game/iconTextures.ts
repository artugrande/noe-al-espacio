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

/** Clear icon-style mate (calabaza + bombilla) on transparent bg. */
export function createMateTexture() {
  const { canvas, ctx, size } = makeCanvas()
  ctx.clearRect(0, 0, size, size)

  // soft badge
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, 110, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(15, 23, 42, 0.35)"
  ctx.fill()

  // calabaza body
  const gx = size / 2
  const gy = size / 2 + 18
  const grad = ctx.createRadialGradient(gx - 20, gy - 30, 10, gx, gy, 78)
  grad.addColorStop(0, "#4ade80")
  grad.addColorStop(0.55, "#16a34a")
  grad.addColorStop(1, "#14532d")
  ctx.beginPath()
  ctx.ellipse(gx, gy, 70, 78, 0, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.strokeStyle = "#052e16"
  ctx.lineWidth = 5
  ctx.stroke()

  // mouth ring
  ctx.beginPath()
  ctx.ellipse(gx, gy - 55, 28, 14, 0, 0, Math.PI * 2)
  ctx.fillStyle = "#166534"
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(gx, gy - 55, 18, 9, 0, 0, Math.PI * 2)
  ctx.fillStyle = "#fef3c7"
  ctx.fill()

  // bombilla
  ctx.save()
  ctx.translate(gx + 22, gy - 70)
  ctx.rotate(-0.55)
  ctx.fillStyle = "#e5e7eb"
  ctx.fillRect(-4, 0, 8, 95)
  ctx.beginPath()
  ctx.arc(0, 0, 10, 0, Math.PI * 2)
  ctx.fillStyle = "#f8fafc"
  ctx.fill()
  ctx.strokeStyle = "#64748b"
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // label hint
  ctx.fillStyle = "#f8fafc"
  ctx.font = "bold 28px system-ui, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("MATE", size / 2, size - 28)

  return toTexture(canvas)
}

/** Clear icon-style medialuna / croissant. */
export function createMedialunaTexture() {
  const { canvas, ctx, size } = makeCanvas()
  ctx.clearRect(0, 0, size, size)

  ctx.beginPath()
  ctx.arc(size / 2, size / 2, 110, 0, Math.PI * 2)
  ctx.fillStyle = "rgba(15, 23, 42, 0.35)"
  ctx.fill()

  const cx = size / 2
  const cy = size / 2 + 6

  // outer crescent
  ctx.beginPath()
  ctx.arc(cx, cy, 78, 0.35, Math.PI - 0.35)
  ctx.arc(cx, cy + 18, 52, Math.PI - 0.45, 0.45, true)
  ctx.closePath()
  const dough = ctx.createLinearGradient(cx - 80, cy, cx + 80, cy)
  dough.addColorStop(0, "#f59e0b")
  dough.addColorStop(0.45, "#fde68a")
  dough.addColorStop(1, "#d97706")
  ctx.fillStyle = dough
  ctx.fill()
  ctx.strokeStyle = "#92400e"
  ctx.lineWidth = 5
  ctx.stroke()

  // layers / flakes
  ctx.strokeStyle = "rgba(146, 64, 14, 0.45)"
  ctx.lineWidth = 3
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath()
    ctx.arc(cx, cy + 8 + i * 4, 62 - i * 7, 0.55, Math.PI - 0.55)
    ctx.stroke()
  }

  // tips darker
  ctx.fillStyle = "#b45309"
  ctx.beginPath()
  ctx.ellipse(cx - 68, cy + 10, 14, 18, -0.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + 68, cy + 10, 14, 18, 0.6, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#f8fafc"
  ctx.font = "bold 22px system-ui, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("MEDIALUNA", size / 2, size - 26)

  return toTexture(canvas)
}

let mateTexture: CanvasTexture | null = null
let medialunaTexture: CanvasTexture | null = null

export function getMateTexture() {
  if (typeof document === "undefined") return null
  mateTexture ??= createMateTexture()
  return mateTexture
}

export function getMedialunaTexture() {
  if (typeof document === "undefined") return null
  medialunaTexture ??= createMedialunaTexture()
  return medialunaTexture
}
