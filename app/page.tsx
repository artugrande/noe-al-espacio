"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Trophy, ExternalLink, X } from "lucide-react"
import { MuteButton } from "@/components/mute-button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useSoundContext } from "@/components/sound-context"
import { MobileControls } from "@/components/mobile-controls"
import { OrientationWarning } from "@/components/orientation-warning"

// Rutas a los assets en la carpeta public
const logo = "/images/noealespacio.png"
const rocketSprite = "/images/coheteanimado.png"
const spaceJunkImg = "/images/basuraespacial.png"
const spaceStationImg = "/images/estacionespacial.png"
const launchpadBg = "/images/bgnuevofinal.png"
const spaceBackground = "/images/space-background.jpg"

type GameState = "loading" | "home" | "playing" | "gameOver" | "win"
type GameObject = {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: "junk" | "mate" | "empanada"
}

type FloatingText = {
  id: number
  x: number
  y: number
  text: string
  opacity: number
}

type Confetti = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
}

const CURIOSIDADES = [
  {
    title: "Sobre el cohete Falcon 9 (SpaceX)",
    points: [
      "Cohete reutilizable de dos etapas fabricado por SpaceX.",
      "Transporta astronautas y carga hacia la Estación Espacial Internacional.",
      "Su primera etapa aterriza de nuevo en la Tierra para reducir residuos espaciales.",
    ],
  },
  {
    title: "Sobre la basura espacial",
    points: [
      "Son restos de satélites, cohetes y fragmentos que orbitan el planeta.",
      "Incluso objetos pequeños pueden dañar naves activas por la velocidad.",
      "Es un problema real para los astronautas en órbita.",
    ],
  },
  {
    title: "¿Quién es Noe Castro?",
    points: [
      "Ingeniera biomédica de Salta, Argentina.",
      "Seleccionada por Axiom Space para convertirse en la primera mujer astronauta argentina.",
      "Entrenada en vuelos simulados, microgravedad y trajes espaciales.",
      "Su misión busca inspirar a jóvenes en ciencia y tecnología en toda Latinoamérica.",
    ],
  },
]

const getRandomCuriosity = () => {
  return CURIOSIDADES[Math.floor(Math.random() * CURIOSIDADES.length)]
}

const GAME_DURATION_MS = 3 * 60 * 1000 // 3 minutes

