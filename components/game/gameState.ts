import type { AchievementId, GameScreen } from "@/lib/game/types"
import { resetInput } from "./input"

export interface SessionSnapshot {
  screen: GameScreen
  score: number
  gameTimeMs: number
  hasShield: boolean
  launched: boolean
  achievements: AchievementId[]
  collectedMate: boolean
  usedShield: boolean
  paused: boolean
}

const initialSnapshot: SessionSnapshot = {
  screen: "home",
  score: 0,
  gameTimeMs: 0,
  hasShield: false,
  launched: false,
  achievements: [],
  collectedMate: false,
  usedShield: false,
  paused: false,
}

let snapshot: SessionSnapshot = initialSnapshot

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
  patchSnapshot({ ...initialSnapshot, achievements: [] })
}

export function startPlaying() {
  resetInput()
  patchSnapshot({
    ...initialSnapshot,
    screen: "playing",
    achievements: [],
  })
}
