"use client"

import { useFrame } from "@react-three/fiber"
import { useRef, useSyncExternalStore } from "react"
import type { Group } from "three"
import { getSnapshot, subscribe } from "./gameState"
import { clampX, input } from "./input"
import { playerPos } from "./playerRef"

const MOVE_SPEED = 7.2

/** Bright stainless Starship-like silhouette (never dark body — needs contrast in space). */
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
      rocket.rotation.z = -input.axisX() * 0.12
    } else {
      rocket.rotation.z = 0
    }
    playerPos.x = rocket.position.x
    playerPos.y = rocket.position.y
    playerPos.z = rocket.position.z
  })

  return (
    <group ref={ref} position={[0, -1.35, 0]} scale={1.15}>
      {/* Keep ship lit against black space */}
      <pointLight
        position={[0.6, 0.4, 1.2]}
        intensity={1.1}
        distance={6}
        color="#fff7ed"
      />
      <pointLight
        position={[-0.8, 0.2, 0.8]}
        intensity={0.45}
        distance={4}
        color="#bae6fd"
      />

      {/* Nose cone — bright steel */}
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.32, 0.7, 14]} />
        <meshStandardMaterial
          color="#f1f5f9"
          metalness={0.92}
          roughness={0.18}
          flatShading
        />
      </mesh>
      {/* Tiny dark tip only */}
      <mesh position={[0, 1.38, 0]}>
        <coneGeometry args={[0.08, 0.14, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Main stack — tall stainless cylinder */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.32, 0.34, 1.55, 16]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.9}
          roughness={0.22}
          flatShading
        />
      </mesh>

      {/* Weld / panel rings (readability) */}
      {[0.55, 0.15, -0.25].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.342, 0.342, 0.03, 16]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.85}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Heat-shield / tile band — warm, not black */}
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[0.35, 0.36, 0.28, 16]} />
        <meshStandardMaterial
          color="#fdba74"
          emissive="#c2410c"
          emissiveIntensity={0.2}
          metalness={0.35}
          roughness={0.55}
          flatShading
        />
      </mesh>

      {/* Forward flaps (canards) — charcoal, small */}
      <mesh position={[-0.4, 0.85, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.07, 0.38, 0.32]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[0.4, 0.85, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.07, 0.38, 0.32]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.45} />
      </mesh>

      {/* Aft flaps — larger Starship “elon fins” */}
      <mesh position={[-0.48, -0.35, 0]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.1, 0.72, 0.42]} />
        <meshStandardMaterial color="#64748b" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0.48, -0.35, 0]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.1, 0.72, 0.42]} />
        <meshStandardMaterial color="#64748b" metalness={0.55} roughness={0.4} />
      </mesh>

      {/* Engine skirt */}
      <mesh position={[0, -0.95, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.18, 14]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Engine bells — dark metal OK here (small) */}
      {[
        [-0.12, 0.1],
        [0.12, 0.1],
        [0, -0.12],
      ].map(([x, z], i) => (
        <mesh
          key={i}
          position={[x, -1.12, z]}
          rotation={[Math.PI, 0, 0]}
        >
          <coneGeometry args={[0.09, 0.22, 10]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.75}
            roughness={0.3}
            emissive="#7c2d12"
            emissiveIntensity={launched ? 0.55 : 0.05}
          />
        </mesh>
      ))}

      {hasShield ? (
        <group>
          <mesh>
            <sphereGeometry args={[1.05, 18, 14]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.35}
              transparent
              opacity={0.2}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.98, 0.04, 8, 32]} />
            <meshStandardMaterial
              color="#e0f2fe"
              emissive="#38bdf8"
              emissiveIntensity={1}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}
