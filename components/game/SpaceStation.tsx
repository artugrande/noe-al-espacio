"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Group, MeshStandardMaterial } from "three"
import { GAME_DURATION_MS } from "@/lib/game/constants"
import { getSnapshot, playClock } from "./gameState"

const BODY = "#e8e4dc"
const TRIM = "#3f3f46"
const SOLAR = "#1c1c22"
const GRID = "#9ca3af"

function SolarPanel({
  position,
}: {
  position: [number, number, number]
}) {
  const lines = []
  for (let i = 1; i < 4; i += 1) {
    lines.push(
      <mesh key={`v-${i}`} position={[-0.24 + i * 0.16, 0, 0.02]}>
        <boxGeometry args={[0.012, 0.72, 0.01]} />
        <meshStandardMaterial color={GRID} roughness={0.6} metalness={0.2} />
      </mesh>,
    )
  }
  for (let j = 1; j < 6; j += 1) {
    lines.push(
      <mesh key={`h-${j}`} position={[0, -0.3 + j * 0.12, 0.02]}>
        <boxGeometry args={[0.52, 0.012, 0.01]} />
        <meshStandardMaterial color={GRID} roughness={0.6} metalness={0.2} />
      </mesh>,
    )
  }

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.56, 0.78, 0.04]} />
        <meshStandardMaterial color={SOLAR} roughness={0.45} metalness={0.35} flatShading />
      </mesh>
      {lines}
    </group>
  )
}

/** Low-poly ISS inspired by the game's estacionespacial sprite. */
export function SpaceStation() {
  const ref = useRef<Group>(null)

  useFrame((state, dt) => {
    const { screen, launched } = getSnapshot()
    const group = ref.current
    if (!group) return

    const appearStart = GAME_DURATION_MS - 25_000
    const gameTimeMs = playClock.elapsedMs
    let opacity = 0
    if (screen === "playing" && launched && gameTimeMs >= appearStart) {
      opacity = Math.min(1, (gameTimeMs - appearStart) / 12_000)
    }
    if (screen === "win") opacity = 1

    group.visible = opacity > 0.02
    group.position.x = 0

    const approach = screen === "win" ? 1 : opacity
    const targetY = screen === "win" ? 1.35 : 2.35 - approach * 0.35
    const targetZ = screen === "win" ? -2.4 : -5.5
    const baseScale = screen === "win" ? 2.6 : 1.35 + approach * 0.55
    const breathe =
      approach > 0.35 ? 1 + Math.sin(state.clock.elapsedTime * 0.85) * 0.035 : 1
    const targetScale = baseScale * breathe

    group.position.y += (targetY - group.position.y) * Math.min(1, dt * 2.2)
    group.position.z += (targetZ - group.position.z) * Math.min(1, dt * 2.2)
    const currentScale = group.scale.x
    group.scale.setScalar(
      currentScale + (targetScale - currentScale) * Math.min(1, dt * 1.8),
    )

    if (opacity > 0.02) {
      group.rotation.y += dt * 0.12
      group.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.04
    }

    group.traverse((obj) => {
      const mesh = obj as {
        isMesh?: boolean
        material?: MeshStandardMaterial | MeshStandardMaterial[]
      }
      if (!mesh.isMesh || !mesh.material) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of mats) {
        mat.transparent = true
        mat.opacity = opacity
        mat.depthWrite = opacity > 0.55
      }
    })
  })

  return (
    <group ref={ref} position={[0, 2.35, -5.5]} scale={1.35} visible={false}>
      {/* Central hub */}
      <mesh>
        <sphereGeometry args={[0.32, 16, 12]} />
        <meshStandardMaterial color={BODY} roughness={0.45} metalness={0.15} flatShading />
      </mesh>

      {/* Upper stack */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.15, 0.16, 0.95, 12]} />
        <meshStandardMaterial color={BODY} roughness={0.45} metalness={0.12} flatShading />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.165, 0.02, 6, 16]} />
        <meshStandardMaterial color={TRIM} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <torusGeometry args={[0.165, 0.02, 6, 16]} />
        <meshStandardMaterial color={TRIM} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.28, 0]}>
        <sphereGeometry args={[0.17, 12, 10]} />
        <meshStandardMaterial color={TRIM} roughness={0.4} metalness={0.35} flatShading />
      </mesh>
      <mesh position={[0, 1.52, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.28, 6]} />
        <meshStandardMaterial color={TRIM} metalness={0.5} roughness={0.35} />
      </mesh>

      {/* Lower stack + docking port */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.55, 12]} />
        <meshStandardMaterial color={BODY} roughness={0.45} metalness={0.12} flatShading />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color={TRIM} roughness={0.4} metalness={0.35} flatShading />
      </mesh>
      <mesh position={[0, -1.12, 0]}>
        <boxGeometry args={[0.14, 0.12, 0.14]} />
        <meshStandardMaterial color={TRIM} roughness={0.45} metalness={0.4} flatShading />
      </mesh>

      {/* Horizontal arms */}
      <mesh position={[-0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.55, 12]} />
        <meshStandardMaterial color={BODY} roughness={0.45} metalness={0.12} flatShading />
      </mesh>
      <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.55, 12]} />
        <meshStandardMaterial color={BODY} roughness={0.45} metalness={0.12} flatShading />
      </mesh>

      {/* Solar mount blocks */}
      <mesh position={[-0.95, 0, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color={TRIM} roughness={0.45} metalness={0.4} flatShading />
      </mesh>
      <mesh position={[0.95, 0, 0]}>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color={TRIM} roughness={0.45} metalness={0.4} flatShading />
      </mesh>

      {/* Four solar panels */}
      <SolarPanel position={[-1.45, 0.42, 0]} />
      <SolarPanel position={[-1.45, -0.42, 0]} />
      <SolarPanel position={[1.45, 0.42, 0]} />
      <SolarPanel position={[1.45, -0.42, 0]} />

      {/* Soft station light */}
      <pointLight position={[0, 0.2, 0.8]} intensity={0.55} distance={4} color="#e0f2fe" />
    </group>
  )
}
