"use client"

import { useFrame } from "@react-three/fiber"
import { useRef, useSyncExternalStore } from "react"
import type { Group } from "three"
import { getSnapshot, subscribe } from "./gameState"
import { clampX, input } from "./input"
import { playerPos } from "./playerRef"

const MOVE_SPEED = 7.2

/**
 * Starship-inspired low-poly: tall stainless stack, small forward flaps,
 * large aft flaps, chrome read against black space.
 */
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
      rocket.rotation.z = -input.axisX() * 0.1
    } else {
      rocket.rotation.z = 0
    }
    playerPos.x = rocket.position.x
    playerPos.y = rocket.position.y
    playerPos.z = rocket.position.z
  })

  const chrome = {
    color: "#f8fafc",
    metalness: 0.95,
    roughness: 0.12,
    flatShading: true as const,
  }

  return (
    <group ref={ref} position={[0, -1.2, 0]} scale={1.05}>
      <pointLight position={[1.2, 0.8, 2]} intensity={1.5} distance={8} color="#ffffff" />
      <pointLight position={[-1, 0.3, 1.5]} intensity={0.6} distance={5} color="#e2e8f0" />
      <pointLight position={[0, 2.2, 2.5]} intensity={0.9} distance={7} color="#fff7ed" />

      {/* Nose — rounded cone like the photo */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.36, 0.38, 0.45, 16]} />
        <meshStandardMaterial {...chrome} />
      </mesh>

      {/* Tall body */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.38, 0.4, 1.85, 18]} />
        <meshStandardMaterial {...chrome} />
      </mesh>

      {/* Panel seam rings (stainless plates read) */}
      {[-0.7, -0.35, 0, 0.35, 0.7].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.405, 0.405, 0.025, 18]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.9}
            roughness={0.22}
          />
        </mesh>
      ))}

      {/* Forward flaps — small, silver (like photo) */}
      <mesh position={[-0.42, 1.05, 0]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.06, 0.32, 0.28]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0.42, 1.05, 0]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.06, 0.32, 0.28]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      {/* Triangular tip on forward flaps */}
      <mesh position={[-0.52, 1.18, 0]} rotation={[0, 0, 0.9]}>
        <coneGeometry args={[0.12, 0.22, 3]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0.52, 1.18, 0]} rotation={[0, 0, -0.9]}>
        <coneGeometry args={[0.12, 0.22, 3]} />
        <meshStandardMaterial {...chrome} />
      </mesh>

      {/* Aft flaps — large trapezoid read via tapered boxes */}
      <mesh position={[-0.58, -0.55, 0]} rotation={[0, 0, 0.12]} scale={[1, 1, 1.15]}>
        <boxGeometry args={[0.12, 0.95, 0.55]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0.58, -0.55, 0]} rotation={[0, 0, -0.12]} scale={[1, 1, 1.15]}>
        <boxGeometry args={[0.12, 0.95, 0.55]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      {/* Flare out at bottom of aft flaps */}
      <mesh position={[-0.72, -0.95, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.1, 0.35, 0.62]} />
        <meshStandardMaterial {...chrome} />
      </mesh>
      <mesh position={[0.72, -0.95, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.1, 0.35, 0.62]} />
        <meshStandardMaterial {...chrome} />
      </mesh>

      {/* Skirt / engine section */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.4, 0.46, 0.28, 16]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.88}
          roughness={0.2}
          flatShading
        />
      </mesh>

      {/* Dark engine alcoves (small accents only) */}
      <mesh position={[-0.14, -1.28, 0.12]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.18, 10]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.7}
          roughness={0.35}
          emissive="#9a3412"
          emissiveIntensity={launched ? 0.7 : 0.08}
        />
      </mesh>
      <mesh position={[0.14, -1.28, 0.12]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.18, 10]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.7}
          roughness={0.35}
          emissive="#9a3412"
          emissiveIntensity={launched ? 0.7 : 0.08}
        />
      </mesh>

      {hasShield ? (
        <group>
          <mesh>
            <sphereGeometry args={[1.2, 20, 16]} />
            <meshStandardMaterial
              color="#7dd3fc"
              emissive="#38bdf8"
              emissiveIntensity={0.35}
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.1, 0.04, 8, 36]} />
            <meshStandardMaterial
              color="#f0f9ff"
              emissive="#38bdf8"
              emissiveIntensity={1}
              transparent
              opacity={0.95}
            />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}
