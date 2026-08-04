import { beforeEach, describe, expect, it } from "vitest"
import { input, resetInput } from "../../components/game/input"

describe("resetInput", () => {
  beforeEach(() => {
    resetInput()
  })

  it("clears movement and queued launch state", () => {
    input.setLeft(true)
    input.setRight(false)
    input.pressLaunch()

    resetInput()

    expect(input.axisX()).toBe(0)
    expect(input.consumeLaunch()).toBe(false)
  })
})
