"use client"

import { Stars } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import { Color, type Group, type Mesh, type MeshStandardMaterial } from "three"
import {
  ATMOSPHERE_FADE_MS,
  LAUNCH_SCROLL_SPEED,
} from "@/lib/game/constants"
import { getSnapshot, playClock } from "./gameState"

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

const skyGround = new Color("#f4a261")
const skyMid = new Color("#7eb6d9")
const skySpace = new Color("#020617")

/** Earth launchpad → progressive fade into deep space. */
export function LaunchEnvironment() {
  const worldRef = useRef<Group>(null)
  const padRef = useRef<Mesh>(null)
  const starsGroup = useRef<Group>(null)
  const bg = useRef(skyMid.clone())
  const scrollY = useRef(0)

  const duneOffsets = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        x: -6 + i * 1.7 + (i % 2) * 0.3,
        z: -4 - (i % 3) * 1.2,
        s: 0.8 + (i % 3) * 0.25,
      })),
    [],
  )

  useFrame((state, dt) => {
    const { launched, screen, paused } = getSnapshot()
    const playing = screen === "playing"
    const t = playing && launched ? playClock.elapsedMs : 0
    const atmosphere = clamp01(t / ATMOSPHERE_FADE_MS)
    const liftoff = clamp01(t / 8_000)

    if (playing && launched && !paused) {
      scrollY.current += LAUNCH_SCROLL_SPEED * dt * (0.55 + atmosphere * 0.9)
    }
    if (!playing || !launched) {
      scrollY.current = 0
    }

    if (worldRef.current) {
      worldRef.current.position.y = -scrollY.current
      const fadeOut = clamp01(1 - atmosphere * 1.35)
      worldRef.current.visible = fadeOut > 0.02
      worldRef.current.traverse((obj) => {
        const mesh = obj as Mesh
        if (!mesh.isMesh) return
        const mat = mesh.material as MeshStandardMaterial
        if (mat && "opacity" in mat) {
          mat.transparent = true
          mat.opacity = fadeOut
          mat.depthWrite = fadeOut > 0.4
        }
      })
    }

    if (atmosphere < 0.35) {
      const u = atmosphere / 0.35
      bg.current.copy(skyGround).lerp(skyMid, u)
    } else {
      const u = (atmosphere - 0.35) / 0.65
      bg.current.copy(skyMid).lerp(skySpace, u)
    }
    state.scene.background = bg.current

    if (starsGroup.current) {
      const starOpacity = clamp01((atmosphere - 0.22) / 0.5)
      starsGroup.current.visible = starOpacity > 0.02
      starsGroup.current.traverse((obj) => {
        const points = obj as Mesh & {
          isPoints?: boolean
          material?: { opacity?: number; transparent?: boolean }
        }
        if (points.isPoints && points.material) {
          points.material.transparent = true
          points.material.opacity = starOpacity
        }
      })
      starsGroup.current.rotation.y += dt * 0.008
    }

    if (padRef.current) {
      const mat = padRef.current.material as MeshStandardMaterial
      if (mat) {
        mat.emissiveIntensity = launched
          ? 0.15 + liftoff * 0.4 * (1 - atmosphere)
          : 0.05
      }
    }
  })

  return (
    <>
      <color attach="background" args={["#7eb6d9"]} />
      <group ref={starsGroup} visible={false}>
        <Stars
          radius={90}
          depth={45}
          count={1600}
          factor={3.2}
          fade
          speed={0.35}
        />
      </group>

      <group ref={worldRef}>
        <mesh position={[0, -2.35, -8]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 24]} />
          <meshStandardMaterial color="#2a6f8f" roughness={0.35} metalness={0.15} />
        </mesh>
        <mesh position={[0, -2.2, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[28, 18]} />
          <meshStandardMaterial color="#c2a07a" roughness={0.95} flatShading />
        </mesh>
        <mesh
          ref={padRef}
          position={[0, -2.05, 0.4]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[1.6, 24]} />
          <meshStandardMaterial
            color="#6b7280"
            emissive="#f97316"
            emissiveIntensity={0.05}
            roughness={0.7}
            metalness={0.35}
          />
        </mesh>
        <mesh position={[1.1, -1.2, 0.3]}>
          <boxGeometry args={[0.18, 1.8, 0.18]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[1.1, -0.4, 0.3]}>
          <boxGeometry args={[0.9, 0.1, 0.1]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.5} roughness={0.4} />
        </mesh>
        {duneOffsets.map((dune, i) => (
          <mesh
            key={i}
            position={[dune.x, -2.0, dune.z]}
            scale={[dune.s, dune.s * 0.45, dune.s]}
          >
            <coneGeometry args={[0.9, 0.7, 5]} />
            <meshStandardMaterial color="#a98467" flatShading roughness={1} />
          </mesh>
        ))}
        <mesh position={[0, 0.8, -14]}>
          <planeGeometry args={[50, 8]} />
          <meshStandardMaterial
            color="#f4a261"
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  )
}
