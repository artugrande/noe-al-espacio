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

/** Celeste sky → space. No brown / dark-blue horizon bands. */
const skyGround = new Color("#7ec8f0")
const skyMid = new Color("#5eb0e0")
const skySpace = new Color("#020617")

/** Green launch pad + hills under a clean celeste sky. */
export function LaunchEnvironment() {
  const worldRef = useRef<Group>(null)
  const padRef = useRef<Mesh>(null)
  const starsGroup = useRef<Group>(null)
  const bg = useRef(skyGround.clone())
  const scrollY = useRef(0)

  const scrub = useMemo(
    () =>
      [
        [-5.2, 2.4, 0.55],
        [-3.8, 1.6, 0.7],
        [-2.4, 2.8, 0.5],
        [-1.2, 1.9, 0.65],
        [1.4, 2.5, 0.6],
        [2.8, 1.7, 0.75],
        [4.2, 2.6, 0.55],
        [5.5, 1.8, 0.7],
        [-4.6, -0.4, 0.8],
        [-2.8, -1.0, 0.9],
        [2.2, -0.6, 0.85],
        [4.8, -1.2, 0.7],
        [-6.0, 0.8, 0.6],
        [6.2, 0.5, 0.65],
      ].map(([x, z, s]) => ({ x, z, s })),
    [],
  )

  const hills = useMemo(
    () =>
      [
        [-6.2, -3.8, 1.3],
        [-4.0, -4.4, 1.6],
        [-1.8, -4.0, 1.2],
        [0.4, -4.6, 1.5],
        [2.6, -3.9, 1.35],
        [4.8, -4.5, 1.55],
        [6.5, -4.1, 1.2],
        [-5.0, -5.8, 1.7],
        [-2.2, -6.2, 1.45],
        [1.2, -5.6, 1.8],
        [3.8, -6.0, 1.5],
        [5.8, -5.5, 1.6],
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

    if (atmosphere < 0.45) {
      const u = atmosphere / 0.45
      bg.current.copy(skyGround).lerp(skyMid, u)
    } else {
      const u = (atmosphere - 0.45) / 0.55
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
      <color attach="background" args={["#7ec8f0"]} />
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
        {/* One continuous green ground — no ocean / shore bands that split on scroll */}
        <mesh position={[0, -2.2, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 22]} />
          <meshStandardMaterial color="#3d8c4e" roughness={0.95} flatShading />
        </mesh>

        {/* Concrete apron + pad */}
        <mesh position={[0, -2.08, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.5, 4.2]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.85} metalness={0.15} />
        </mesh>
        <mesh
          ref={padRef}
          position={[0, -2.04, 0.4]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[1.55, 24]} />
          <meshStandardMaterial
            color="#6b7280"
            emissive="#f97316"
            emissiveIntensity={0.05}
            roughness={0.7}
            metalness={0.35}
          />
        </mesh>

        {/* Hangar */}
        <mesh position={[-4.2, -1.35, 1.8]}>
          <boxGeometry args={[2.4, 1.4, 1.6]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.7} metalness={0.1} flatShading />
        </mesh>
        <mesh position={[-4.2, -0.55, 1.8]}>
          <boxGeometry args={[2.5, 0.12, 1.7]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.6} metalness={0.2} />
        </mesh>
        <mesh position={[-4.2, -1.5, 2.62]}>
          <boxGeometry args={[1.4, 0.7, 0.08]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
        </mesh>

        {/* Small buildings */}
        <mesh position={[4.5, -1.7, 1.5]}>
          <boxGeometry args={[1.2, 0.7, 0.9]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.75} flatShading />
        </mesh>
        <mesh position={[5.4, -1.85, 0.2]}>
          <boxGeometry args={[0.7, 0.4, 0.7]} />
          <meshStandardMaterial color="#f5f5f4" roughness={0.8} flatShading />
        </mesh>

        {/* Service tower / crew access bridge */}
        <mesh position={[0.78, -1.48, 0.35]}>
          <boxGeometry args={[0.14, 1.05, 0.14]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0.22, -0.98, 0.35]}>
          <boxGeometry args={[1.05, 0.09, 0.12]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[-0.18, -1.08, 0.35]}>
          <boxGeometry args={[0.22, 0.05, 0.2]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.45} roughness={0.45} />
        </mesh>
        <mesh position={[0.78, -1.75, 0.35]} rotation={[0, 0, 0.55]}>
          <boxGeometry args={[0.06, 0.45, 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.45} roughness={0.45} />
        </mesh>
        <mesh position={[0.78, -1.2, 0.35]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.45} roughness={0.45} />
        </mesh>

        {scrub.map((b, i) => (
          <group key={`scrub-${i}`} position={[b.x, -2.05, b.z]} scale={b.s}>
            <mesh position={[0, 0.18, 0]}>
              <sphereGeometry args={[0.35, 6, 5]} />
              <meshStandardMaterial color="#2f6b3a" flatShading roughness={1} />
            </mesh>
            <mesh position={[0.2, 0.12, 0.1]}>
              <sphereGeometry args={[0.25, 5, 4]} />
              <meshStandardMaterial color="#3d8c4e" flatShading roughness={1} />
            </mesh>
          </group>
        ))}

        {hills.map((h, i) => (
          <mesh
            key={`hill-${i}`}
            position={[h.x, -2.05, h.z]}
            scale={[h.s, h.s * 0.42, h.s]}
          >
            <coneGeometry args={[1.0, 0.8, 5]} />
            <meshStandardMaterial color="#2f6b3a" flatShading roughness={1} />
          </mesh>
        ))}
      </group>
    </>
  )
}
