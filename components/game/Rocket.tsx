"use client"

import { useFrame } from "@react-three/fiber"
import { useRef, useSyncExternalStore } from "react"
import type { Group, Mesh } from "three"
import { getSnapshot, subscribe } from "./gameState"
import { clampX, input } from "./input"
import { playerPos } from "./playerRef"

const MOVE_SPEED = 7.2

/** Compact classic white rocket — readable silhouette. */
export function Rocket({ launched }: { launched: boolean }) {
  const ref = useRef<Group>(null)
  const flameRef = useRef<Group>(null)
  const flameCore = useRef<Mesh>(null)
  const flameOuter = useRef<Mesh>(null)
  const flameTip = useRef<Mesh>(null)
  const hasShield = useSyncExternalStore(
    subscribe,
    () => getSnapshot().hasShield,
    () => false,
  )

  useFrame((state, dt) => {
    const rocket = ref.current
    if (!rocket) return

    const { screen } = getSnapshot()
    const won = screen === "win"

    if (won) {
      rocket.position.x += (0 - rocket.position.x) * Math.min(1, dt * 3.2)
      rocket.position.y += (0 - rocket.position.y) * Math.min(1, dt * 2.4)
      rocket.rotation.z += (0 - rocket.rotation.z) * Math.min(1, dt * 4)
    } else if (launched) {
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

    const flame = flameRef.current
    if (flame) {
      flame.visible = launched && !won
      if (flame.visible) {
        const t = state.clock.elapsedTime
        const flicker = 0.82 + Math.sin(t * 28) * 0.12 + Math.sin(t * 47) * 0.08
        const sway = Math.sin(t * 22) * 0.04
        flame.scale.set(flicker * 0.95, flicker * (1.05 + Math.sin(t * 35) * 0.15), flicker)
        flame.position.x = sway
        if (flameCore.current) {
          flameCore.current.scale.setScalar(0.9 + Math.sin(t * 40) * 0.15)
        }
        if (flameOuter.current) {
          flameOuter.current.scale.set(
            1 + Math.sin(t * 31) * 0.18,
            1.1 + Math.sin(t * 26) * 0.2,
            1,
          )
        }
        if (flameTip.current) {
          flameTip.current.position.y = -1.35 - Math.sin(t * 38) * 0.08
          flameTip.current.scale.setScalar(0.75 + Math.sin(t * 50) * 0.2)
        }
      }
    }
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

      {/* Stripe — black */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.305, 0.305, 0.12, 12]} />
        <meshStandardMaterial color="#171717" roughness={0.45} metalness={0.2} flatShading />
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

      {/* Fins */}
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

      {/* Black fin tips */}
      <mesh position={[-0.38, -0.52, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.07, 0.14, 0.18]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.45} flatShading />
      </mesh>
      <mesh position={[0.38, -0.52, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.07, 0.14, 0.18]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.45} flatShading />
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

      {/* Animated engine flame */}
      <group ref={flameRef} position={[0, -0.72, 0]} visible={false}>
        <pointLight intensity={1.8} distance={3.2} color="#fb923c" />
        <mesh ref={flameOuter} position={[0, -0.55, 0]}>
          <coneGeometry args={[0.22, 0.95, 8]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.75} depthWrite={false} />
        </mesh>
        <mesh ref={flameCore} position={[0, -0.4, 0]}>
          <coneGeometry args={[0.12, 0.7, 8]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.95} depthWrite={false} />
        </mesh>
        <mesh ref={flameTip} position={[0, -1.3, 0]}>
          <coneGeometry args={[0.07, 0.45, 6]} />
          <meshBasicMaterial color="#fff7ed" transparent opacity={0.85} depthWrite={false} />
        </mesh>
      </group>

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
