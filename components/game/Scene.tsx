"use client"

import { Billboard, useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef, useSyncExternalStore } from "react"
import type { Group } from "three"
import {
  ARRIVAL_CLEAR_MS,
  ATMOSPHERE_FADE_MS,
  GAME_DURATION_MS,
} from "@/lib/game/constants"
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
  const texture = useTexture("/images/estacionespacial.png")

  useFrame((state, dt) => {
    const { screen, launched } = getSnapshot()
    const group = ref.current
    if (!group) return

    const appearStart = GAME_DURATION_MS - 25_000
    const gameTimeMs = playClock.elapsedMs
    let opacity = 0
    if (screen === "playing" && launched && gameTimeMs >= appearStart) {
      opacity = Math.min(1, (gameTimeMs - appearStart) / 12_000)
    }
    if (screen === "win") opacity = 1

    group.visible = opacity > 0.02
    group.position.x = 0

    // Centered horizontally, higher on screen; breathe slowly when prominent
    const approach = screen === "win" ? 1 : opacity
    const targetY = screen === "win" ? 1.45 : 2.35 - approach * 0.35
    const targetZ = screen === "win" ? -2.2 : -5.5
    const baseScale = screen === "win" ? 4.4 : 2.2 + approach * 1.1
    const breathe =
      approach > 0.35 ? 1 + Math.sin(state.clock.elapsedTime * 0.85) * 0.035 : 1
    const targetScale = baseScale * breathe

    group.position.y += (targetY - group.position.y) * Math.min(1, dt * 2.2)
    group.position.z += (targetZ - group.position.z) * Math.min(1, dt * 2.2)
    const currentScale = group.scale.x
    const nextScale =
      currentScale + (targetScale - currentScale) * Math.min(1, dt * 1.8)
    group.scale.setScalar(nextScale)

    group.traverse((obj) => {
      const mesh = obj as {
        isMesh?: boolean
        material?: {
          opacity?: number
          transparent?: boolean
          depthWrite?: boolean
        }
      }
      if (!mesh.isMesh || !mesh.material) return
      mesh.material.transparent = true
      mesh.material.opacity = opacity
      mesh.material.depthWrite = opacity > 0.55
    })
  })

  return (
    <group ref={ref} position={[0, 2.35, -5.5]} scale={2.2} visible={false}>
      <Billboard follow>
        <mesh>
          <planeGeometry args={[2.4, 2.4]} />
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  )
}

function HazardsBridge() {
  const visible = useSyncExternalStore(
    subscribe,
    () => {
      const { screen, gameTimeMs } = getSnapshot()
      return (
        screen === "playing" &&
        gameTimeMs < GAME_DURATION_MS - ARRIVAL_CLEAR_MS + 500
      )
    },
    () => true,
  )

  if (!visible) return null
  return <Hazards />
}

function EffectsBridge() {
  const screen = useSyncExternalStore(
    subscribe,
    () => getSnapshot().screen,
    () => "home" as const,
  )

  if (screen === "win") return null
  return <Effects />
}

function SunLight() {
  useFrame((state) => {
    const { launched, screen } = getSnapshot()
    const t =
      screen === "win"
        ? 1
        : screen === "playing" && launched
          ? Math.min(1, playClock.elapsedMs / ATMOSPHERE_FADE_MS)
          : 0
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
      <HazardsBridge />
      <EffectsBridge />
      <SpaceStation />
    </>
  )
}
