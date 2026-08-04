"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Mesh } from "three"
import { clampX, input } from "./input"
import { playerPos } from "./playerRef"

const MOVE_SPEED = 6 // world units / second

/** GOLDEN RULE: player position updates here — never via useState each frame. */
export function Rocket({ launched }: { launched: boolean }) {
  const ref = useRef<Mesh>(null)

  useFrame((_, dt) => {
    const mesh = ref.current
    if (!mesh) return
    if (launched) {
      mesh.position.x = clampX(mesh.position.x + input.axisX() * MOVE_SPEED * dt)
    }
    playerPos.x = mesh.position.x
    playerPos.y = mesh.position.y
    playerPos.z = mesh.position.z
  })

  return (
    <mesh ref={ref} position={[0, -1.5, 0]}>
      <coneGeometry args={[0.35, 1.2, 8]} />
      <meshStandardMaterial color="#38bdf8" />
    </mesh>
  )
}
