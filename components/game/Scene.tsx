"use client"

import { Stars } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useSyncExternalStore } from "react"
import { getSnapshot, patchSnapshot, subscribe } from "./gameState"
import { Hazards } from "./Hazards"
import { input } from "./input"
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

export function Scene() {
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 2]} intensity={1.2} />
      <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.6} />
      <LaunchController />
      <RocketBridge />
      <Hazards />
      <mesh position={[0, 2.5, -6]}>
        <boxGeometry args={[2.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    </>
  )
}