export default function NoeAlEspacioGame() {
  const [gameState, setGameState] = useState<GameState>("loading")
  const [score, setScore] = useState(0)
  const [highScores, setHighScores] = useState<number[]>([])
  const [rocketLaunched, setRocketLaunched] = useState(false)
  const [randomCuriosity, setRandomCuriosity] = useState(getRandomCuriosity())
  const [isGameLoading, setIsGameLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(true)
  const [gamePausedByOrientation, setGamePausedByOrientation] = useState(false)

  // Mobile controls state
  const [isMovingLeft, setIsMovingLeft] = useState(false)
  const [isMovingRight, setIsMovingRight] = useState(false)

  // Sound context
  const { isMuted, audio, isAudioReady, initializeAudio } = useSoundContext()
  const [userHasInteracted, setUserHasInteracted] = useState(false)

  // Tamaños adaptados para móvil y desktop
  const ROCKET_WIDTH = isMobile ? 33 : 100
  const ROCKET_HEIGHT = isMobile ? 80 : 240
  const ROCKET_BOTTOM_POSITION = isMobile ? 50 : 150

  // Game-specific state - rocket starts centered horizontally
  const playerPosition = useRef({ x: 50, y: ROCKET_BOTTOM_POSITION })
  const targetPosition = useRef({ x: 50, y: ROCKET_BOTTOM_POSITION })
  const gameObjects = useRef<GameObject[]>([])
  const floatingTexts = useRef<FloatingText[]>([])
  const confetti = useRef<Confetti[]>([])
  const gameTime = useRef(0)
  const backgroundY = useRef(0)
  const keysPressed = useRef<{ [key: string]: boolean }>({})
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const animationFrameId = useRef<number>()
  const rocketFrame = useRef(0)
  const frameCounter = useRef(0)
  const orientationLocked = useRef(false)

  // Audio context for sound effects
  const audioContextRef = useRef<AudioContext | null>(null)

  // Detect mobile device and orientation
  useEffect(() => {
    const checkMobileAndOrientation = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      const isCurrentlyLandscape = window.innerWidth > window.innerHeight

      setIsMobile(isMobileDevice)
      setIsLandscape(isCurrentlyLandscape)

      // Si es móvil y no está en landscape, pausar el juego
      if (isMobileDevice && !isCurrentlyLandscape && gameState === "playing") {
        setGamePausedByOrientation(true)
      } else if (isMobileDevice && isCurrentlyLandscape && gamePausedByOrientation) {
        setGamePausedByOrientation(false)
      }

      // Actualizar posición del cohete cuando cambia el tipo de dispositivo
      playerPosition.current.y = isMobileDevice ? 50 : 150
      targetPosition.current.y = isMobileDevice ? 50 : 150
    }

    checkMobileAndOrientation()
    window.addEventListener("resize", checkMobileAndOrientation)
    window.addEventListener("orientationchange", checkMobileAndOrientation)

    return () => {
      window.removeEventListener("resize", checkMobileAndOrientation)
      window.removeEventListener("orientationchange", checkMobileAndOrientation)
    }
  }, [gameState, gamePausedByOrientation])

  const initializeAudioContext = useCallback(() => {
    if (typeof window !== "undefined" && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn("Audio context initialization failed:", error)
      }
    }
  }, [])

  // Initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState("home")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Mobile controls handlers
  const handleMoveLeft = useCallback(() => {
    setIsMovingLeft(true)
    keysPressed.current["ArrowLeft"] = true
  }, [])

  const handleMoveRight = useCallback(() => {
    setIsMovingRight(true)
    keysPressed.current["ArrowRight"] = true
  }, [])

  const handleStopMove = useCallback(() => {
    setIsMovingLeft(false)
    setIsMovingRight(false)
    keysPressed.current["ArrowLeft"] = false
    keysPressed.current["ArrowRight"] = false
  }, [])

  const handleLaunch = useCallback(() => {
    if (!rocketLaunched) {
      keysPressed.current[" "] = true
      setTimeout(() => {
        keysPressed.current[" "] = false
      }, 100)
    }
  }, [rocketLaunched])

  // Simple sound generation functions
  const playBeep = useCallback(
    (frequency: number, duration: number, type: "sine" | "square" | "triangle" = "sine") => {
      if (!audioContextRef.current || isMuted) return

      try {
        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)

        oscillator.frequency.value = frequency
        oscillator.type = type

        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

        oscillator.start(audioContextRef.current.currentTime)
        oscillator.stop(audioContextRef.current.currentTime + duration)
      } catch (error) {
        console.warn("Error playing beep:", error)
      }
    },
    [isMuted],
  )

  const playCollectSound = useCallback(() => {
    playBeep(800, 0.2, "sine")
    setTimeout(() => playBeep(1000, 0.2, "sine"), 100)
  }, [playBeep])

  const playCollisionSound = useCallback(() => {
    playBeep(200, 0.5, "square")
  }, [playBeep])

  const playVictorySound = useCallback(() => {
    if (isMuted) return
    // Victory fanfare
    const notes = [523, 659, 784, 1047] // C, E, G, C
    notes.forEach((note, index) => {
      setTimeout(() => playBeep(note, 0.5, "sine"), index * 200)
    })
  }, [playBeep, isMuted])

  const createConfetti = useCallback(() => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]
    for (let i = 0; i < 50; i++) {
      confetti.current.push({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: -10,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      })
    }
  }, [])

  useEffect(() => {
    initializeAudioContext()
    const savedHighScores = localStorage.getItem("noe_high_scores")
    if (savedHighScores) {
      setHighScores(JSON.parse(savedHighScores))
    }
  }, [initializeAudioContext])

  const updateHighScores = useCallback(
    (newScore: number) => {
      const newHighScores = [...highScores, newScore].sort((a, b) => b - a).slice(0, 5)
      setHighScores(newHighScores)
      localStorage.setItem("noe_high_scores", JSON.stringify(newHighScores))
    },
    [highScores],
  )

  const resetGame = useCallback(() => {
    // Cancel any running animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }

    playerPosition.current = { x: 50, y: isMobile ? 50 : 150 }
    targetPosition.current = { x: 50, y: isMobile ? 50 : 150 }
    gameObjects.current = []
    floatingTexts.current = []
    confetti.current = []
    gameTime.current = 0
    backgroundY.current = 0
    rocketFrame.current = 0
    frameCounter.current = 0
    keysPressed.current = {}
    setScore(0)
    setRocketLaunched(false)
    setIsMovingLeft(false)
    setIsMovingRight(false)
    setGamePausedByOrientation(false)
    setRandomCuriosity(getRandomCuriosity())
  }, [isMobile])

  const startGame = () => {
    setIsGameLoading(true)
    resetGame()

    setTimeout(() => {
      setIsGameLoading(false)
      setGameState("playing")
    }, 1500)
  }

  const goToHome = () => {
    resetGame()
    setGameState("home")
  }

  const addFloatingText = (x: number, y: number, points: number) => {
    floatingTexts.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text: `+${points}`,
      opacity: 1,
    })
  }

  const handleCollision = useCallback(
    (objType: string, objX: number, objY: number) => {
      if (objType === "junk") {
        playCollisionSound()
        setGameState("gameOver")
        updateHighScores(score)
      } else {
        playCollectSound()
        const points = objType === "mate" ? 10 : 15
        setScore((s) => s + points)
        addFloatingText(objX, objY, points)
      }
    },
    [score, updateHighScores, playCollisionSound, playCollectSound],
  )

  const gameLoop = useCallback(() => {
    // No ejecutar el loop si el juego está pausado por orientación
    if (gameState !== "playing" || gamePausedByOrientation) return

    const container = gameContainerRef.current
    if (!container) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Handle spacebar for launch
    if (keysPressed.current[" "] && !rocketLaunched) {
      setRocketLaunched(true)
    }

    // Handle Escape key to go to home (desktop only)
    if (keysPressed.current["Escape"] && !isMobile) {
      goToHome()
      return
    }

    // Player movement (only if launched) - smooth movement
    if (rocketLaunched) {
      const speed = isMobile ? 1.5 : 1.0
      if (keysPressed.current["ArrowLeft"] || keysPressed.current["a"] || isMovingLeft) {
        targetPosition.current.x = Math.max(0, targetPosition.current.x - speed)
      }
      if (keysPressed.current["ArrowRight"] || keysPressed.current["d"] || isMovingRight) {
        targetPosition.current.x = Math.min(
          100 - (ROCKET_WIDTH / containerWidth) * 100,
          targetPosition.current.x + speed,
        )
      }

      // Smooth interpolation to target position
      const lerpFactor = 0.15
      playerPosition.current.x += (targetPosition.current.x - playerPosition.current.x) * lerpFactor

      // Update rocket animation (continuous when launched)
      frameCounter.current++
      if (frameCounter.current % 5 === 0) {
        rocketFrame.current = ((rocketFrame.current + 1) % 3) + 1
      }

      // Background scroll and game time
      backgroundY.current += 0.8
      gameTime.current += 1000 / 60
    }

    // Spawn objects (only if launched and after 10 seconds)
    if (rocketLaunched && gameTime.current > 10000 && Math.random() < 0.03) {
      const type = Math.random() > 0.3 ? "junk" : Math.random() > 0.5 ? "mate" : "empanada"
      const objectSize = isMobile ? (type === "junk" ? 30 : 15) : type === "junk" ? 60 : 30

      gameObjects.current.push({
        id: Date.now() + Math.random(),
        x: Math.random() * 90,
        y: -10,
        width: objectSize,
        height: objectSize,
        type: type,
      })
    }

    // Calculate rocket position in pixels for collision detection
    const rocketRect = {
      x: (playerPosition.current.x / 100) * containerWidth,
      y: containerHeight - playerPosition.current.y - ROCKET_HEIGHT,
      width: ROCKET_WIDTH,
      height: ROCKET_HEIGHT,
    }

    gameObjects.current = gameObjects.current
      .map((obj) => ({ ...obj, y: obj.y + 0.8 }))
      .filter((obj) => {
        if (obj.y > 110) return false

        const objRect = {
          x: (obj.x / 100) * containerWidth,
          y: (obj.y / 100) * containerHeight,
          width: obj.width,
          height: obj.height,
        }

        // Hitboxes más generosos para móviles, especialmente para colectibles
        const rocketHitboxPadding = isMobile ? 5 : 10
        const objectHitboxPadding = isMobile ? (obj.type === "junk" ? 5 : 2) : 5

        const rocketHitbox = {
          x: rocketRect.x + rocketHitboxPadding,
          y: rocketRect.y + rocketHitboxPadding,
          width: rocketRect.width - rocketHitboxPadding * 2,
          height: rocketRect.height - rocketHitboxPadding * 2,
        }

        const objHitbox = {
          x: objRect.x + objectHitboxPadding,
          y: objRect.y + objectHitboxPadding,
          width: objRect.width - objectHitboxPadding * 2,
          height: objRect.height - objectHitboxPadding * 2,
        }

        // Detección de colisión más permisiva para colectibles en móviles
        const collisionBuffer = isMobile && obj.type !== "junk" ? 10 : 0

        if (
          rocketHitbox.x < objHitbox.x + objHitbox.width + collisionBuffer &&
          rocketHitbox.x + rocketHitbox.width + collisionBuffer > objHitbox.x &&
          rocketHitbox.y < objHitbox.y + objHitbox.height + collisionBuffer &&
          rocketHitbox.y + rocketHitbox.height + collisionBuffer > objHitbox.y
        ) {
          handleCollision(obj.type, obj.x, obj.y)
          return false
        }
        return true
      })

    // Update floating texts
    floatingTexts.current = floatingTexts.current
      .map((text) => ({
        ...text,
        y: text.y - 1,
        opacity: text.opacity - 0.02,
      }))
      .filter((text) => text.opacity > 0)

    // Update confetti
    confetti.current = confetti.current
      .map((particle) => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        rotation: particle.rotation + particle.rotationSpeed,
        vy: particle.vy + 0.1, // gravity
      }))
      .filter((particle) => particle.y < 110)

    // Win condition
    if (rocketLaunched && gameTime.current >= GAME_DURATION_MS) {
      setGameState("win")
      updateHighScores(score)
      playVictorySound()
      createConfetti()
      return
    }

    forceUpdate()
    animationFrameId.current = requestAnimationFrame(gameLoop)
  }, [
    gameState,
    gamePausedByOrientation,
    handleCollision,
    score,
    updateHighScores,
    rocketLaunched,
    playVictorySound,
    createConfetti,
    isMobile,
    isMovingLeft,
    isMovingRight,
    ROCKET_WIDTH,
    ROCKET_HEIGHT,
  ])

  const [, setTick] = useState(0)
  const forceUpdate = () => setTick((tick) => tick + 1)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false
    }

    // Only add keyboard listeners on desktop
    if (!isMobile) {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
    }

    if (gameState === "playing" && !gamePausedByOrientation) {
      animationFrameId.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (!isMobile) {
        window.removeEventListener("keydown", handleKeyDown)
        window.removeEventListener("keyup", handleKeyUp)
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [gameState, gameLoop, isMobile, gamePausedByOrientation])

  // Background phases
  const backgroundPhase = backgroundY.current < 800 ? 1 : backgroundY.current < 1200 ? 2 : 3
  const gradientStartPoint = 1200 + 150
  const gradientProgress =
    backgroundPhase === 3 && backgroundY.current > gradientStartPoint
      ? Math.min(100, ((backgroundY.current - gradientStartPoint) / 1000) * 100)
      : 0

  if (gameState === "loading") {
    return <LoadingSpinner />
  }

  if (isGameLoading) {
    return <LoadingSpinner />
  }

  // Mostrar advertencia de orientación si es móvil y no está en landscape
  if (isMobile && !isLandscape) {
    return <OrientationWarning isVisible={true} />
  }

  const renderGame = () => (
    <div
      ref={gameContainerRef}
      className="relative w-full h-full bg-black overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {/* Mute Button */}
      <MuteButton />

      {/* Exit Button */}
      <button
        onClick={goToHome}
        className="fixed top-2 left-2 md:top-4 md:left-4 z-50 glass-button text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110"
        title="Volver al menú principal"
      >
        <X size={20} className="md:w-6 md:h-6" />
      </button>

      {/* Background - starts with solid color, then gradient */}
      {backgroundPhase >= 3 ? (
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(to bottom, #000000 ${gradientProgress}%, #6caca5 100%)`,
          }}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-[#6caca5]" />
      )}

      {/* Launchpad Background - covers full width */}
      {backgroundPhase === 1 && (
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: `url(${launchpadBg})`,
            backgroundSize: isMobile ? "100% auto" : "cover",
            backgroundPosition: "center bottom",
            backgroundRepeat: "no-repeat",
            transform: `translateY(${backgroundY.current}px)`,
            opacity: Math.max(0, 1 - backgroundY.current / 800),
          }}
        />
      )}

      {/* Space Station */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-1000"
        style={{
          opacity: rocketLaunched && gameTime.current > GAME_DURATION_MS - 5000 ? 1 : 0,
          width: isMobile ? "100px" : "200px",
          height: isMobile ? "100px" : "200px",
        }}
      >
        <Image
          src={spaceStationImg || "/placeholder.svg"}
          alt="Estación Espacial"
          width={isMobile ? 100 : 200}
          height={isMobile ? 100 : 200}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Rocket - positioned absolutely from bottom */}
      <div
        className="absolute z-30"
        style={{
          left: `${playerPosition.current.x}%`,
          bottom: `${playerPosition.current.y}px`,
          width: `${ROCKET_WIDTH}px`,
          height: `${ROCKET_HEIGHT}px`,
          backgroundImage: `url(${rocketSprite})`,
          backgroundSize: "400% 100%",
          backgroundPosition: `${(rocketFrame.current / 3) * 100}% 0`,
          transform: "translateX(-50%)",
        }}
      />

      {/* Game Objects */}
      {gameObjects.current.map((obj) => (
        <div
          key={obj.id}
          className="absolute z-20"
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            width: `${obj.width}px`,
            height: `${obj.height}px`,
          }}
        >
          {obj.type === "junk" && <Image src={spaceJunkImg || "/placeholder.svg"} alt="Basura Espacial" fill />}
          {obj.type === "mate" && <span className={`${isMobile ? "text-lg" : "text-2xl md:text-4xl"}`}>🧉</span>}
          {obj.type === "empanada" && <span className={`${isMobile ? "text-lg" : "text-2xl md:text-4xl"}`}>🥟</span>}
        </div>
      ))}

      {/* Confetti */}
      {confetti.current.map((particle) => (
        <div
          key={particle.id}
          className="absolute z-50 pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: "2px",
          }}
        />
      ))}

      {/* Floating Score Texts */}
      {floatingTexts.current.map((text) => (
        <div
          key={text.id}
          className="absolute z-40 text-yellow-400 font-bold text-lg md:text-2xl pointer-events-none"
          style={{
            left: `${text.x}%`,
            top: `${text.y}%`,
            opacity: text.opacity,
          }}
        >
          {text.text}
        </div>
      ))}

      {/* HUD */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 md:top-4 text-white font-bold text-lg md:text-2xl z-40 flex items-center gap-2 md:gap-4 glass-card p-2 md:p-3 rounded-xl">
        <div>Puntaje: {score}</div>
      </div>

      {/* Desktop Launch Instructions */}
      {!rocketLaunched && !isMobile && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 md:bottom-20 text-white font-bold text-base md:text-xl z-40 glass-card p-3 md:p-6 rounded-xl text-center max-w-xs md:max-w-md">
          <p className="text-lg md:text-2xl mb-2">Presiona ESPACIO para despegar</p>
          <p className="text-xs md:text-sm mt-2 text-gray-300">Usa las flechas o A/D para moverte</p>
          <p className="text-xs mt-1 text-gray-400">ESC para volver al menú</p>
        </div>
      )}

      {/* Mobile Launch Instructions */}
      {!rocketLaunched && isMobile && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-white font-bold text-lg z-40 glass-card p-4 rounded-xl text-center max-w-sm">
          <p className="text-xl mb-2">Toca el cohete para despegar</p>
          <p className="text-sm mt-2 text-gray-300">Usa los botones para moverte</p>
        </div>
      )}

      {/* Mobile Controls */}
      <MobileControls
        onMoveLeft={handleMoveLeft}
        onMoveRight={handleMoveRight}
        onStopMove={handleStopMove}
        onLaunch={handleLaunch}
        rocketLaunched={rocketLaunched}
        isVisible={isMobile}
      />
    </div>
  )

  const renderHome = () => (
    <div
      className="w-full min-h-screen text-white relative overflow-hidden bg-black"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative z-10 h-screen overflow-y-auto">
        <div className="p-3 md:p-8 flex flex-col items-center min-h-full">
          <MuteButton />
          {!isAudioReady && (
            <div className="fixed top-16 right-2 md:top-20 md:right-4 z-50 bg-blue-600/90 text-white px-2 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm animate-pulse">
              🎵 Cargando música...
            </div>
          )}

          {/* Animated Logo */}
          <div className="animate-fade-in-up opacity-0 [animation-delay:0.2s]">
            <Image
              src={logo || "/placeholder.svg"}
              alt="Noe al Espacio Logo"
              width={350}
              height={250}
              priority
              className="animate-float w-[280px] h-[200px] md:w-[350px] md:h-[250px] object-contain"
            />
          </div>

          <div className="w-full max-w-6xl mx-auto mt-3 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 flex-1">
            {/* Left Column - Buttons and Curiosity */}
            <div className="flex flex-col gap-3 md:gap-6 animate-fade-in-left opacity-0 [animation-delay:0.6s]">
              <div className="glass-card p-3 md:p-8 rounded-2xl flex flex-col gap-3 md:gap-6 h-full">
                <button
                  onClick={() => {
                    // Inicializar audio en la primera interacción
                    if (!userHasInteracted) {
                      initializeAudio()
                      setUserHasInteracted(true)
                    }
                    startGame()
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 md:py-5 px-4 md:px-8 rounded-xl text-lg md:text-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl transform"
                >
                  🚀 Iniciar Juego
                </button>

                <a
                  href="https://www.instagram.com/noel.decastro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full glass-button text-sky-300 font-bold py-2 md:py-4 px-4 md:px-8 rounded-xl text-sm md:text-lg flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 hover:scale-105"
                >
                  📱 Visitar Instagram de Noel de Castro <ExternalLink size={16} className="md:w-5 md:h-5" />
                </a>

                {/* Divider line */}
                <div className="border-t border-white/20 my-1 md:my-2"></div>

                <div className="flex-1 animate-scale-in opacity-0 [animation-delay:1s]">
                  <h2 className="text-lg md:text-2xl font-bold text-sky-300 mb-3 md:mb-6 flex items-center gap-2">
                    ✨ Dato curioso
                  </h2>
                  <div>
                    <h3 className="font-semibold text-base md:text-xl text-white mb-2 md:mb-3">
                      {randomCuriosity.title}
                    </h3>
                    <ul className="space-y-1 md:space-y-2 text-gray-200">
                      {randomCuriosity.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span className="text-xs md:text-sm leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - High Scores */}
            <div className="flex flex-col gap-3 md:gap-6 animate-fade-in-right opacity-0 [animation-delay:0.8s]">
              <div className="glass-card p-3 md:p-8 rounded-2xl h-full flex flex-col justify-center items-center text-center">
                <h3 className="text-xl md:text-3xl font-bold text-yellow-400 mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3">
                  <Trophy size={20} className="md:w-8 md:h-8" /> Mejores Puntajes
                </h3>
                <div className="flex-1 flex items-center justify-center w-full">
                  {highScores.length > 0 ? (
                    <div className="space-y-2 md:space-y-4 w-full">
                      {highScores.map((s, i) => (
                        <div key={i} className="glass-button p-2 md:p-4 rounded-xl flex items-center justify-between">
                          <span className="text-sm md:text-lg font-semibold">#{i + 1}</span>
                          <span className="text-base md:text-xl font-bold text-yellow-300">{s} puntos</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl md:text-6xl mb-3 md:mb-4">🏆</div>
                      <p className="text-gray-300 text-sm md:text-lg">¡Sé el primero en jugar!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-4 md:mt-12 text-gray-400 text-center pb-3 md:pb-8 animate-fade-in-up opacity-0 [animation-delay:1.2s]">
            <p className="text-xs md:text-lg">
              Hecho en Salta por @artugrande –{" "}
              <a
                href="https://www.desafia.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 transition-colors underline decoration-2 underline-offset-4"
              >
                www.desafia.tech
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )

  const renderEndScreen = (title: string, message: string, isWin: boolean) => (
    <div className="w-full h-screen flex flex-col items-center justify-center text-white text-center p-3 md:p-4 relative bg-black">
      <MuteButton />

      {/* Confetti for win screen */}
      {isWin &&
        confetti.current.map((particle) => (
          <div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg)`,
              borderRadius: "2px",
            }}
          />
        ))}

      <div className="glass-card p-4 md:p-12 rounded-3xl max-w-xs md:max-w-2xl animate-scale-in">
        <h1 className="text-3xl md:text-7xl font-bold mb-3 md:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg md:text-3xl mb-2 md:mb-4 text-gray-300">{message}</p>
        <p className="text-xl md:text-4xl font-bold text-yellow-400 mb-6 md:mb-12">🏆 Puntaje Final: {score}</p>
        <button
          onClick={goToHome}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 md:py-4 px-6 md:px-12 rounded-xl text-base md:text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          🏠 Volver al Inicio
        </button>
      </div>
    </div>
  )

  return (
    <main className="w-screen h-screen overflow-hidden bg-black font-space-grotesk">
      {gameState === "home" && renderHome()}
      {gameState === "playing" && renderGame()}
      {gameState === "gameOver" && renderEndScreen("Game Over", "¡Chocaste con basura espacial!", false)}
      {gameState === "win" && renderEndScreen("¡Felicitaciones!", "¡Llegaste a la Estación Espacial!", true)}
    </main>
  )
}
