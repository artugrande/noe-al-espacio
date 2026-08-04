"use client"

import { Billboard } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import type { Group } from "three"
import { playSfx } from "@/lib/game/audio"
import { circlesOverlap2D } from "@/lib/game/collisions"
import {
  GAME_DURATION_MS,
  HAZARD_RADIUS,
  PICKUP_RADIUS,
  PLAYER_RADIUS,
  PLAY_X_MAX,
  PLAY_X_MIN,
  SCORE_EMPANADA,
  SCORE_MATE,
  SPAWN_DELAY_MS,
} from "@/lib/game/constants"
import { checkAchievements } from "@/lib/game/curiosidades"
import { getDifficulty } from "@/lib/game/difficulty"
import { accumulateSpawns } from "@/lib/game/spawning"
import type { HazardKind } from "@/lib/game/types"
import { getSnapshot, patchSnapshot, playClock } from "./gameState"
import { getMateTexture, getMedialunaTexture } from "./iconTextures"
import { playerPos } from "./playerRef"

const POOL_SIZE = 32
const SPAWN_Y = 5.8
const DESPAWN_Y = -4.2
const HUD_UPDATE_MS = 100

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

function radiusFor(kind: HazardKind) {
  return kind === "junk" ? HAZARD_RADIUS : PICKUP_RADIUS
}

export function Hazards() {
  const groups = useRef<Array<Group | null>>(Array(POOL_SIZE).fill(null))
  const slots = useRef<HazardSlot[]>(
    Array.from({ length: POOL_SIZE }, () => ({ active: false, kind: "junk" })),
  )
  const elapsedMs = useRef(0)
  const hudAccumulatorMs = useRef(0)
  const spawnAccumulator = useRef(0)

  const mateMap = useMemo(() => getMateTexture(), [])
  const medialunaMap = useMemo(() => getMedialunaTexture(), [])

  useFrame((_, dt) => {
    const snapshot = getSnapshot()
    if (snapshot.screen !== "playing" || snapshot.paused || !snapshot.launched)
      return

    const frameMs = dt * 1000
    elapsedMs.current += frameMs
    playClock.elapsedMs = elapsedMs.current
    hudAccumulatorMs.current += frameMs

    if (elapsedMs.current >= GAME_DURATION_MS) {
      const gameTimeMs = GAME_DURATION_MS
      playSfx("win")
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

    if (elapsedMs.current >= SPAWN_DELAY_MS) {
      const spawnBatch = accumulateSpawns(
        spawnAccumulator.current,
        difficulty.spawnChance,
        dt,
      )
      spawnAccumulator.current = spawnBatch.remainder

      for (let spawnIndex = 0; spawnIndex < spawnBatch.count; spawnIndex += 1) {
        const slotIndex = slots.current.findIndex((slot) => !slot.active)
        const group = groups.current[slotIndex]
        if (slotIndex < 0 || !group) break

        const slot = slots.current[slotIndex]
        const kind = randomKind()
        slot.active = true
        slot.kind = kind

        // Spawn across full play width; keep Z near play lane for readability
        group.position.set(
          PLAY_X_MIN + Math.random() * (PLAY_X_MAX - PLAY_X_MIN),
          SPAWN_Y,
          (Math.random() - 0.5) * 0.6,
        )
        group.visible = true
        group.rotation.set(0, 0, 0)
        group.children[0].visible = kind === "junk"
        group.children[1].visible = kind === "mate"
        group.children[2].visible = kind === "empanada"
        group.children[3].visible = kind === "shield"
        group.children[4].visible = kind === "shield"
      }
    }

    for (let index = 0; index < POOL_SIZE; index += 1) {
      const slot = slots.current[index]
      const group = groups.current[index]
      if (!slot.active || !group) continue

      group.position.y -= difficulty.scrollSpeed * dt

      // Only tumble rocks — icons stay upright via Billboard
      if (slot.kind === "junk") {
        group.rotation.x += dt * 1.1
        group.rotation.z += dt * 0.7
      }

      if (group.position.y < DESPAWN_Y) {
        slot.active = false
        group.visible = false
        continue
      }

      if (
        !circlesOverlap2D(
          group.position,
          radiusFor(slot.kind),
          playerPos,
          PLAYER_RADIUS,
        )
      ) {
        continue
      }

      slot.active = false
      group.visible = false
      const current = getSnapshot()

      if (slot.kind === "junk") {
        playSfx("hit")
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
        playSfx("collect")
        patchSnapshot({
          score: current.score + SCORE_MATE,
          collectedMate: true,
        })
      } else if (slot.kind === "empanada") {
        playSfx("collect")
        patchSnapshot({ score: current.score + SCORE_EMPANADA })
      } else {
        playSfx("shield")
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
          {/* 0: asteroid cluster */}
          <group>
            <mesh>
              <dodecahedronGeometry args={[0.26, 0]} />
              <meshStandardMaterial
                color="#a8a29e"
                roughness={0.95}
                flatShading
              />
            </mesh>
            <mesh position={[0.14, 0.08, -0.06]} scale={0.55}>
              <icosahedronGeometry args={[0.22, 0]} />
              <meshStandardMaterial
                color="#78716c"
                roughness={1}
                flatShading
              />
            </mesh>
            <mesh position={[-0.12, -0.1, 0.08]} scale={0.4}>
              <tetrahedronGeometry args={[0.28, 0]} />
              <meshStandardMaterial
                color="#57534e"
                roughness={1}
                flatShading
              />
            </mesh>
          </group>

          {/* 1: mate icon — visibility toggled on this Billboard */}
          <Billboard follow lockZ={false} visible={false}>
            <mesh>
              <planeGeometry args={[0.9, 0.9]} />
              <meshBasicMaterial
                map={mateMap ?? undefined}
                transparent
                depthWrite={false}
              />
            </mesh>
          </Billboard>

          {/* 2: medialuna icon */}
          <Billboard follow lockZ={false} visible={false}>
            <mesh>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                map={medialunaMap ?? undefined}
                transparent
                depthWrite={false}
              />
            </mesh>
          </Billboard>

          {/* 3–4: shield */}
          <mesh visible={false}>
            <sphereGeometry args={[0.3, 12, 10]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0ea5e9"
              emissiveIntensity={0.4}
              transparent
              opacity={0.35}
            />
          </mesh>
          <mesh visible={false} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.34, 0.06, 8, 20]} />
            <meshStandardMaterial
              color="#e0f2fe"
              emissive="#38bdf8"
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
