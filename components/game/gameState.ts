import type { AchievementId, GameScreen } from "@/lib/game/types"
import { resetInput } from "./input"

export interface SessionSnapshot {
  screen: GameScreen
  score: number
  gameTimeMs: number
  hasShield: boolean
  /** Remaining impulso time in ms (0 = inactive). */
  boostRemainingMs: number
  launched: boolean
  achievements: AchievementId[]
  collectedMate: boolean
  usedShield: boolean
  usedBoost: boolean
  paused: boolean
}

const initialSnapshot: SessionSnapshot = {
  screen: "home",
  score: 0,
  gameTimeMs: 0,
  hasShield: false,
  boostRemainingMs: 0,
  launched: false,
  achievements: [],
  collectedMate: false,
  usedShield: false,
  usedBoost: false,
  paused: false,
}

let snapshot: SessionSnapshot = initialSnapshot

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
