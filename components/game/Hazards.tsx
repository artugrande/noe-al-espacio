"use client"

import { Billboard } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import type { Group } from "three"
import { playSfx } from "@/lib/game/audio"
import { circlesOverlap2D, distance2D } from "@/lib/game/collisions"
import { comboMultiplier, scoreWithCombo } from "@/lib/game/combo"
import {
  ARRIVAL_CLEAR_MS,
  BOOST_DURATION_MS,
  BOOST_SCROLL_MULT,
  BOOST_SPAWN_MULT,
  BOOST_TIME_MULT,
  FORMATION_CHANCE,
  FORMATION_COOLDOWN_MS,
  GAME_DURATION_MS,
  HAZARD_RADIUS,
  NEAR_MISS_PADDING,
  OBJECTIVE_MATES,
  PICKUP_RADIUS,
  PLAYER_RADIUS,
  PLAY_X_MAX,
  PLAY_X_MIN,
  SCORE_EMPANADA,
  SCORE_MATE,
  SCORE_NEAR_MISS,
  SCORE_OBJECTIVE_BONUS,
  SPAWN_DELAY_MS,
  TURBULENCE_DURATION_MS,
  TURBULENCE_GAP_MS,
} from "@/lib/game/constants"
import { checkAchievements } from "@/lib/game/curiosidades"
import { getDifficulty } from "@/lib/game/difficulty"
import {
  formationPositions,
  randomFormation,
} from "@/lib/game/formations"
import { accumulateSpawns } from "@/lib/game/spawning"
import type { HazardKind, JunkVariant } from "@/lib/game/types"
import { getSnapshot, patchSnapshot, playClock } from "./gameState"
import { getMateTexture, getMedialunaTexture } from "./iconTextures"
import { playerPos } from "./playerRef"

const POOL_SIZE = 40
const SPAWN_Y = 5.8
const DESPAWN_Y = -8.8
const HUD_UPDATE_MS = 100

interface HazardSlot {
  active: boolean
  kind: HazardKind
  scale: number
  variant: JunkVariant
  nearMissAwarded: boolean
}

function randomKind(): HazardKind {
  if (Math.random() < 0.64) return "junk"
  const pickupRoll = Math.random()
  if (pickupRoll < 0.1) return "shield"
  if (pickupRoll < 0.2) return "boost"
  return pickupRoll < 0.6 ? "mate" : "empanada"
}

function randomJunkVariant(): JunkVariant {
  const roll = Math.random()
  if (roll < 0.18) return "heavy"
  if (roll < 0.32) return "splitter"
  return "normal"
}

function randomJunkScale(variant: JunkVariant) {
  if (variant === "heavy") return 1.45 + Math.random() * 0.45
  if (variant === "splitter") return 1.05 + Math.random() * 0.25
  const roll = Math.random()
  if (roll < 0.35) return 0.55 + Math.random() * 0.25
  if (roll < 0.75) return 0.9 + Math.random() * 0.25
  return 1.2 + Math.random() * 0.35
}

function radiusFor(kind: HazardKind, scale: number, variant: JunkVariant) {
  if (kind !== "junk") return PICKUP_RADIUS
  const base = variant === "heavy" ? HAZARD_RADIUS * 1.15 : HAZARD_RADIUS
  return base * scale
}

function deactivate(slot: HazardSlot, group: Group) {
  slot.active = false
  slot.nearMissAwarded = false
  slot.variant = "normal"
  group.visible = false
  group.scale.setScalar(1)
}

function setJunkVisual(group: Group, variant: JunkVariant) {
  group.children[0].visible = variant === "normal"
  group.children[1].visible = false
  group.children[2].visible = false
  group.children[3].visible = false
  group.children[4].visible = false
  group.children[5].visible = false
  group.children[6].visible = variant === "heavy"
  group.children[7].visible = variant === "splitter"
}

function setKindVisual(group: Group, kind: HazardKind, variant: JunkVariant) {
  if (kind === "junk") {
    setJunkVisual(group, variant)
    return
  }
  group.children[0].visible = false
  group.children[1].visible = kind === "mate"
  group.children[2].visible = kind === "empanada"
  group.children[3].visible = kind === "shield"
  group.children[4].visible = kind === "shield"
  group.children[5].visible = kind === "boost"
  group.children[6].visible = false
  group.children[7].visible = false
}

