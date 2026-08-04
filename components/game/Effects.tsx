"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Mesh } from "three"
import { LAUNCH_SMOKE_MS } from "@/lib/game/constants"
import { getSnapshot, playClock } from "./gameState"
import { playerPos } from "./playerRef"

const EXHAUST_COUNT = 18
const SMOKE_COUNT = 36
const BURST_COUNT = 28

interface Particle {
  life: number
  maxLife: number
  velocity: [number, number, number]
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    life: 0,
    maxLife: 1,
    velocity: [0, 0, 0],
  }))
}

export function Effects() {
  const exhaustMeshes = useRef<Array<Mesh | null>>(Array(EXHAUST_COUNT).fill(null))
  const smokeMeshes = useRef<Array<Mesh | null>>(Array(SMOKE_COUNT).fill(null))
  const burstMeshes = useRef<Array<Mesh | null>>(Array(BURST_COUNT).fill(null))
  const exhaust = useRef(makeParticles(EXHAUST_COUNT))
  const smoke = useRef(makeParticles(SMOKE_COUNT))
  const burst = useRef(makeParticles(BURST_COUNT))
  const exhaustCursor = useRef(0)
  const smokeCursor = useRef(0)
  const exhaustTimer = useRef(0)
  const smokeTimer = useRef(0)
  const previousScreen = useRef(getSnapshot().screen)

  useFrame((_, dt) => {
    const snapshot = getSnapshot()
    const flying =
      snapshot.screen === "playing" && snapshot.launched && !snapshot.paused
    const inLaunchSmoke = flying && playClock.elapsedMs < LAUNCH_SMOKE_MS

    if (flying) {
      exhaustTimer.current += dt
      const exhaustInterval = inLaunchSmoke ? 0.025 : 0.045
      while (exhaustTimer.current >= exhaustInterval) {
        exhaustTimer.current -= exhaustInterval
        const index = exhaustCursor.current
        const particle = exhaust.current[index]
        const mesh = exhaustMeshes.current[index]
        exhaustCursor.current = (index + 1) % EXHAUST_COUNT
        particle.maxLife = inLaunchSmoke ? 0.7 : 0.4
        particle.life = particle.maxLife
        particle.velocity = [
          (Math.random() - 0.5) * (inLaunchSmoke ? 0.7 : 0.4),
          -2.2 - Math.random() * (inLaunchSmoke ? 1.8 : 0.9),
          (Math.random() - 0.5) * (inLaunchSmoke ? 0.55 : 0.3),
        ]
        mesh?.position.set(
          playerPos.x + (Math.random() - 0.5) * 0.15,
          playerPos.y - 0.85,
          playerPos.z,
        )
      }
    }

    if (inLaunchSmoke) {
      smokeTimer.current += dt
      while (smokeTimer.current >= 0.03) {
        smokeTimer.current -= 0.03
        const index = smokeCursor.current
        const particle = smoke.current[index]
        const mesh = smokeMeshes.current[index]
        smokeCursor.current = (index + 1) % SMOKE_COUNT
        particle.maxLife = 1.4 + Math.random() * 0.9
        particle.life = particle.maxLife
        // Long columnar smoke stretching downward (v1 feel)
        particle.velocity = [
          (Math.random() - 0.5) * 0.9,
          -3.2 - Math.random() * 2.4,
          (Math.random() - 0.5) * 0.7,
        ]
        mesh?.position.set(
          playerPos.x + (Math.random() - 0.5) * 0.35,
          playerPos.y - 0.95,
          playerPos.z + (Math.random() - 0.5) * 0.2,
        )
        if (mesh) {
          mesh.scale.set(0.35, 0.9 + Math.random() * 0.8, 0.35)
        }
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
      const t = particle.life / particle.maxLife
      mesh.scale.setScalar(Math.max(0.06, t * 0.4))
    })

    smoke.current.forEach((particle, index) => {
      const mesh = smokeMeshes.current[index]
      if (!mesh) return
      particle.life = Math.max(0, particle.life - dt)
      mesh.visible = particle.life > 0
      if (!mesh.visible) return
      // stretch further as it ages
      particle.velocity[0] *= 1 - dt * 0.2
      mesh.position.x += particle.velocity[0] * dt
      mesh.position.y += particle.velocity[1] * dt
      mesh.position.z += particle.velocity[2] * dt
      const t = particle.life / particle.maxLife
      mesh.scale.set(0.4 + (1 - t) * 0.8, 1.2 + (1 - t) * 2.2, 0.4 + (1 - t) * 0.8)
      const mat = mesh.material as { opacity?: number }
      if (mat && "opacity" in mat) mat.opacity = t * 0.45
    })

    if (snapshot.screen === "win" && previousScreen.current !== "win") {
      burst.current.forEach((particle, index) => {
        const angle = (index / BURST_COUNT) * Math.PI * 2
        const lift = 0.5 + Math.random() * 1.3
        const speed = 2.2 + Math.random() * 2
        particle.maxLife = 0.75 + Math.random() * 0.45
        particle.life = particle.maxLife
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
          <octahedronGeometry args={[0.2, 0]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#fb923c" : "#fde047"} />
        </mesh>
      ))}
      {smoke.current.map((_, index) => (
        <mesh
          key={`smoke-${index}`}
          ref={(mesh) => {
            smokeMeshes.current[index] = mesh
          }}
          visible={false}
        >
          <sphereGeometry args={[0.28, 6, 6]} />
          <meshBasicMaterial
            color={index % 3 === 0 ? "#d4d4d8" : "#a1a1aa"}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
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
