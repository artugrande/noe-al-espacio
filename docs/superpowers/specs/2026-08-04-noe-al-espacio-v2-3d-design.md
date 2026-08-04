# Noe al Espacio v2 (3D) — Design Spec

**Date:** 2026-08-04  
**Status:** Approved for planning  
**Product + research goal:** Ship a stronger 3D web game **and** define a Cursor-first teaching stack for teens (12–18) building 3D games.

---

## 1. Context (v1 today)

v1 is a 2D dodge/collect tribute to Argentine astronaut Noel de Castro (“Noe”).

| Area | Current state |
|------|----------------|
| Loop | Launch rocket → avoid space junk → collect mate (+10) / empanada (+15) → survive 3 minutes → reach ISS |
| Stack | Next.js 15, React 19, Tailwind, DOM+CSS sprites (no canvas/WebGL) |
| Loop location | Almost entirely `app/page.tsx` via `requestAnimationFrame` + React re-render each frame |
| Deploy | Vercel (`v0-noe-al-espacio-game`) |
| Repo | https://github.com/artugrande/noe-al-espacio |

**Keep from v1:** theme, educational curiosities, scoring fantasy, mobile landscape + mute, ISS win condition, high scores (local).

**Replace:** DOM entity rendering, emoji collectibles, hot-path React state, remote Interstellar BGM dependency.

---

## 2. Goals

### Product
- Playable **3D** side-scroller with clearly better low-poly visuals than v1.
- Same core fantasy + **2–3** gameplay upgrades (see §5).
- Runs in the **browser**; deployable to **Vercel**.
- Desktop keyboard + mobile landscape touch.

### Teaching / research
- Double as the **reference project** for workshops where students (12–18) use **Cursor** like a senior: chat, read diffs, touch real TypeScript.
- Stack must be file-based and agent-friendly (not block-only tools, not editor-locked engines as the primary path).
- Curriculum modules map 1:1 onto the repo structure (see §7).

### Non-goals (v2)
- Multiplayer, accounts, online leaderboards
- Unity / Unreal / Godot as the primary runtime
- Photorealism, complex skeletal animation, open world
- Backend / database
- Full i18n (Spanish first; English optional later)

---

## 3. Decisions locked

| Decision | Choice |
|----------|--------|
| Dual purpose | Product quality **and** pedagogy at equal weight |
| Audience | Ages **12–18** (mixed profiles) |
| Authoring | **Cursor-first** workshops (real language + agent) |
| Runtime | **Web** (shareable link) |
| Camera / feel | **Side-scroll with depth** (v1 layout + Z layers / parallax meshes) |
| Art direction | **Low-poly / polished cartoon** |
| Gameplay delta | Same loop + **ramp difficulty, shield power-up, curiosities/light achievements** |
| Stack | **Next.js + React Three Fiber + Drei + TypeScript + GLB + Vercel** |
| Repo shape | Single Next app (`components/game` + `lib/game`), not a monorepo |

**Rejected alternatives:** vanilla Three+Vite (clearer loop, weaker continuity), Babylon.js (heavier than needed), Godot/Unity (not Cursor-primary / not web-first for this workshop).

---

## 4. Architecture

### Principle
**UI in React; simulation in the R3F frame loop.** Hot game state lives in refs / module state updated inside `useFrame`. React state is for screens, HUD, and mute only.

### Suggested layout

```
app/
  page.tsx                 # screen shell: home | playing | gameOver | win
  layout.tsx               # fonts, metadata, providers
components/
  game/
    GameCanvas.tsx         # R3F <Canvas>, DPR/perf caps
    Scene.tsx              # lights, starfield, layers, ISS
    Rocket.tsx             # player mesh + input → position
    Hazards.tsx            # junk / collectibles / shield (pooled)
    Effects.tsx            # exhaust, hit flash, win confetti
  hud/
    Hud.tsx                # score, timer, shield icon (DOM overlay)
    MobileControls.tsx     # touch (evolved from v1)
    MuteButton.tsx
    OrientationWarning.tsx
lib/game/
  constants.ts             # durations, speeds, spawn rates
  difficulty.ts            # ramp curve over game time
  collisions.ts            # sphere/AABB tests in world units
  scores.ts                # localStorage top 5
  curiosidades.ts          # educational snippets + achievement ids
  audio.ts                 # SFX + BGM helpers (no hotlinked copyright tracks)
public/models/             # *.glb low-poly
public/audio/              # optional local SFX/BGM
docs/
  workshop/                # module guides (filled during implementation)
  superpowers/specs/       # this document
```

