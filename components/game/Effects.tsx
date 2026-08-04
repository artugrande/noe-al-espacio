"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Mesh } from "three"
import { getSnapshot } from "./gameState"
import { playerPos } from "./playerRef"

const EXHAUST_COUNT = 14
const BURST_COUNT = 28

interface Particle {
  life: number
  velocity: [number, number, number]
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    life: 0,
    velocity: [0, 0, 0],
  }))
}

export function Effects() {
  const exhaustMeshes = useRef<Array<Mesh | null>>(Array(EXHAUST_COUNT).fill(null))
  const burstMeshes = useRef<Array<Mesh | null>>(Array(BURST_COUNT).fill(null))
  const exhaust = useRef(makeParticles(EXHAUST_COUNT))
  const burst = useRef(makeParticles(BURST_COUNT))
  const exhaustCursor = useRef(0)
  const exhaustTimer = useRef(0)
  const previousScreen = useRef(getSnapshot().screen)

  useFrame((_, dt) => {
    const snapshot = getSnapshot()

    if (
      snapshot.screen === "playing" &&
      snapshot.launched &&
      !snapshot.paused
    ) {
      exhaustTimer.current += dt
      while (exhaustTimer.current >= 0.04) {
        exhaustTimer.current -= 0.04
        const index = exhaustCursor.current
        const particle = exhaust.current[index]
        const mesh = exhaustMeshes.current[index]

        exhaustCursor.current = (index + 1) % EXHAUST_COUNT
        particle.life = 0.45 + Math.random() * 0.2
        particle.velocity = [
          (Math.random() - 0.5) * 0.45,
          -1.6 - Math.random() * 0.8,
          (Math.random() - 0.5) * 0.35,
        ]
        mesh?.position.set(
          playerPos.x + (Math.random() - 0.5) * 0.12,
          playerPos.y - 0.7,
          playerPos.z,
        )
      }
    }

    exhaust.current.forEach((particle, index) => {
      const mesh = exhaustMeshes.current[index]
      if (!mesh) return

      particle.life = Math.max(0, particle.life - dt)
      mesh.visible = particle.life > 0
      if (!mesh.visible) return

      mesh.position.x += particle.velocity[0] * dt
      mesh.position.y += particle.velocity[1] * dt
      mesh.position.z += particle.velocity[2] * dt
      const scale = Math.max(0.05, particle.life * 0.35)
      mesh.scale.setScalar(scale)
    })

    if (snapshot.screen === "win" && previousScreen.current !== "win") {
      burst.current.forEach((particle, index) => {
        const angle = (index / BURST_COUNT) * Math.PI * 2
        const lift = 0.5 + Math.random() * 1.3
        const speed = 2.2 + Math.random() * 2
        particle.life = 0.75 + Math.random() * 0.45
        particle.velocity = [
          Math.cos(angle) * speed,
          Math.sin(angle) * speed + lift,
          (Math.random() - 0.5) * 2.2,
        ]
        burstMeshes.current[index]?.position.set(playerPos.x, playerPos.y, 0)
      })
    }
    previousScreen.current = snapshot.screen

    burst.current.forEach((particle, index) => {
      const mesh = burstMeshes.current[index]
      if (!mesh) return

      particle.life = Math.max(0, particle.life - dt)
      mesh.visible = particle.life > 0
      if (!mesh.visible) return

      particle.velocity[1] -= 2.5 * dt
      mesh.position.x += particle.velocity[0] * dt
      mesh.position.y += particle.velocity[1] * dt
      mesh.position.z += particle.velocity[2] * dt
      mesh.rotation.x += dt * 8
      mesh.rotation.y += dt * 6
      mesh.scale.setScalar(Math.min(1, particle.life * 2))
    })
  })

  return (
    <group>
      {exhaust.current.map((_, index) => (
        <mesh
          key={`exhaust-${index}`}
          ref={(mesh) => {
            exhaustMeshes.current[index] = mesh
          }}
          visible={false}
        >
          <octahedronGeometry args={[0.22, 0]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#22d3ee" : "#fbbf24"} />
        </mesh>
      ))}
      {burst.current.map((_, index) => (
        <mesh
          key={`burst-${index}`}
          ref={(mesh) => {
            burstMeshes.current[index] = mesh
          }}
          visible={false}
        >
          <tetrahedronGeometry args={[0.12, 0]} />
          <meshBasicMaterial
            color={["#22d3ee", "#fbbf24", "#34d399", "#fb7185"][index % 4]}
          />
        </mesh>
      ))}
    </group>
  )
}
