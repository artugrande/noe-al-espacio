"use client"

import { Stars } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useSyncExternalStore } from "react"
import { Effects } from "./Effects"
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

function SpaceStation() {
  return (
    <group position={[0, 2.5, -6]} rotation={[0.12, 0.2, -0.08]}>
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
      <Effects />
      <SpaceStation />
    </>
  )
}
