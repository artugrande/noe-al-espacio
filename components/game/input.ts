import { PLAY_X_MAX, PLAY_X_MIN } from "@/lib/game/constants"
import { unlock } from "@/lib/game/audio"

let left = false
let right = false
let launchPressed = false

export function resetInput() {
  left = false
  right = false
  launchPressed = false
}

export const input = {
  setLeft(v: boolean) {
    left = v
  },
  setRight(v: boolean) {
    right = v
  },
  consumeLaunch() {
    const v = launchPressed
    launchPressed = false
    return v
  },
  pressLaunch() {
    launchPressed = true
  },
  axisX() {
    return (right ? 1 : 0) - (left ? 1 : 0)
  },
}

export function bindKeyboard() {
  const down = (e: KeyboardEvent) => {
    void unlock()
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.setLeft(true)
    if (e.code === "ArrowRight" || e.code === "KeyD") input.setRight(true)
    if (e.code === "Space") input.pressLaunch()
  }
  const up = (e: KeyboardEvent) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.setLeft(false)
    if (e.code === "ArrowRight" || e.code === "KeyD") input.setRight(false)
  }
  window.addEventListener("keydown", down)
  window.addEventListener("keyup", up)
  return () => {
    window.removeEventListener("keydown", down)
    window.removeEventListener("keyup", up)
  }
}

export function clampX(x: number) {
  // Small inset so the ship nose doesn't clip the frame edge
  const pad = 0.15
  return Math.min(PLAY_X_MAX - pad, Math.max(PLAY_X_MIN + pad, x))
}
