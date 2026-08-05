export const GAME_DURATION_MS = 180_000
export const SPAWN_DELAY_MS = 10_000
export const BASE_SPAWN_CHANCE = 0.04
export const BASE_SCROLL_SPEED = 2.15
export const MAX_SPAWN_CHANCE = 0.11
export const MAX_SCROLL_SPEED = 3.8
export const SCORE_MATE = 10
export const SCORE_EMPANADA = 15
export const HIGH_SCORES_KEY = "noe_v2_high_scores"
export const HIGH_SCORES_LIMIT = 5
/** Player hitbox — matches compact white rocket. */
export const PLAYER_RADIUS = 0.32
/** Default junk radius — pickups use larger collect radii in Hazards. */
export const HAZARD_RADIUS = 0.22
export const PICKUP_RADIUS = 0.42
/** Wider lane so movement reaches near the screen edges. */
export const PLAY_X_MIN = -6.8
export const PLAY_X_MAX = 6.8
/** Celeste sky → deep space fade after launch. */
export const ATMOSPHERE_FADE_MS = 40_000
/** Dense launch smoke window. */
export const LAUNCH_SMOKE_MS = 9_000
/** How fast the earth scenery scrolls away under the rocket. */
export const LAUNCH_SCROLL_SPEED = 1.35
/** Clear lane before docking: stop spawns + remove hazards. */
export const ARRIVAL_CLEAR_MS = 4_000
/** Impulso power-up duration. */
export const BOOST_DURATION_MS = 5_000
export const BOOST_MOVE_MULT = 1.7
export const BOOST_SCROLL_MULT = 0.72
