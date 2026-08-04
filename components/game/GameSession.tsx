"use client"

import { useEffect } from "react"
import { GameCanvas } from "./GameCanvas"
import { bindKeyboard } from "./input"

export function GameSession() {
  useEffect(() => bindKeyboard(), [])

  return <GameCanvas />
}
