"use client"

import { useFrame } from "@react-three/fiber"
import { useSyncExternalStore } from "react"
import { ATMOSPHERE_FADE_MS } from "@/lib/game/constants"
import { Effects } from "./Effects"
import { getSnapshot, patchSnapshot, playClock, subscribe } from "./gameState"
import { Hazards } from "./Hazards"
import { input } from "./input"
import { LaunchEnvironment } from "./LaunchEnvironment"
import { Rocket } from "./Rocket"
import { SpaceStation } from "./SpaceStation"

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

function HazardsBridge() {
  // Keep mounted for the whole run — the mission clock & win check live here.
  const visible = useSyncExternalStore(
    subscribe,
    () => getSnapshot().screen === "playing",
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
