"use client"

import { useFrame } from "@react-three/fiber"
import { useRef, useSyncExternalStore } from "react"
import type { Group } from "three"
import { getSnapshot, subscribe } from "./gameState"
import { clampX, input } from "./input"
import { playerPos } from "./playerRef"

const MOVE_SPEED = 6 // world units / second

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
      rocket.rotation.z = -input.axisX() * 0.16
    } else {
      rocket.rotation.z = 0
    }
    playerPos.x = rocket.position.x
    playerPos.y = rocket.position.y
    playerPos.z = rocket.position.z
  })

  return (
    <group ref={ref} position={[0, -1.5, 0]}>
      <mesh>
        <coneGeometry args={[0.38, 1.3, 8]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#0891b2"
          emissiveIntensity={0.8}
          flatShading
        />
      </mesh>
      <mesh position={[-0.34, -0.32, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.16, 0.48, 0.1]} />
        <meshStandardMaterial color="#f97316" flatShading />
      </mesh>
      <mesh position={[0.34, -0.32, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.16, 0.48, 0.1]} />
        <meshStandardMaterial color="#f97316" flatShading />
      </mesh>
      <mesh position={[0, -0.32, -0.3]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.1, 0.48, 0.16]} />
        <meshStandardMaterial color="#fb923c" flatShading />
      </mesh>
      {hasShield ? (
        <group>
          <mesh>
            <sphereGeometry args={[0.85, 16, 12]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.25}
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.78, 0.04, 8, 24]} />
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
