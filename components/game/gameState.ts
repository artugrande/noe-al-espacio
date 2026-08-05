import type { AchievementId, GameScreen } from "@/lib/game/types"
import { OBJECTIVE_MATES } from "@/lib/game/constants"
import { resetInput } from "./input"

export interface FloatToast {
  id: number
  message: string
}

export interface SessionSnapshot {
  screen: GameScreen
  score: number
  gameTimeMs: number
  hasShield: boolean
  /** Remaining impulso time in ms (0 = inactive). */
  boostRemainingMs: number
  /** Remaining turbulence time in ms. */
  turbulenceMs: number
  comboCount: number
  comboMult: number
  matesCollected: number
  objectiveTarget: number
  objectiveDone: boolean
  /** Short popup (near-miss, etc). */
  toast: FloatToast | null
  launched: boolean
  achievements: AchievementId[]
  collectedMate: boolean
  usedShield: boolean
  usedBoost: boolean
  reachedCombo4: boolean
  paused: boolean
}

const initialSnapshot: SessionSnapshot = {
  screen: "home",
  score: 0,
  gameTimeMs: 0,
  hasShield: false,
  boostRemainingMs: 0,
  turbulenceMs: 0,
  comboCount: 0,
  comboMult: 1,
  matesCollected: 0,
  objectiveTarget: OBJECTIVE_MATES,
  objectiveDone: false,
  toast: null,
  launched: false,
  achievements: [],
  collectedMate: false,
  usedShield: false,
  usedBoost: false,
  reachedCombo4: false,
  paused: false,
}

let snapshot: SessionSnapshot = initialSnapshot
let toastSeq = 0

/** High-frequency clock for atmosphere / VFX (not React state). */
export const playClock = { elapsedMs: 0 }

const listeners = new Set<() => void>()

export function getSnapshot() {
  return snapshot
}

export function patchSnapshot(patch: Partial<SessionSnapshot>) {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((listener) => listener())
}

/** Show a short HUD popup (near-miss, etc). */
export function showToast(message: string) {
  toastSeq += 1
  patchSnapshot({ toast: { id: toastSeq, message } })
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function resetSession() {
  resetInput()
  playClock.elapsedMs = 0
  patchSnapshot({ ...initialSnapshot, achievements: [] })
}

export function startPlaying() {
  resetInput()
  playClock.elapsedMs = 0
  patchSnapshot({
    ...initialSnapshot,
    screen: "playing",
    achievements: [],
  })
}
