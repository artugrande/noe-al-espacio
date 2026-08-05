import type { AchievementId } from "./types"

export interface Curiosity {
  title: string
  body: string
}

export const CURIOSIDADES: Curiosity[] = [
  {
    title: "Falcon 9",
    body: "El Falcon 9 de SpaceX puede aterrizar y reutilizarse, bajando el costo de llegar al espacio.",
  },
  {
    title: "Basura espacial",
    body: "Hay miles de fragmentos orbitando la Tierra; por eso esquivar basura en el juego no es solo ficción.",
  },
  {
    title: "¿Quién es Noe Castro?",
    body: "Noel de Castro, ingeniera de Salta, fue seleccionada por Axiom Space como astronauta argentina.",
  },
]

export function pickCuriosity(seed: number): Curiosity {
  const i = Math.abs(Math.floor(seed)) % CURIOSIDADES.length
  return CURIOSIDADES[i]
}

export function checkAchievements(input: {
  collectedMate: boolean
  gameTimeMs: number
  usedShield: boolean
  usedBoost?: boolean
}): AchievementId[] {
  const out: AchievementId[] = []
  if (input.collectedMate) out.push("first_mate")
  if (input.gameTimeMs >= 90_000) out.push("survived_90s")
  if (input.usedShield) out.push("first_shield")
  if (input.usedBoost) out.push("first_boost")
  return out
}
