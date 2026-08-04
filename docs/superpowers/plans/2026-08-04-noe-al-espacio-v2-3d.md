# Noe al Espacio v2 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the DOM 2D loop with a React Three Fiber side-scroller (low-poly, depth layers) that keeps the Noe tribute fantasy, adds shield + difficulty ramp + light achievements, deploys on Vercel, and doubles as a Cursor workshop reference.

**Architecture:** React owns screens/HUD only. Simulation runs in R3F `useFrame` with refs/module state. Pure logic lives in `lib/game/*` (unit-tested). Meshes/effects live in `components/game/*`. Mobile controls and mute stay as DOM overlays.

**Tech Stack:** Next.js 15 · React 19 · TypeScript · `@react-three/fiber` · `@react-three/drei` · `three` · Vitest · Tailwind · Vercel

**Spec:** `docs/superpowers/specs/2026-08-04-noe-al-espacio-v2-3d-design.md`

---

## File map (create / modify)

| Path | Responsibility |
|------|----------------|
| `package.json` | Add R3F, three, drei, vitest scripts |
| `vitest.config.ts` | Unit test config for `lib/game` |
| `next.config.mjs` | Transpile `three` packages if needed |
| `lib/game/constants.ts` | Durations, speeds, scores, spawn bases |
| `lib/game/difficulty.ts` | Ramp multipliers from `gameTimeMs` |
| `lib/game/collisions.ts` | Sphere overlap helpers |
| `lib/game/scores.ts` | `noe_v2_high_scores` localStorage |
| `lib/game/curiosidades.ts` | Facts + achievement definitions |
| `lib/game/audio.ts` | BGM/SFX helpers (no commercial hotlinks) |
| `lib/game/types.ts` | Shared game types |
| `lib/game/*.test.ts` | Vitest coverage for pure logic |
| `components/game/GameCanvas.tsx` | R3F Canvas + dpr caps |
| `components/game/Scene.tsx` | Lights, starfield, ISS, world root |
| `components/game/Rocket.tsx` | Player mesh + input → X position |
| `components/game/Hazards.tsx` | Pooled junk/collectibles/shield |
| `components/game/Effects.tsx` | Exhaust / hit / win burst |
| `components/game/GameSession.tsx` | Wires loop callbacks to React screens |
| `components/hud/Hud.tsx` | Score, timer, shield |
| `components/hud/MobileControls.tsx` | Move from `components/mobile-controls.tsx` or re-export |
| `components/hud/MuteButton.tsx` | Move/adapt mute |
| `components/hud/OrientationWarning.tsx` | Move/adapt |
| `app/page.tsx` | Thin screen shell (home / playing / end) |
| `public/models/*.glb` | Low-poly kit (or temporary primitives until GLBs land) |
| `public/audio/*` | Project-owned SFX/BGM |
| `docs/workshop/00`–`07-*.md` | Cursor workshop modules |

Keep v1 `app/page.tsx` logic only until Task 8 replaces it; do not leave two competing loops.

---

### Task 1: Scaffold dependencies + Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Modify: `next.config.mjs`

- [ ] **Step 1: Install runtime + test deps**

```bash
cd /Users/arturogrande/Projects/noe-al-espacio
npm install three @react-three/fiber @react-three/drei
npm install -D vitest @vitest/coverage-v8 jsdom @types/three
```

- [ ] **Step 2: Add scripts to `package.json`**

```json
"scripts": {
  "build": "next build",
  "dev": "next dev",
  "lint": "eslint .",
  "start": "next start",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
```

- [ ] **Step 4: Update `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ["three"],
}

export default nextConfig
```

- [ ] **Step 5: Verify vitest runs (0 tests OK)**

```bash
npm test
```

