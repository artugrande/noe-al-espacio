export type Locale = "es" | "en"

export type MessageKey =
  | "missionArgentina"
  | "homeTagline"
  | "startGame"
  | "curiosity"
  | "workshopMode"
  | "workshopTitle"
  | "workshopBody"
  | "workshopCta"
  | "madeInSalta"
  | "score"
  | "time"
  | "objective"
  | "shield"
  | "shieldActive"
  | "boost"
  | "boostActive"
  | "magnet"
  | "magnetActive"
  | "turbulence"
  | "backHome"
  | "pressSpace"
  | "controlsHint"
  | "missionComplete"
  | "congratsTitle"
  | "congratsBody"
  | "yourScore"
  | "missionEnded"
  | "finalScore"
  | "achievements"
  | "playAgain"
  | "mainMenu"
  | "leaderboardTitle"
  | "leaderboardGlobal"
  | "leaderboardLocal"
  | "leaderboardLoading"
  | "leaderboardEmpty"
  | "publishNameLabel"
  | "publishPlaceholder"
  | "publishButton"
  | "publishing"
  | "publishedGlobal"
  | "publishedLocal"
  | "muteOn"
  | "muteOff"
  | "rotateTitle"
  | "rotateBody"
  | "logoAlt"
  | "langEs"
  | "langEn"
  | "toastNearMiss"
  | "toastMagnet"
  | "moveLeft"
  | "moveRight"
  | "launch"
  | "achievement.first_mate"
  | "achievement.survived_90s"
  | "achievement.first_shield"
  | "achievement.first_boost"
  | "achievement.first_magnet"
  | "achievement.combo_x4"
  | "achievement.mate_objective"
  | "curiosity.0.title"
  | "curiosity.0.body"
  | "curiosity.1.title"
  | "curiosity.1.body"
  | "curiosity.2.title"
  | "curiosity.2.body"

const es = {
  missionArgentina: "Misión Argentina",
  homeTagline:
    "Esquivá oleadas, armá combos, juntá mates con el 🧲 imán, y llegá a la estación.",
  startGame: "🚀 Iniciar Juego",
  curiosity: "Dato curioso",
  workshopMode: "Modo taller",
  workshopTitle: "Construí tu propio juego",
  workshopBody:
    "Guía educativa: Cursor, stack, prompts, arquitectura y el paso a paso para armar tu misión — en modo presentación o lectura. Inspirado en astronautas argentinos.",
  workshopCta: "Abrir la guía →",
  madeInSalta: "Hecho en Salta por",
  score: "Puntaje",
  time: "Tiempo",
  objective: "Meta",
  shield: "Escudo",
  shieldActive: "🛡️ Activo",
  boost: "Impulso",
  boostActive: "⚡ ¡RÁPIDO!",
  magnet: "Imán",
  magnetActive: "🧲 ¡ATRÁE!",
  turbulence: "Turbulencia",
  backHome: "Volver al inicio",
  pressSpace: "Presioná Espacio para despegar",
  controlsHint: "A/D · 🛡️ escudo · ⚡ impulso · 🧲 imán · 🧉 meta · near-miss",
  missionComplete: "Misión cumplida",
  congratsTitle: "¡Felicidades!",
  congratsBody:
    "Lograste llevar a NOE hasta la estación espacial y completar su misión.",
  yourScore: "Tu puntaje",
  missionEnded: "Fin de la misión",
  finalScore: "Puntaje final",
  achievements: "Logros desbloqueados",
  playAgain: "Jugar de nuevo",
  mainMenu: "Menú inicial",
  leaderboardTitle: "🏆 Mejores puntajes",
  leaderboardGlobal: "Global",
  leaderboardLocal: "Este dispositivo",
  leaderboardLoading: "Cargando…",
  leaderboardEmpty: "¡Sé la primera persona en entrar al ranking!",
  publishNameLabel: "Tu nombre para el ranking global",
  publishPlaceholder: "Ej: Artu",
  publishButton: "Publicar en el ranking",
  publishing: "Publicando…",
  publishedGlobal: "¡Puntaje publicado en el ranking global!",
  publishedLocal:
    "Guardado en este dispositivo (ranking global no disponible).",
  muteOn: "Activar soundtrack",
  muteOff: "Silenciar soundtrack",
  rotateTitle: "Rotá el teléfono",
  rotateBody: "Jugá en horizontal para ver toda la misión.",
  logoAlt: "Logo de Noe al Espacio: cohete blanco con mate y estrellas",
  langEs: "ES",
  langEn: "EN",
  toastNearMiss: "¡Wow! Estuvo cerca",
  toastMagnet: "🧲 ¡Imán activado!",
  moveLeft: "Mover a la izquierda",
  moveRight: "Mover a la derecha",
  launch: "Despegar",
  "achievement.first_mate": "Primer mate",
  "achievement.survived_90s": "90 segundos en órbita",
  "achievement.first_shield": "Escudo al rescate",
  "achievement.first_boost": "Sobreviví el impulso",
  "achievement.first_magnet": "Imán de mates",
  "achievement.combo_x4": "Combo x4",
  "achievement.mate_objective": "5 mates en una misión",
  "curiosity.0.title": "Falcon 9",
  "curiosity.0.body":
    "El Falcon 9 de SpaceX puede aterrizar y reutilizarse, bajando el costo de llegar al espacio.",
  "curiosity.1.title": "Basura espacial",
  "curiosity.1.body":
    "Hay miles de fragmentos orbitando la Tierra; por eso esquivar basura en el juego no es solo ficción.",
  "curiosity.2.title": "¿Quién es Noe Castro?",
  "curiosity.2.body":
    "Noel de Castro, ingeniera de Salta, fue seleccionada por Axiom Space como astronauta argentina.",
} as const satisfies Record<MessageKey, string>

