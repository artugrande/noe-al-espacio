/** Combo multiplier: 1 → 1.25 → … capped. */
export function comboMultiplier(comboCount: number): number {
  if (comboCount <= 0) return 1
  return Math.min(4, 1 + (comboCount - 1) * 0.25)
}

export function scoreWithCombo(base: number, comboCount: number): number {
  return Math.round(base * comboMultiplier(comboCount))
}