export function Hazards() {
  const groups = useRef<Array<Group | null>>(Array(POOL_SIZE).fill(null))
  const slots = useRef<HazardSlot[]>(
    Array.from({ length: POOL_SIZE }, () => ({
      active: false,
      kind: "junk" as HazardKind,
      scale: 1,
      variant: "normal" as JunkVariant,
      nearMissAwarded: false,
    })),
  )
  const elapsedMs = useRef(0)
  const hudAccumulatorMs = useRef(0)
  const spawnAccumulator = useRef(0)
  const boostRemaining = useRef(0)
  const comboCount = useRef(0)
  const matesCollected = useRef(0)
  const objectiveDone = useRef(false)
  const reachedCombo4 = useRef(false)
  const formationCooldown = useRef(0)
  const turbulenceRemaining = useRef(0)
  const nextTurbulenceAt = useRef(TURBULENCE_GAP_MS)

  const mateMap = useMemo(() => getMateTexture(), [])
  const medialunaMap = useMemo(() => getMedialunaTexture(), [])

  const activateAt = (
    kind: HazardKind,
    x: number,
    y: number,
    variant: JunkVariant = "normal",
    scaleOverride?: number,
  ) => {
    const slotIndex = slots.current.findIndex((slot) => !slot.active)
    const group = groups.current[slotIndex]
    if (slotIndex < 0 || !group) return false

    const slot = slots.current[slotIndex]
    const scale =
      scaleOverride ??
      (kind === "junk" ? randomJunkScale(variant) : 1)
    slot.active = true
    slot.kind = kind
    slot.scale = scale
    slot.variant = kind === "junk" ? variant : "normal"
    slot.nearMissAwarded = false

    group.position.set(x, y, (Math.random() - 0.5) * 0.5)
    group.scale.setScalar(scale)
    group.visible = true
    group.rotation.set(0, 0, 0)
    setKindVisual(group, kind, slot.variant)
    return true
  }

  const spawnSplitters = (x: number, y: number) => {
    activateAt("junk", x - 0.55, y + 0.2, "normal", 0.55)
    activateAt("junk", x + 0.55, y + 0.15, "normal", 0.55)
  }

  const resetCombo = () => {
    comboCount.current = 0
  }

  const bumpCombo = () => {
    comboCount.current += 1
    if (comboCount.current >= 13) reachedCombo4.current = true
  }

  useFrame((_, dt) => {
    const snapshot = getSnapshot()
    if (snapshot.screen !== "playing" || snapshot.paused || !snapshot.launched)
      return

    const frameMs = dt * 1000
    // Impulso drains in real time, but mission time races ahead.
    const boostingNow = boostRemaining.current > 0
    if (boostingNow) {
      boostRemaining.current = Math.max(0, boostRemaining.current - frameMs)
    }
    const missionFrameMs = frameMs * (boostingNow ? BOOST_TIME_MULT : 1)
    elapsedMs.current += missionFrameMs
    playClock.elapsedMs = elapsedMs.current
    hudAccumulatorMs.current += missionFrameMs
    formationCooldown.current = Math.max(
      0,
      formationCooldown.current - missionFrameMs,
    )

    if (turbulenceRemaining.current > 0) {
      turbulenceRemaining.current = Math.max(
        0,
        turbulenceRemaining.current - frameMs,
      )
    } else if (elapsedMs.current >= nextTurbulenceAt.current) {
      turbulenceRemaining.current = TURBULENCE_DURATION_MS
      nextTurbulenceAt.current =
        elapsedMs.current + TURBULENCE_DURATION_MS + TURBULENCE_GAP_MS
    }

    if (elapsedMs.current >= GAME_DURATION_MS) {
      const gameTimeMs = GAME_DURATION_MS
      playSfx("win")
      patchSnapshot({
        screen: "win",
        gameTimeMs,
        boostRemainingMs: 0,
        turbulenceMs: 0,
        achievements: checkAchievements({
          collectedMate: snapshot.collectedMate,
          gameTimeMs,
          usedShield: snapshot.usedShield,
          usedBoost: snapshot.usedBoost,
          reachedCombo4: reachedCombo4.current,
          objectiveDone: objectiveDone.current,
        }),
      })
      return
    }

    if (hudAccumulatorMs.current >= HUD_UPDATE_MS) {
      hudAccumulatorMs.current %= HUD_UPDATE_MS
      patchSnapshot({
        gameTimeMs: elapsedMs.current,
        boostRemainingMs: boostRemaining.current,
        turbulenceMs: turbulenceRemaining.current,
        comboCount: comboCount.current,
        comboMult: comboMultiplier(comboCount.current),
        matesCollected: matesCollected.current,
        objectiveDone: objectiveDone.current,
        reachedCombo4: reachedCombo4.current,
      })
    }

    const difficulty = getDifficulty(elapsedMs.current)
    const remainingMs = GAME_DURATION_MS - elapsedMs.current
    const clearingLane = remainingMs <= ARRIVAL_CLEAR_MS
    const scrollSpeed =
      difficulty.scrollSpeed * (boostingNow ? BOOST_SCROLL_MULT : 1)
    const spawnChance =
      difficulty.spawnChance * (boostingNow ? BOOST_SPAWN_MULT : 1)

    if (clearingLane) {
      for (let index = 0; index < POOL_SIZE; index += 1) {
        const slot = slots.current[index]
        const group = groups.current[index]
        if (!slot.active || !group) continue
        group.position.y -= scrollSpeed * 2.8 * dt
        if (group.position.y < DESPAWN_Y || remainingMs < 2500) {
          deactivate(slot, group)
        }
      }
      return
    }

    if (elapsedMs.current >= SPAWN_DELAY_MS) {
      const spawnBatch = accumulateSpawns(
        spawnAccumulator.current,
        spawnChance,
        dt,
      )
      spawnAccumulator.current = spawnBatch.remainder

      const wantFormation =
        spawnBatch.count > 0 &&
        formationCooldown.current <= 0 &&
        Math.random() < FORMATION_CHANCE

      if (wantFormation) {
        formationCooldown.current = FORMATION_COOLDOWN_MS
        const points = formationPositions(randomFormation(), SPAWN_Y)
        for (const point of points) {
          activateAt("junk", point.x, point.y, randomJunkVariant())
        }
      } else {
        for (let spawnIndex = 0; spawnIndex < spawnBatch.count; spawnIndex += 1) {
          const kind = randomKind()
          const variant = kind === "junk" ? randomJunkVariant() : "normal"
          activateAt(
            kind,
            PLAY_X_MIN + Math.random() * (PLAY_X_MAX - PLAY_X_MIN),
            SPAWN_Y,
            variant,
          )
        }
      }
    }

    for (let index = 0; index < POOL_SIZE; index += 1) {
      const slot = slots.current[index]
      const group = groups.current[index]
      if (!slot.active || !group) continue

      group.position.y -= scrollSpeed * dt

      if (slot.kind === "junk") {
        group.rotation.x += dt * (slot.variant === "heavy" ? 0.7 : 1.2)
        group.rotation.z += dt * 0.7
      }
      if (slot.kind === "boost") {
        group.rotation.y += dt * 2.2
      }

      if (group.position.y < DESPAWN_Y) {
        deactivate(slot, group)
        continue
      }

      const hitR = radiusFor(slot.kind, slot.scale, slot.variant)

      // Near-miss: junk passing beside the rocket
      if (
        slot.kind === "junk" &&
        !slot.nearMissAwarded &&
        group.position.y < playerPos.y + 0.15 &&
        group.position.y > playerPos.y - 1.2
      ) {
        const dist = distance2D(group.position, playerPos)
        const hitDist = hitR + PLAYER_RADIUS
        if (dist > hitDist && dist < hitDist + NEAR_MISS_PADDING) {
          slot.nearMissAwarded = true
          bumpCombo()
          const current = getSnapshot()
          playSfx("collect")
          patchSnapshot({
            score:
              current.score +
              scoreWithCombo(SCORE_NEAR_MISS, comboCount.current),
            comboCount: comboCount.current,
            comboMult: comboMultiplier(comboCount.current),
            reachedCombo4: reachedCombo4.current,
          })
        }
      }

      if (!circlesOverlap2D(group.position, hitR, playerPos, PLAYER_RADIUS)) {
        continue
      }

      const impactX = group.position.x
      const impactY = group.position.y
      const impactVariant = slot.variant
      deactivate(slot, group)
      const current = getSnapshot()

      if (slot.kind === "junk") {
        playSfx("hit")
        resetCombo()
        if (current.hasShield) {
          if (impactVariant === "splitter") {
            spawnSplitters(impactX, impactY)
          }
          patchSnapshot({
            hasShield: false,
            usedShield: true,
            comboCount: 0,
            comboMult: 1,
          })
          continue
        }

        const gameTimeMs = elapsedMs.current
        patchSnapshot({
          screen: "gameOver",
          gameTimeMs,
          boostRemainingMs: 0,
          turbulenceMs: 0,
          comboCount: 0,
          comboMult: 1,
          achievements: checkAchievements({
            collectedMate: current.collectedMate,
            gameTimeMs,
            usedShield: current.usedShield,
            usedBoost: current.usedBoost,
            reachedCombo4: reachedCombo4.current,
            objectiveDone: objectiveDone.current,
          }),
        })
        return
      }

      if (slot.kind === "mate") {
        playSfx("collect")
        bumpCombo()
        matesCollected.current += 1
        let score =
          current.score + scoreWithCombo(SCORE_MATE, comboCount.current)
        let done = objectiveDone.current
        if (!done && matesCollected.current >= OBJECTIVE_MATES) {
          done = true
          objectiveDone.current = true
          score += SCORE_OBJECTIVE_BONUS
        }
        patchSnapshot({
          score,
          collectedMate: true,
          matesCollected: matesCollected.current,
          objectiveDone: done,
          comboCount: comboCount.current,
          comboMult: comboMultiplier(comboCount.current),
          reachedCombo4: reachedCombo4.current,
        })
      } else if (slot.kind === "empanada") {
        playSfx("collect")
        bumpCombo()
        patchSnapshot({
          score:
            current.score +
            scoreWithCombo(SCORE_EMPANADA, comboCount.current),
          comboCount: comboCount.current,
          comboMult: comboMultiplier(comboCount.current),
          reachedCombo4: reachedCombo4.current,
        })
      } else if (slot.kind === "boost") {
        playSfx("boost")
        boostRemaining.current = BOOST_DURATION_MS
        patchSnapshot({
          boostRemainingMs: BOOST_DURATION_MS,
          usedBoost: true,
        })
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
          {/* 0: normal asteroid */}
          <group>
            <mesh>
              <dodecahedronGeometry args={[0.28, 0]} />
              <meshStandardMaterial color="#a8a29e" roughness={0.95} flatShading />
            </mesh>
            <mesh position={[0.14, 0.08, -0.06]} scale={0.55}>
              <icosahedronGeometry args={[0.22, 0]} />
              <meshStandardMaterial color="#78716c" roughness={1} flatShading />
            </mesh>
            <mesh position={[-0.12, -0.1, 0.08]} scale={0.4}>
              <tetrahedronGeometry args={[0.28, 0]} />
              <meshStandardMaterial color="#57534e" roughness={1} flatShading />
            </mesh>
          </group>

          {/* 1: mate */}
          <group visible={false}>
            <mesh>
              <sphereGeometry args={[0.5, 24, 18]} />
              <meshStandardMaterial
                color="#a5f3fc"
                emissive="#22d3ee"
                emissiveIntensity={0.25}
                transparent
                opacity={0.28}
                roughness={0.05}
                metalness={0.15}
                depthWrite={false}
              />
            </mesh>
            <Billboard follow>
              <mesh position={[0, 0, 0.12]}>
                <planeGeometry args={[0.78, 0.78]} />
                <meshBasicMaterial
                  map={mateMap ?? undefined}
                  transparent
                  depthWrite={false}
                />
              </mesh>
            </Billboard>
          </group>

          {/* 2: medialuna */}
          <group visible={false}>
            <mesh>
              <sphereGeometry args={[0.5, 24, 18]} />
              <meshStandardMaterial
                color="#fdba74"
                emissive="#f59e0b"
                emissiveIntensity={0.22}
                transparent
                opacity={0.3}
                roughness={0.08}
                metalness={0.12}
                depthWrite={false}
              />
            </mesh>
            <Billboard follow>
              <mesh position={[0, 0, 0.12]}>
                <planeGeometry args={[0.78, 0.78]} />
                <meshBasicMaterial
                  map={medialunaMap ?? undefined}
                  transparent
                  depthWrite={false}
                />
              </mesh>
            </Billboard>
          </group>

          {/* 3–4: shield */}
          <mesh visible={false}>
            <sphereGeometry args={[0.32, 14, 12]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0ea5e9"
              emissiveIntensity={0.45}
              transparent
              opacity={0.4}
            />
          </mesh>
          <mesh visible={false} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.06, 8, 22]} />
            <meshStandardMaterial
              color="#e0f2fe"
              emissive="#38bdf8"
              emissiveIntensity={0.85}
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* 5: impulso */}
          <group visible={false}>
            <mesh>
              <octahedronGeometry args={[0.38, 0]} />
              <meshStandardMaterial
                color="#facc15"
                emissive="#eab308"
                emissiveIntensity={0.7}
                metalness={0.2}
                roughness={0.25}
                flatShading
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.42, 0.05, 8, 20]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#facc15"
                emissiveIntensity={0.9}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>

          {/* 6: heavy junk */}
          <group visible={false}>
            <mesh>
              <dodecahedronGeometry args={[0.34, 0]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0.12, 0.1, -0.08]} scale={0.7}>
              <icosahedronGeometry args={[0.24, 0]} />
              <meshStandardMaterial color="#991b1b" roughness={1} flatShading />
            </mesh>
          </group>

          {/* 7: splitter junk */}
          <group visible={false}>
            <mesh>
              <icosahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial color="#a16207" roughness={0.85} flatShading />
            </mesh>
            <mesh position={[0.16, -0.08, 0.1]} rotation={[0.4, 0.2, 0.5]}>
              <tetrahedronGeometry args={[0.22, 0]} />
              <meshStandardMaterial color="#ca8a04" roughness={1} flatShading />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
