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

  const mountains = useMemo(
    () =>
      [
        // Near ridge
        [-5.8, -3.2, 1.1],
        [-4.2, -3.6, 0.95],
        [-2.6, -2.9, 1.35],
        [-1.1, -3.4, 0.85],
        [0.9, -3.1, 1.2],
        [2.4, -3.7, 1.0],
        [4.0, -3.0, 1.4],
        [5.6, -3.5, 0.9],
        // Mid ridge
        [-6.4, -5.2, 1.5],
        [-4.8, -5.8, 1.25],
        [-3.0, -4.9, 1.7],
        [-1.4, -5.5, 1.1],
        [0.2, -5.0, 1.55],
        [1.8, -5.6, 1.2],
        [3.5, -4.8, 1.65],
        [5.2, -5.4, 1.15],
        [6.6, -5.1, 1.4],
        // Far ridge
        [-5.5, -7.0, 1.8],
        [-3.5, -7.4, 1.45],
        [-1.6, -6.8, 2.0],
        [0.5, -7.2, 1.55],
        [2.6, -6.9, 1.9],
        [4.5, -7.5, 1.5],
        [6.2, -7.1, 1.75],
        // Extra peaks
        [-2.0, -4.2, 0.7],
        [1.3, -4.0, 0.75],
        [3.0, -6.2, 0.85],
        [-4.0, -6.4, 0.8],
      ].map(([x, z, s]) => ({ x, z, s })),
    [],
  )

  useFrame((state, dt) => {
    const { launched, screen, paused } = getSnapshot()
    const playing = screen === "playing"
    const won = screen === "win"
    const t = playing && launched ? playClock.elapsedMs : won ? ATMOSPHERE_FADE_MS : 0
    const atmosphere = won ? 1 : clamp01(t / ATMOSPHERE_FADE_MS)
    const liftoff = clamp01(t / 8_000)

    if (playing && launched && !paused) {
      scrollY.current += LAUNCH_SCROLL_SPEED * dt * (0.55 + atmosphere * 0.9)
    }
    if (!playing || !launched) {
      if (!won) scrollY.current = 0
    }

    if (worldRef.current) {
      worldRef.current.position.y = -scrollY.current
      const fadeOut = won ? 0 : clamp01(1 - atmosphere * 1.35)
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
      const starOpacity = won ? 1 : clamp01((atmosphere - 0.22) / 0.5)
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
        {/*
          Sea as a vertical backdrop facing the camera so the horizon
          stays a perfect horizontal line (no perspective diagonal).
        */}
        <mesh position={[0, -1.55, -9]}>
          <planeGeometry args={[90, 3.4]} />
          <meshStandardMaterial color="#2a6f8f" roughness={0.35} metalness={0.12} />
        </mesh>

        {/* Warm sky haze band above the sea — also vertical / straight */}
        <mesh position={[0, 0.85, -9.2]}>
          <planeGeometry args={[90, 2.8]} />
          <meshStandardMaterial
            color="#f4a261"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>

        {/* Local ground under the pad only — short depth to avoid slanted far edge */}
        <mesh position={[0, -2.2, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[22, 8]} />
          <meshStandardMaterial color="#c2a07a" roughness={0.95} flatShading />
        </mesh>

        {/* Land strip just in front of the sea (vertical) for a clean shoreline */}
        <mesh position={[0, -2.55, -8.6]}>
          <planeGeometry args={[90, 1.6]} />
          <meshStandardMaterial color="#b8956c" roughness={0.95} flatShading />
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

        {/*
          Service tower: mast ~rocket height (slightly shorter),
          horizontal arm overlaps the rocket like a crew access bridge.
          Rocket sits ~y=-1.55, tip ~-0.74, base ~-2.05.
        */}
        <mesh position={[0.78, -1.48, 0.35]}>
          <boxGeometry args={[0.14, 1.05, 0.14]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Access arm over the upper rocket body */}
        <mesh position={[0.22, -0.98, 0.35]}>
          <boxGeometry args={[1.05, 0.09, 0.12]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Small walkway tip over the rocket */}
        <mesh position={[-0.18, -1.08, 0.35]}>
          <boxGeometry args={[0.22, 0.05, 0.2]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.45} roughness={0.45} />
        </mesh>
        {/* Cross braces */}
        <mesh position={[0.78, -1.75, 0.35]} rotation={[0, 0, 0.55]}>
          <boxGeometry args={[0.06, 0.45, 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.45} roughness={0.45} />
        </mesh>
        <mesh position={[0.78, -1.2, 0.35]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.45} roughness={0.45} />
        </mesh>

        {mountains.map((m, i) => (
          <mesh
            key={i}
            position={[m.x, -2.0, m.z]}
            scale={[m.s, m.s * 0.5, m.s]}
          >
            <coneGeometry args={[0.9, 0.75, 5]} />
            <meshStandardMaterial color="#a98467" flatShading roughness={1} />
          </mesh>
        ))}
      </group>
    </>
  )
}