Expected: Vitest exits 0 or reports no test files / pass with empty suite depending on version. If “no tests found” is an error, add a tiny placeholder test in Task 2.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts next.config.mjs
git commit -m "chore: add R3F, three, drei, and vitest scaffold"
```

---

### Task 2: `constants` + `types` + `difficulty` (TDD)

**Files:**
- Create: `lib/game/types.ts`
- Create: `lib/game/constants.ts`
- Create: `lib/game/difficulty.ts`
- Create: `lib/game/difficulty.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// lib/game/difficulty.test.ts
import { describe, expect, it } from "vitest"
import { getDifficulty } from "./difficulty"

describe("getDifficulty", () => {
  it("starts at baseline at t=0", () => {
    const d = getDifficulty(0)
    expect(d.spawnChance).toBeCloseTo(0.03, 3)
    expect(d.scrollSpeed).toBeCloseTo(0.8, 3)
  })

  it("increases spawn and speed by mid-game", () => {
    const early = getDifficulty(0)
    const mid = getDifficulty(90_000)
    expect(mid.spawnChance).toBeGreaterThan(early.spawnChance)
    expect(mid.scrollSpeed).toBeGreaterThan(early.scrollSpeed)
  })

  it("caps at max multipliers", () => {
    const late = getDifficulty(180_000)
    const later = getDifficulty(300_000)
    expect(late.spawnChance).toBe(later.spawnChance)
    expect(late.scrollSpeed).toBe(later.scrollSpeed)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- lib/game/difficulty.test.ts
```

Expected: FAIL — `getDifficulty` not found / cannot resolve.

- [ ] **Step 3: Implement types, constants, difficulty**

```ts
// lib/game/types.ts
export type GameScreen = "loading" | "home" | "playing" | "gameOver" | "win"

export type HazardKind = "junk" | "mate" | "empanada" | "shield"

export type AchievementId = "first_mate" | "survived_90s" | "first_shield"

export interface Difficulty {
  spawnChance: number
  scrollSpeed: number
}

export interface HighScoreEntry {
  score: number
  at: string // ISO date
}
```

```ts
// lib/game/constants.ts
export const GAME_DURATION_MS = 180_000
export const SPAWN_DELAY_MS = 10_000
export const BASE_SPAWN_CHANCE = 0.03
export const BASE_SCROLL_SPEED = 0.8
export const MAX_SPAWN_CHANCE = 0.08
export const MAX_SCROLL_SPEED = 1.6
export const SCORE_MATE = 10
export const SCORE_EMPANADA = 15
export const HIGH_SCORES_KEY = "noe_v2_high_scores"
export const HIGH_SCORES_LIMIT = 5
export const PLAYER_RADIUS = 0.45
export const HAZARD_RADIUS = 0.35
export const PLAY_X_MIN = -4
export const PLAY_X_MAX = 4
```

```ts
// lib/game/difficulty.ts
import {
  BASE_SCROLL_SPEED,
  BASE_SPAWN_CHANCE,
  GAME_DURATION_MS,
  MAX_SCROLL_SPEED,
  MAX_SPAWN_CHANCE,
} from "./constants"
import type { Difficulty } from "./types"

/** Linear ramp from t=0 → GAME_DURATION_MS, then clamp. */
export function getDifficulty(gameTimeMs: number): Difficulty {
  const t = Math.min(Math.max(gameTimeMs, 0) / GAME_DURATION_MS, 1)
  return {
    spawnChance:
      BASE_SPAWN_CHANCE + (MAX_SPAWN_CHANCE - BASE_SPAWN_CHANCE) * t,
    scrollSpeed:
      BASE_SCROLL_SPEED + (MAX_SCROLL_SPEED - BASE_SCROLL_SPEED) * t,
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- lib/game/difficulty.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/game/types.ts lib/game/constants.ts lib/game/difficulty.ts lib/game/difficulty.test.ts
git commit -m "feat(game): add difficulty ramp with unit tests"
```

---

### Task 3: Collisions (TDD)

**Files:**
- Create: `lib/game/collisions.ts`
- Create: `lib/game/collisions.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest"
import { spheresOverlap } from "./collisions"

describe("spheresOverlap", () => {
  it("detects overlap", () => {
    expect(
      spheresOverlap({ x: 0, y: 0, z: 0 }, 0.5, { x: 0.4, y: 0, z: 0 }, 0.5),
    ).toBe(true)
  })

  it("rejects separated spheres", () => {
    expect(
      spheresOverlap({ x: 0, y: 0, z: 0 }, 0.5, { x: 2, y: 0, z: 0 }, 0.5),
    ).toBe(false)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- lib/game/collisions.test.ts
```

- [ ] **Step 3: Implement**

```ts
// lib/game/collisions.ts
export interface Vec3 {
  x: number
  y: number
  z: number
}

export function spheresOverlap(
  a: Vec3,
  radiusA: number,
  b: Vec3,
  radiusB: number,
): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  const r = radiusA + radiusB
  return dx * dx + dy * dy + dz * dz <= r * r
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- lib/game/collisions.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/game/collisions.ts lib/game/collisions.test.ts
git commit -m "feat(game): add sphere collision helper"
```

---

### Task 4: High scores (TDD)

**Files:**
- Create: `lib/game/scores.ts`
- Create: `lib/game/scores.test.ts`

- [ ] **Step 1: Write failing tests (memory localStorage mock)**

```ts
import { beforeEach, describe, expect, it, vi } from "vitest"
import { HIGH_SCORES_KEY } from "./constants"
import { loadHighScores, submitScore } from "./scores"

describe("scores", () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    })
  })

  it("starts empty", () => {
    expect(loadHighScores()).toEqual([])
  })

  it("keeps top 5 descending", () => {
    for (const s of [10, 50, 20, 40, 30, 60]) submitScore(s)
    const scores = loadHighScores().map((e) => e.score)
    expect(scores).toEqual([60, 50, 40, 30, 20])
    expect(localStorage.getItem(HIGH_SCORES_KEY)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- lib/game/scores.test.ts
```

- [ ] **Step 3: Implement**

```ts
// lib/game/scores.ts
import { HIGH_SCORES_KEY, HIGH_SCORES_LIMIT } from "./constants"
import type { HighScoreEntry } from "./types"

export function loadHighScores(): HighScoreEntry[] {
  if (typeof localStorage === "undefined") return []
  try {
    const raw = localStorage.getItem(HIGH_SCORES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HighScoreEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function submitScore(score: number): HighScoreEntry[] {
  const next = [
    ...loadHighScores(),
    { score, at: new Date().toISOString() },
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, HIGH_SCORES_LIMIT)
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(next))
  }
  return next
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- lib/game/scores.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/game/scores.ts lib/game/scores.test.ts
git commit -m "feat(game): add v2 high scores storage"
```

---

### Task 5: Curiosidades + achievements helpers (TDD)

**Files:**
- Create: `lib/game/curiosidades.ts`
- Create: `lib/game/curiosidades.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest"
import {
  CURIOSIDADES,
  checkAchievements,
  pickCuriosity,
} from "./curiosidades"

describe("curiosidades", () => {
  it("has at least 3 curiosities", () => {
    expect(CURIOSIDADES.length).toBeGreaterThanOrEqual(3)
  })

  it("pickCuriosity returns one of the list", () => {
    expect(CURIOSIDADES).toContainEqual(pickCuriosity(0))
  })

  it("unlocks first_mate and survived_90s", () => {
    const ids = checkAchievements({
      collectedMate: true,
      gameTimeMs: 90_000,
      usedShield: false,
    })
    expect(ids).toContain("first_mate")
    expect(ids).toContain("survived_90s")
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- lib/game/curiosidades.test.ts
```

- [ ] **Step 3: Implement** (port/adapt texts from v1 `CURIOSIDADES` in `app/page.tsx`)

```ts
// lib/game/curiosidades.ts
import type { AchievementId } from "./types"

export interface Curiosity {
  title: string
  body: string
}

export const CURIOSIDADES: Curiosity[] = [
  {
    title: "Falcon 9",
    body: "El Falcon 9 de SpaceX puede aterrizar y reutilizarse, bajando el costo de llegar al espacio.",
  },
  {
    title: "Basura espacial",
    body: "Hay miles de fragmentos orbitando la Tierra; por eso esquivar basura en el juego no es solo ficción.",
  },
  {
    title: "¿Quién es Noe Castro?",
    body: "Noel de Castro, ingeniera de Salta, fue seleccionada por Axiom Space como astronauta argentina.",
  },
]

export function pickCuriosity(seed: number): Curiosity {
  const i = Math.abs(Math.floor(seed)) % CURIOSIDADES.length
  return CURIOSIDADES[i]
}

export function checkAchievements(input: {
  collectedMate: boolean
  gameTimeMs: number
  usedShield: boolean
}): AchievementId[] {
  const out: AchievementId[] = []
  if (input.collectedMate) out.push("first_mate")
  if (input.gameTimeMs >= 90_000) out.push("survived_90s")
  if (input.usedShield) out.push("first_shield")
  return out
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- lib/game/curiosidades.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add lib/game/curiosidades.ts lib/game/curiosidades.test.ts
git commit -m "feat(game): extract curiosities and achievements"
```

---

### Task 6: R3F canvas + empty scene (Module 1 shape)

**Files:**
- Create: `components/game/GameCanvas.tsx`
- Create: `components/game/Scene.tsx`
- Modify: `app/page.tsx` (temporary: show canvas on a `playing` stub OR add a `/dev/scene` route)

Prefer a thin home → “Probar escena 3D” button that mounts the canvas so `npm run dev` proves WebGL without full game yet.

- [ ] **Step 1: Create `GameCanvas.tsx`**

```tsx
"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import { Scene } from "./Scene"

export function GameCanvas() {
  return (
    <div className="absolute inset-0 bg-black">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.2, 8], fov: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 2: Create `Scene.tsx` (primitives first — no GLB required)**

```tsx
"use client"

import { Stars } from "@react-three/drei"

export function Scene() {
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 2]} intensity={1.2} />
      <Stars radius={80} depth={40} count={1200} factor={3} fade speed={0.6} />
      {/* placeholder rocket */}
      <mesh position={[0, -1.5, 0]}>
        <coneGeometry args={[0.35, 1.2, 8]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
      {/* far ISS placeholder */}
      <mesh position={[0, 2.5, -6]}>
        <boxGeometry args={[2.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    </>
  )
}
```

- [ ] **Step 3: Wire a minimal mount in `app/page.tsx`**

Replace the file later in Task 8. For now, either:
- keep v1 and add a floating button that toggles `<GameCanvas />`, **or**
- create `app/dev/scene/page.tsx` with only the canvas.

Recommended: `app/dev/scene/page.tsx` so v1 stays playable until cutover.

```tsx
"use client"

import { GameCanvas } from "@/components/game/GameCanvas"

export default function DevScenePage() {
  return <GameCanvas />
}
```

- [ ] **Step 4: Manual verify**

```bash
npm run dev
```

Open `http://localhost:3000/dev/scene` — expect starfield + cyan cone + gray ISS box.

- [ ] **Step 5: Commit**

```bash
git add components/game/GameCanvas.tsx components/game/Scene.tsx app/dev/scene/page.tsx
git commit -m "feat(game): add R3F canvas and placeholder scene"
```

---

### Task 7: Rocket movement + golden-rule input (Module 2)

**Files:**
- Create: `components/game/Rocket.tsx`
- Create: `components/game/input.ts` (keyboard/touch intent store)
- Modify: `components/game/Scene.tsx`

- [ ] **Step 1: Create input store (module state, not React state)**

```ts
// components/game/input.ts
import { PLAY_X_MAX, PLAY_X_MIN } from "@/lib/game/constants"

let left = false
let right = false
let launchPressed = false

export const input = {
  setLeft(v: boolean) {
    left = v
  },
  setRight(v: boolean) {
    right = v
  },
  consumeLaunch() {
    const v = launchPressed
    launchPressed = false
    return v
  },
  pressLaunch() {
    launchPressed = true
  },
  axisX() {
    return (right ? 1 : 0) - (left ? 1 : 0)
  },
}

export function bindKeyboard() {
  const down = (e: KeyboardEvent) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.setLeft(true)
    if (e.code === "ArrowRight" || e.code === "KeyD") input.setRight(true)
    if (e.code === "Space") input.pressLaunch()
  }
  const up = (e: KeyboardEvent) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") input.setLeft(false)
    if (e.code === "ArrowRight" || e.code === "KeyD") input.setRight(false)
  }
  window.addEventListener("keydown", down)
  window.addEventListener("keyup", up)
  return () => {
    window.removeEventListener("keydown", down)
    window.removeEventListener("keyup", up)
  }
}

export function clampX(x: number) {
  return Math.min(PLAY_X_MAX, Math.max(PLAY_X_MIN, x))
}
```

- [ ] **Step 2: Implement `Rocket.tsx` with `useFrame` + ref (comment golden rule)**

```tsx
"use client"

import { useFrame } from "@react-three/fiber"
import { useRef } from "react"
import type { Mesh } from "three"
import { clampX, input } from "./input"

const MOVE_SPEED = 6 // world units / second

/** GOLDEN RULE: player position updates here — never via useState each frame. */
export function Rocket({ launched }: { launched: boolean }) {
  const ref = useRef<Mesh>(null)

  useFrame((_, dt) => {
    const mesh = ref.current
    if (!mesh || !launched) return
    mesh.position.x = clampX(mesh.position.x + input.axisX() * MOVE_SPEED * dt)
  })

  return (
    <mesh ref={ref} position={[0, -1.5, 0]}>
      <coneGeometry args={[0.35, 1.2, 8]} />
      <meshStandardMaterial color="#38bdf8" />
    </mesh>
  )
}
```

- [ ] **Step 3: Bind keyboard in `GameCanvas` / session wrapper; render `<Rocket launched />` from Scene**

Add `useEffect(() => bindKeyboard(), [])` in `GameCanvas` (client). Pass `launched` via a tiny module flag or props from `GameSession` (Task 8). For Task 7 alone, hardcode `launched={true}` in Scene for `/dev/scene`.

- [ ] **Step 4: Manual verify** — arrows move cone on X; no React re-renders required for movement.

- [ ] **Step 5: Commit**

```bash
git add components/game/Rocket.tsx components/game/input.ts components/game/Scene.tsx components/game/GameCanvas.tsx
git commit -m "feat(game): add rocket X movement via useFrame refs"
```

---

### Task 8: Hazards pool + collision + screen shell cutover

**Files:**
- Create: `components/game/Hazards.tsx`
- Create: `components/game/GameSession.tsx`
- Create: `components/game/gameState.ts` (mutable session snapshot for HUD)
- Modify: `app/page.tsx` (replace v1 loop with shell)
- Modify: `components/game/Scene.tsx`

- [ ] **Step 1: Mutable session store for HUD (polled / subscribed lightly)**

```ts
// components/game/gameState.ts
import type { AchievementId, GameScreen } from "@/lib/game/types"

export interface SessionSnapshot {
  screen: GameScreen
  score: number
  gameTimeMs: number
  hasShield: boolean
  launched: boolean
  achievements: AchievementId[]
}

let snapshot: SessionSnapshot = {
  screen: "home",
  score: 0,
  gameTimeMs: 0,
  hasShield: false,
  launched: false,
  achievements: [],
}

const listeners = new Set<() => void>()

export function getSnapshot() {
  return snapshot
}

export function patchSnapshot(p: Partial<SessionSnapshot>) {
  snapshot = { ...snapshot, ...p }
  listeners.forEach((l) => l())
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function resetSession() {
  patchSnapshot({
    screen: "home",
    score: 0,
    gameTimeMs: 0,
    hasShield: false,
    launched: false,
    achievements: [],
  })
}
```

- [ ] **Step 2: Implement pooled hazards in `Hazards.tsx`**

Requirements inside `useFrame`:
- After `SPAWN_DELAY_MS` and `launched`, roll `Math.random() < difficulty.spawnChance`.
- Bias ~70% junk, else mate/empanada; rare shield (~5% of non-junk).
- Move hazards with `scrollSpeed * dt` along **-Y** (falling toward rocket).
- Vary spawn `z` in `[-2, 2]` for depth read; collision only if `|hazard.z - player.z| < 0.75` (play lane).
- On junk hit: if shield → clear shield; else `screen = gameOver`.
- On mate/empanada: add score constants; flag `collectedMate`.
- On shield pickup: `hasShield = true`.
- At `gameTimeMs >= GAME_DURATION_MS` → `screen = win`.

Use a fixed array of N meshes (e.g. 32) with `active` flags — do not `setState` per spawn.

- [ ] **Step 3: `GameSession.tsx`** mounts canvas + starts time accumulation when `screen === "playing"`.

- [ ] **Step 4: Rewrite `app/page.tsx`** to:
  - `home`: logo, curiosity (`pickCuriosity`), high scores (`loadHighScores`), Start button → `patchSnapshot({ screen: "playing" })`
  - `playing`: `<GameSession />` + HUD overlay
  - `gameOver` / `win`: submit score, show achievements via `checkAchievements`, replay/home

Port visual styling from v1 home/end cards (Tailwind) where possible; delete the old rAF DOM entity loop.

- [ ] **Step 5: Manual playtest** — die to junk, collect items, reach win by temporarily setting `GAME_DURATION_MS = 5000` locally then revert.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/game lib/game
git commit -m "feat(game): cut over to R3F loop with hazards and screens"
```

---

### Task 9: HUD + mobile + orientation

**Files:**
- Create: `components/hud/Hud.tsx`
- Move/adapt: `components/mobile-controls.tsx` → `components/hud/MobileControls.tsx` (wire to `input.setLeft/Right` + `pressLaunch`)
- Move/adapt: mute + orientation into `components/hud/`

- [ ] **Step 1: `Hud.tsx`** uses `subscribe`/`getSnapshot` (or `useSyncExternalStore`) to show score, mm:ss timer, shield icon.

- [ ] **Step 2: Wire mobile buttons to `input` module** (not React game positions).

- [ ] **Step 3: Pause simulation when portrait warning active** (flag on snapshot or skip `useFrame` updates).

- [ ] **Step 4: Manual verify on narrow viewport / DevTools mobile.

- [ ] **Step 5: Commit**

```bash
git add components/hud app/page.tsx components/game
git commit -m "feat(game): add HUD and mobile controls for v2"
```

---

### Task 10: Low-poly assets + effects

**Files:**
- Add: `public/models/rocket.glb`, `junk-a.glb`, `junk-b.glb`, `iss.glb`, `mate.glb`, `empanada.glb`, `shield.glb` (CC0 or AI-assisted, size-budget each < ~1MB)
- Modify: `Rocket.tsx`, `Hazards.tsx`, `Scene.tsx` to `useGLTF` from drei with fallback primitives if missing
- Create: `components/game/Effects.tsx` (exhaust + win burst)

- [ ] **Step 1: Drop GLBs into `public/models/`** (or generate placeholders). Prefetch with `useGLTF.preload`.

- [ ] **Step 2: Swap cone/box meshes for GLTFs; keep same transforms/radii.**

- [ ] **Step 3: Exhaust particles while `launched`; burst on win.**

- [ ] **Step 4: Optional light bloom via `@react-three/postprocessing` — only if bundle cost OK; disable on mobile (`gl` tier or width check).

- [ ] **Step 5: Commit**

```bash
git add public/models components/game
git commit -m "feat(game): add low-poly GLBs and motion effects"
```

---

### Task 11: Audio module (no commercial hotlinks)

**Files:**
- Create: `lib/game/audio.ts`
- Add: `public/audio/` SFX (short ogg/mp3 you own or CC0) — BGM optional CC0
- Modify: mute button + first-gesture unlock
- Remove Interstellar remote URL from old `sound-context.tsx` usage

- [ ] **Step 1: Implement `audio.ts`** with `unlock()`, `playSfx('collect'|'hit'|'win'|'shield')`, `setMuted`, `playBgm` using `Audio` / Web Audio.

- [ ] **Step 2: Call SFX from hazard collision paths; BGM on enter playing.**

- [ ] **Step 3: Manual mute test.

- [ ] **Step 4: Commit**

```bash
git add lib/game/audio.ts public/audio components
git commit -m "feat(game): add project-owned audio helpers"
```

---

### Task 12: Workshop docs (modules 0–7)

**Files:**
- Create: `docs/workshop/00-setup.md` … `docs/workshop/07-deploy.md`

Each file: goal, Cursor prompt examples, files to inspect, “explain the diff” checkpoint, success check.

- [ ] **Step 1: Write module 00–02** (setup, hello R3F, rocket + golden rule).

- [ ] **Step 2: Write module 03–05** (hazards, score/HUD, win timer).

- [ ] **Step 3: Write module 06–07** (extras, Vercel deploy).

- [ ] **Step 4: Add `docs/workshop/README.md` index linking all modules + stack rationale (why R3F + Cursor for ages 12–18).

- [ ] **Step 5: Commit**

```bash
git add docs/workshop
git commit -m "docs: add Cursor-first workshop modules 0-7"
```

---

### Task 13: Production harden + deploy

**Files:**
- Modify: `package.json` name → `noe-al-espacio`
- Modify: `app/layout.tsx` metadata for v2
- Remove or gate `/dev/scene` (delete before prod or leave as hidden workshop aid)
- Ensure `npm run build` succeeds

- [ ] **Step 1: Full test + build**

```bash
npm test
npm run build
```

Expected: all unit tests PASS; Next build succeeds.

- [ ] **Step 2: Deploy**

```bash
vercel --prod
# or link to existing v0-noe-al-espacio-game / new v2 project
```

- [ ] **Step 3: Smoke test production URL** — launch, die, win (short duration branch if needed), mute, mobile landscape.

- [ ] **Step 4: Commit any final metadata tweaks**

```bash
git add package.json app/layout.tsx
git commit -m "chore: prepare noe-al-espacio v2 for production"
```

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| R3F + Next + Drei + TS + Vercel | 1, 6, 13 |
| Side-scroll depth, fixed gentle perspective | 6–8 |
| Low-poly art | 10 |
| Core loop scores / 180s / ISS win | 2, 8 |
| Difficulty ramp | 2, 8 |
| Shield | 8 |
| Curiosities + achievements | 5, 8 |
| HUD + mobile landscape | 9 |
| No hot-path React entity re-renders | 7–8 (`useFrame` + pools) |
| No commercial BGM hotlink | 11 |
| Workshop modules 0–7 | 12 |
| `noe_v2_high_scores` | 4 |

---

## Self-review notes

- No TBD steps; pure logic is TDD’d before canvas work.
- Types (`HazardKind`, `AchievementId`, `Difficulty`) stay consistent across tasks.
- `/dev/scene` is an intentional bridge and removed/gated in Task 13.
- GLB acquisition is explicit in Task 10; primitives keep Tasks 6–9 unblocked.
