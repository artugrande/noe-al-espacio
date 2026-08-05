import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  getSnapshot,
  patchSnapshot,
  resetSession,
  startPlaying,
  subscribe,
} from "../../components/game/gameState"
import { input, resetInput } from "../../components/game/input"
import { OBJECTIVE_MATES } from "./constants"

describe("game session state", () => {
  beforeEach(() => {
    resetInput()
    resetSession()
  })

  it("starts a clean, unlaunched playing session", () => {
    patchSnapshot({
      score: 40,
      gameTimeMs: 50_000,
      hasShield: true,
      launched: true,
      collectedMate: true,
      usedShield: true,
    })

    startPlaying()

    expect(getSnapshot()).toEqual({
      screen: "playing",
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
    })
  })

  it("notifies subscribers when the snapshot changes", () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    patchSnapshot({ score: 10 })
    unsubscribe()
    patchSnapshot({ score: 20 })

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it.each([
    ["resetSession", resetSession],
    ["startPlaying", startPlaying],
  ])("%s clears held and queued input", (_, transition) => {
    input.setRight(true)
    input.pressLaunch()

    transition()

    expect(input.axisX()).toBe(0)
    expect(input.consumeLaunch()).toBe(false)
  })
})
