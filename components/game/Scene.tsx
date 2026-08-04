"use client"

import { useFrame } from "@react-three/fiber"
import { useRef, useSyncExternalStore } from "react"
import type { Group } from "three"
import { ATMOSPHERE_FADE_MS, GAME_DURATION_MS } from "@/lib/game/constants"
import { Effects } from "./Effects"
import { getSnapshot, patchSnapshot, playClock, subscribe } from "./gameState"
import { Hazards } from "./Hazards"
import { input } from "./input"
import { LaunchEnvironment } from "./LaunchEnvironment"
import { Rocket } from "./Rocket"

function LaunchController() {
  useFrame(() => {
    const launchRequested = input.consumeLaunch()
    if (!launchRequested) return

    const snapshot = getSnapshot()
    if (
      snapshot.screen === "playing" &&
      !snapshot.paused &&
      !snapshot.launched
    ) {
      patchSnapshot({ launched: true })
    }
  })

  return null
}

function RocketBridge() {
  const launched = useSyncExternalStore(
    subscribe,
    () => getSnapshot().launched,
    () => false,
  )

  return <Rocket launched={launched} />
}

function SpaceStation() {
  const ref = useRef<Group>(null)

  useFrame(() => {
    const { screen, launched } = getSnapshot()
    const group = ref.current
    if (!group) return

    // Fade ISS in during the last stretch (like v1)
    const appearStart = GAME_DURATION_MS - 25_000
    const gameTimeMs = playClock.elapsedMs
    let opacity = 0
    if (screen === "playing" && launched && gameTimeMs >= appearStart) {
      opacity = Math.min(1, (gameTimeMs - appearStart) / 12_000)
    }
    if (screen === "win") opacity = 1

    group.visible = opacity > 0.02
    group.traverse((obj) => {
      const mesh = obj as { isMesh?: boolean; material?: { opacity?: number; transparent?: boolean; depthWrite?: boolean } }
      if (!mesh.isMesh || !mesh.material) return
      mesh.material.transparent = true
      mesh.material.opacity = opacity
      mesh.material.depthWrite = opacity > 0.5
    })
  })

  return (
    <group ref={ref} position={[0, 2.6, -6]} rotation={[0.12, 0.2, -0.08]} visible={false}>
      <mesh>
        <boxGeometry args={[2.2, 0.34, 0.42]} />
        <meshStandardMaterial color="#d6d3d1" metalness={0.35} flatShading />
      </mesh>
      <mesh position={[-0.72, 0.38, 0]}>
        <boxGeometry args={[0.48, 0.48, 0.48]} />
        <meshStandardMaterial color="#a8a29e" flatShading />
      </mesh>
      <mesh position={[0.72, -0.36, 0]}>
        <boxGeometry args={[0.58, 0.36, 0.36]} />
        <meshStandardMaterial color="#e7e5e4" flatShading />
      </mesh>
      <mesh position={[-1.75, 0, 0]}>
        <boxGeometry args={[1.25, 0.06, 0.72]} />
        <meshStandardMaterial
          color="#1d4ed8"
          emissive="#1e40af"
          emissiveIntensity={0.3}
          flatShading
        />
      </mesh>
      <mesh position={[1.75, 0, 0]}>
        <boxGeometry args={[1.25, 0.06, 0.72]} />
        <meshStandardMaterial
          color="#1d4ed8"
          emissive="#1e40af"
          emissiveIntensity={0.3}
          flatShading
        />
      </mesh>
    </group>
  )
}

function SunLight() {
  useFrame((state) => {
    const { launched, screen } = getSnapshot()
    const t =
      screen === "playing" && launched
        ? Math.min(1, playClock.elapsedMs / ATMOSPHERE_FADE_MS)
        : 0
    // Warm strong light on Earth, cooler/dimmer in space
    const dir = state.scene.getObjectByName("sun-light") as
      | { intensity?: number; color?: { set?: (c: string) => void } }
      | undefined
    if (dir?.intensity != null) {
      dir.intensity = 1.35 - t * 0.55
      dir.color?.set?.(t > 0.6 ? "#c7d2fe" : "#ffd7a8")
    }
  })

  return (
    <directionalLight
      name="sun-light"
      position={[5, 8, 3]}
      intensity={1.35}
      color="#ffd7a8"
    />
  )
}

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <SunLight />
      <LaunchEnvironment />
      <LaunchController />
      <RocketBridge />
      <Hazards />
      <Effects />
      <SpaceStation />
    </>
  )
}
