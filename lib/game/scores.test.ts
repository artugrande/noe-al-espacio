import { beforeEach, describe, expect, it, vi } from "vitest"
import { HIGH_SCORES_KEY } from "./constants"
import { loadHighScores, submitScore } from "./scores"

describe("scores", () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    })
  })
  it("starts empty", () => {
    expect(loadHighScores()).toEqual([])
  })
  it("keeps top 5 descending", () => {
    for (const s of [10, 50, 20, 40, 30, 60]) submitScore(s)
    const scores = loadHighScores().map((e) => e.score)
    expect(scores).toEqual([60, 50, 40, 30, 20])
    expect(localStorage.getItem(HIGH_SCORES_KEY)).toBeTruthy()
  })
})