const en: Record<MessageKey, string> = {
  missionArgentina: "Argentine Mission",
  homeTagline:
    "Dodge waves, build combos, grab mates with the 🧲 magnet, and reach the station.",
  startGame: "🚀 Start Game",
  curiosity: "Fun fact",
  workshopMode: "Workshop mode",
  workshopTitle: "Build your own game",
  workshopBody:
    "Educational guide: Cursor, stack, prompts, architecture, and a step-by-step path to build your mission — slide or scroll mode. Inspired by Argentine astronauts.",
  workshopCta: "Open the guide →",
  madeInSalta: "Made in Salta by",
  score: "Score",
  time: "Time",
  objective: "Goal",
  shield: "Shield",
  shieldActive: "🛡️ Active",
  boost: "Boost",
  boostActive: "⚡ FAST!",
  magnet: "Magnet",
  magnetActive: "🧲 PULL!",
  turbulence: "Turbulence",
  backHome: "Back to home",
  pressSpace: "Press Space to launch",
  controlsHint: "A/D · 🛡️ shield · ⚡ boost · 🧲 magnet · 🧉 goal · near-miss",
  missionComplete: "Mission complete",
  congratsTitle: "Congratulations!",
  congratsBody:
    "You got NOE to the space station and completed her mission.",
  yourScore: "Your score",
  missionEnded: "Mission over",
  finalScore: "Final score",
  achievements: "Achievements unlocked",
  playAgain: "Play again",
  mainMenu: "Main menu",
  leaderboardTitle: "🏆 High scores",
  leaderboardGlobal: "Global",
  leaderboardLocal: "This device",
  leaderboardLoading: "Loading…",
  leaderboardEmpty: "Be the first on the leaderboard!",
  publishNameLabel: "Your name for the global board",
  publishPlaceholder: "e.g. Artu",
  publishButton: "Publish score",
  publishing: "Publishing…",
  publishedGlobal: "Score published on the global leaderboard!",
  publishedLocal: "Saved on this device (global board unavailable).",
  muteOn: "Unmute soundtrack",
  muteOff: "Mute soundtrack",
  rotateTitle: "Rotate your phone",
  rotateBody: "Play in landscape to see the full mission.",
  logoAlt: "Noe al Espacio logo: white rocket with mate and stars",
  langEs: "ES",
  langEn: "EN",
  toastNearMiss: "Whoa! That was close",
  toastMagnet: "🧲 Magnet online!",
  moveLeft: "Move left",
  moveRight: "Move right",
  launch: "Launch",
  "achievement.first_mate": "First mate",
  "achievement.survived_90s": "90 seconds in orbit",
  "achievement.first_shield": "Shield save",
  "achievement.first_boost": "Survived the boost",
  "achievement.first_magnet": "Mate magnet",
  "achievement.combo_x4": "Combo x4",
  "achievement.mate_objective": "5 mates in one run",
  "curiosity.0.title": "Falcon 9",
  "curiosity.0.body":
    "SpaceX’s Falcon 9 can land and fly again, cutting the cost of getting to space.",
  "curiosity.1.title": "Space junk",
  "curiosity.1.body":
    "Thousands of fragments orbit Earth — dodging debris in the game isn’t pure fiction.",
  "curiosity.2.title": "Who is Noe Castro?",
  "curiosity.2.body":
    "Noel de Castro, an engineer from Salta, was selected by Axiom Space as an Argentine astronaut.",
}

export const messages: Record<Locale, Record<MessageKey, string>> = {
  es,
  en,
}
