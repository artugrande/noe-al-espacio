import { describe, expect, it } from "vitest"
import { sanitizePlayerName, sanitizeScore } from "./scoreValidation"

describe("sanitizePlayerName", () => {
  it("accepts simple names", () => {
    expect(sanitizePlayerName("  Artu  ")).toBe("Artu")
    expect(sanitizePlayerName("Noe_De-Castro")).toBe("Noe_De-Castro")
  })

  it("rejects empty or too long", () => {
    expect(sanitizePlayerName("")).toBeNull()
    expect(sanitizePlayerName("x".repeat(17))).toBeNull()
  })

  it("rejects weird symbols", () => {
    expect(sanitizePlayerName("hola<script>")).toBeNull()
  })
})

describe("sanitizeScore", () => {
  it("floors valid scores", () => {
    expect(sanitizeScore(12.9)).toBe(12)
  })

  it("rejects invalid scores", () => {
    expect(sanitizeScore(-1)).toBeNull()
    expect(sanitizeScore(Number.NaN)).toBeNull()
    expect(sanitizeScore(2_000_000)).toBeNull()
  })
})
