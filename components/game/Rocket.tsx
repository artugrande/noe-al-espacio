"use client"

import { useFrame } from "@react-three/fiber"
import { useRef, useSyncExternalStore } from "react"
import type { Group } from "three"
import { getSnapshot, subscribe } from "./gameState"
import { clampX, input } from "./input"
import { playerPos } from "./playerRef"

const MOVE_SPEED = 7.2

/** Compact classic white rocket — readable silhouette, no Starship mimic. */
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
    <group ref={ref} position={[0, -1.55, 0]} scale={0.72}>
      <pointLight position={[0.8, 0.5, 1.4]} intensity={0.9} distance={5} color="#ffffff" />

      {/* Nose cone */}
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.28, 0.55, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.15} flatShading />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 1.1, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.1} flatShading />
      </mesh>

      {/* Stripe */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.305, 0.305, 0.12, 12]} />
        <meshStandardMaterial color="#ef4444" roughness={0.45} metalness={0.05} flatShading />
      </mesh>

      {/* Window */}
      <mesh position={[0, 0.45, 0.27]}>
        <circleGeometry args={[0.09, 12]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Fins — classic rocket tri-fin */}
      <mesh position={[-0.32, -0.35, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.08, 0.45, 0.22]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.1} flatShading />
      </mesh>
      <mesh position={[0.32, -0.35, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.45, 0.22]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.1} flatShading />
      </mesh>
      <mesh position={[0, -0.35, -0.3]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.22, 0.45, 0.08]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} metalness={0.1} flatShading />
      </mesh>

      {/* Red fin tips */}
      <mesh position={[-0.38, -0.52, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.07, 0.14, 0.18]} />
        <meshStandardMaterial color="#dc2626" roughness={0.45} flatShading />
      </mesh>
      <mesh position={[0.38, -0.52, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.07, 0.14, 0.18]} />
        <meshStandardMaterial color="#dc2626" roughness={0.45} flatShading />
      </mesh>

      {/* Engine nozzle */}
      <mesh position={[0, -0.55, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.18, 0.28, 10]} />
        <meshStandardMaterial
          color="#64748b"
          metalness={0.6}
          roughness={0.35}
          emissive="#ea580c"
          emissiveIntensity={launched ? 0.65 : 0.08}
        />
      </mesh>

      {hasShield ? (
        <group>
          <mesh>
            <sphereGeometry args={[0.75, 16, 12]} />
            <meshStandardMaterial
              color="#7dd3fc"
              emissive="#38bdf8"
              emissiveIntensity={0.3}
              transparent
              opacity={0.2}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.7, 0.035, 8, 28]} />
            <meshStandardMaterial
              color="#f0f9ff"
              emissive="#38bdf8"
              emissiveIntensity={0.9}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}
