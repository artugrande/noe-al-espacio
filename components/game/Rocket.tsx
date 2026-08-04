"use client"

import { useFrame } from "@react-three/fiber"
import { useRef, useSyncExternalStore } from "react"
import type { Group } from "three"
import { getSnapshot, subscribe } from "./gameState"
import { clampX, input } from "./input"
import { playerPos } from "./playerRef"

const MOVE_SPEED = 6

const steel = {
  color: "#c4cdd5",
  metalness: 0.85,
  roughness: 0.28,
  flatShading: true as const,
}

const flap = {
  color: "#3f3f46",
  metalness: 0.4,
  roughness: 0.55,
  flatShading: true as const,
}

/** GOLDEN RULE: player position updates here — never via useState each frame. */
export function Rocket({ launched }: { launched: boolean }) {
  const ref = useRef<Group>(null)
  const hasShield = useSyncExternalStore(
    subscribe,
    () => getSnapshot().hasShield,
    () => false,
  )

  useFrame((_, dt) => {
    const rocket = ref.current
    if (!rocket) return
    if (launched) {
      rocket.position.x = clampX(
        rocket.position.x + input.axisX() * MOVE_SPEED * dt,
      )
      rocket.rotation.z = -input.axisX() * 0.14
    } else {
      rocket.rotation.z = 0
    }
    playerPos.x = rocket.position.x
    playerPos.y = rocket.position.y
    playerPos.z = rocket.position.z
  })

  return (
    <group ref={ref} position={[0, -1.5, 0]}>
      {/* Nose */}
      <mesh position={[0, 0.72, 0]}>
        <coneGeometry args={[0.28, 0.55, 10]} />
        <meshStandardMaterial {...steel} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 1.15, 12]} />
        <meshStandardMaterial {...steel} />
      </mesh>
      {/* Heat-shield band */}
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.31, 0.32, 0.18, 12]} />
        <meshStandardMaterial
          color="#71717a"
          metalness={0.5}
          roughness={0.45}
          flatShading
        />
      </mesh>
      {/* Upper flaps */}
      <mesh position={[-0.38, 0.55, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.08, 0.42, 0.28]} />
        <meshStandardMaterial {...flap} />
      </mesh>
      <mesh position={[0.38, 0.55, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.08, 0.42, 0.28]} />
        <meshStandardMaterial {...flap} />
      </mesh>
      {/* Lower flaps */}
      <mesh position={[-0.42, -0.35, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.1, 0.55, 0.36]} />
        <meshStandardMaterial {...flap} />
      </mesh>
      <mesh position={[0.42, -0.35, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.1, 0.55, 0.36]} />
        <meshStandardMaterial {...flap} />
      </mesh>
      {/* Engine bells */}
      <mesh position={[-0.12, -0.72, 0.08]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.22, 8]} />
        <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.12, -0.72, 0.08]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.22, 8]} />
        <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.72, -0.1]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.22, 8]} />
        <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.35} />
      </mesh>

      {hasShield ? (
        <group>
          <mesh>
            <sphereGeometry args={[0.95, 16, 12]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.25}
              transparent
              opacity={0.16}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.88, 0.035, 8, 28]} />
            <meshStandardMaterial
              color="#bae6fd"
              emissive="#0ea5e9"
              emissiveIntensity={0.9}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}