### Runtime flow
1. Home (React) → Start → mount `GameCanvas`.
2. Launch gate → playing: `useFrame` updates positions, spawns, collisions.
3. Hit junk without shield → `gameOver`. Hit with shield → consume shield.
4. `gameTime >= GAME_DURATION` → show ISS emphasis → `win`.
5. Persist score if top 5.

### Performance budgets (targets)
- 60 fps desktop, ≥30 fps mid-range mobile landscape.
- Cap pixel ratio (e.g. `dpr={[1, 1.5]}`).
- Object pooling for hazards (no per-frame React list thrash).
- Bloom optional; disable or reduce on low GPU / mobile.

---

## 5. Gameplay v2

### Core (unchanged fantasy)
| Element | Spec |
|---------|------|
| Goal | Survive ~**180s** after launch → reach ISS |
| Fail | Collision with **junk** (unless shield active) |
| Mate | **+10** |
| Empanada | **+15** |
| High scores | Top **5**, `localStorage` key **`noe_v2_high_scores`** (v1 key untouched) |

### Depth presentation
- Camera: **fixed gentle perspective** side view (not free-fly; not orthographic) so depth reads clearly while controls stay 2D-simple.
- Player moves on **X only** (same as v1). Optional slight visual bob on Y is cosmetic only and does not affect collisions.
- Hazards spawn with **Z variation** (near/far layers) for parallax; collision uses a simplified volume on the play lane so fairness stays clear for kids.

### Extras
1. **Difficulty ramp** — spawn rate and fall/scroll speed increase with `gameTime` (tunable curve in `difficulty.ts`).
2. **Shield power-up** — rare spawn; absorbs one junk hit; visible cue on rocket + HUD.
3. **Curiosities + light achievements** — reuse/expand `CURIOSIDADES`; unlock simple flags (e.g. first mate, survived 90s) shown on end screens / home.

### Controls
- Desktop: Arrow keys / A–D, Space to launch, Esc → home (optional).
- Mobile: landscape required; on-screen left/right + launch.

---

## 6. Art & audio

### Art
- Low-poly cartoon; strong colors; Argentine accents (mate, empanada).
- GLB set: rocket, 2–3 junk variants, ISS, mate, empanada, shield pickup.
- Pipeline: CC0 / AI-assisted models, manually consistency-checked; optional Blender export track for advanced students (16–18), not blocking.
- Stars + rocket exhaust + win burst via simple particle systems.

### Audio
- Local or project-owned BGM/SFX (no third-party hotlink of commercial tracks).
- Mute persists; unlock audio after first gesture (browser policy).

---

## 7. Workshop curriculum (Cursor-first)

Same repo; modules build the game in order:

| Module | Student outcome |
|--------|-----------------|
| 0 | Clone/open in Cursor, `npm run dev`, orient in folders with the agent |
| 1 | Empty R3F scene: light + space + primitive |
| 2 | Rocket GLB + X movement (**teach: game state ≠ React state**) |
| 3 | Junk spawn + collision → game over |
| 4 | Collectibles + score + HUD |
| 5 | Timer + ISS + win screen |
| 6 | Shield + difficulty ramp + one achievement |
| 7 | Deploy to Vercel; share link |

**Facilitation rule:** students must explain the diff the agent produced before merging the next prompt.

Workshop markdown under `docs/workshop/` is part of implementation, not a separate product.

---

## 8. Success criteria

- [ ] 3D low-poly side-scroller playable on desktop and mobile landscape
- [ ] Core loop + shield + difficulty ramp + ≥1 achievement/curiosity hook
- [ ] Production deploy on Vercel
- [ ] Modules 0–7 documented enough to run a Cursor workshop
- [ ] No hot-path gameplay driven by React re-renders of every entity

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Students put positions in `useState` | Module 2 drill + lint/comment “golden rule” in `Rocket.tsx` |
| Mobile GPU too weak | DPR cap, fewer particles, bloom off, simpler materials |
| Asset inconsistency | Small locked kit of GLBs before workshop day |
| Scope creep (new modes) | Non-goals list; extras capped at the three named above |

---

## 10. Implementation next step

After this spec is reviewed, create an implementation plan (`writing-plans`) that sequences: scaffold R3F in the existing Next app → extract/replace v1 loop → assets → extras → workshop docs → deploy.
