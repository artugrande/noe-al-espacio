"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Group, Mesh, MeshStandardMaterial } from "three"
import { spheresOverlap } from "@/lib/game/collisions"
import {
  GAME_DURATION_MS,
  HAZARD_RADIUS,
  PLAYER_RADIUS,
  PLAY_X_MAX,
  PLAY_X_MIN,
  SCORE_EMPANADA,
  SCORE_MATE,
  SPAWN_DELAY_MS,
} from "@/lib/game/constants"
import { checkAchievements } from "@/lib/game/curiosidades"
import { getDifficulty } from "@/lib/game/difficulty"
import type { HazardKind } from "@/lib/game/types"
import { getSnapshot, patchSnapshot } from "./gameState"
import { playerPos } from "./playerRef"

const POOL_SIZE = 32
const SPAWN_Y = 5.5
const DESPAWN_Y = -4
const HUD_UPDATE_MS = 100

const PICKUP_COLORS: Record<Exclude<HazardKind, "junk">, string> = {
  mate: "#22c55e",
  empanada: "#f59e0b",
  shield: "#38bdf8",
}

interface HazardSlot {
  active: boolean
  kind: HazardKind
}

function randomKind(): HazardKind {
  if (Math.random() < 0.7) return "junk"
  const pickupRoll = Math.random()
  if (pickupRoll < 0.05) return "shield"
  return pickupRoll < 0.525 ? "mate" : "empanada"
}

export function Hazards() {
  const groups = useRef<Array<Group | null>>(Array(POOL_SIZE).fill(null))
  const slots = useRef<HazardSlot[]>(
    Array.from({ length: POOL_SIZE }, () => ({ active: false, kind: "junk" })),
  )
  const elapsedMs = useRef(0)
  const hudAccumulatorMs = useRef(0)

  useFrame((_, dt) => {
    const snapshot = getSnapshot()
    if (snapshot.screen !== "playing" || snapshot.paused || !snapshot.launched) return

    const frameMs = dt * 1000
    elapsedMs.current += frameMs
    hudAccumulatorMs.current += frameMs

    if (elapsedMs.current >= GAME_DURATION_MS) {
      const gameTimeMs = GAME_DURATION_MS
      patchSnapshot({
        screen: "win",
        gameTimeMs,
        achievements: checkAchievements({
          collectedMate: snapshot.collectedMate,
          gameTimeMs,
          usedShield: snapshot.usedShield,
        }),
      })
      return
    }

    if (hudAccumulatorMs.current >= HUD_UPDATE_MS) {
      hudAccumulatorMs.current %= HUD_UPDATE_MS
      patchSnapshot({ gameTimeMs: elapsedMs.current })
    }

    const difficulty = getDifficulty(elapsedMs.current)

    if (
      elapsedMs.current >= SPAWN_DELAY_MS &&
      Math.random() < difficulty.spawnChance
    ) {
      const slotIndex = slots.current.findIndex((slot) => !slot.active)
      const group = groups.current[slotIndex]

      if (slotIndex >= 0 && group) {
        const slot = slots.current[slotIndex]
        const kind = randomKind()
        const box = group.children[0] as Mesh
        const sphere = group.children[1] as Mesh

        slot.active = true
        slot.kind = kind
        group.position.set(
          PLAY_X_MIN + Math.random() * (PLAY_X_MAX - PLAY_X_MIN),
          SPAWN_Y,
          -2 + Math.random() * 4,
        )
        group.visible = true
        box.visible = kind === "junk"
        sphere.visible = kind !== "junk"

        if (kind !== "junk") {
          const material = sphere.material as MeshStandardMaterial
          material.color.set(PICKUP_COLORS[kind])
          sphere.scale.setScalar(kind === "shield" ? 1.2 : 1)
        }
      }
    }

    for (let index = 0; index < POOL_SIZE; index += 1) {
      const slot = slots.current[index]
      const group = groups.current[index]
      if (!slot.active || !group) continue

      group.position.y -= difficulty.scrollSpeed * dt

      if (group.position.y < DESPAWN_Y) {
        slot.active = false
        group.visible = false
        continue
      }

      if (
        Math.abs(group.position.z - playerPos.z) >= 0.75 ||
        !spheresOverlap(group.position, HAZARD_RADIUS, playerPos, PLAYER_RADIUS)
      ) {
        continue
      }

      slot.active = false
      group.visible = false
      const current = getSnapshot()

      if (slot.kind === "junk") {
        if (current.hasShield) {
          patchSnapshot({ hasShield: false, usedShield: true })
          continue
        }

        const gameTimeMs = elapsedMs.current
        patchSnapshot({
          screen: "gameOver",
          gameTimeMs,
          achievements: checkAchievements({
            collectedMate: current.collectedMate,
            gameTimeMs,
            usedShield: current.usedShield,
          }),
        })
        return
      }

      if (slot.kind === "mate") {
        patchSnapshot({
          score: current.score + SCORE_MATE,
          collectedMate: true,
        })
      } else if (slot.kind === "empanada") {
        patchSnapshot({ score: current.score + SCORE_EMPANADA })
      } else {
        patchSnapshot({ hasShield: true })
      }
    }
  })

  return (
    <group>
      {slots.current.map((_, index) => (
        <group
          key={index}
          ref={(group) => {
            groups.current[index] = group
          }}
          visible={false}
        >
          <mesh>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh visible={false}>
            <sphereGeometry args={[HAZARD_RADIUS, 12, 12]} />
            <meshStandardMaterial color={PICKUP_COLORS.mate} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
