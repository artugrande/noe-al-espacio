"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { GameSession } from "@/components/game/GameSession"
import { Hud } from "@/components/hud/Hud"
import { MobileControls } from "@/components/hud/MobileControls"
import { OrientationWarning } from "@/components/hud/OrientationWarning"
import {
  getSnapshot,
  resetSession,
  startPlaying,
  subscribe,
  type SessionSnapshot,
} from "@/components/game/gameState"
import { unlock } from "@/lib/game/audio"
import { pickCuriosity } from "@/lib/game/curiosidades"
import { loadHighScores, submitScore } from "@/lib/game/scores"
import type { AchievementId } from "@/lib/game/types"

const achievementLabels: Record<AchievementId, string> = {
  first_mate: "Primer mate",
  survived_90s: "90 segundos en órbita",
  first_shield: "Escudo al rescate",
  first_boost: "Sobreviví el impulso",
}

function useSessionSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

function startWithAudio() {
  void unlock()
  startPlaying()
}

function HomeScreen() {
  const [curiosity, setCuriosity] = useState(() => pickCuriosity(0))
  const [highScores, setHighScores] =
    useState<ReturnType<typeof loadHighScores>>([])

  useEffect(() => {
    setCuriosity(pickCuriosity(Date.now()))
    setHighScores(loadHighScores())
  }, [])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,#172554,#020617_55%,#000)] px-5 py-10 text-white">
      <div className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
            Misión Argentina
          </p>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
            Noe al Espacio
          </h1>
          <p className="mt-3 text-slate-300">
            Esquivá asteroides, juntá mates y usá escudo e impulso para llegar a
            la estación.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <button
              type="button"
              onClick={startWithAudio}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-4 text-xl font-bold shadow-lg shadow-sky-950/40 transition hover:scale-[1.02]"
            >
              🚀 Iniciar Juego
            </button>
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-sm font-bold uppercase tracking-wider text-sky-300">
                Dato curioso · {curiosity.title}
              </p>
              <p className="mt-2 leading-relaxed text-slate-200">
                {curiosity.body}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-amber-300">
              🏆 Mejores puntajes
            </h2>
            {highScores.length > 0 ? (
              <ol className="mt-4 space-y-2">
                {highScores.map((entry, index) => (
                  <li
                    key={`${entry.at}-${index}`}
                    className="flex justify-between rounded-xl bg-black/20 px-4 py-3"
                  >
                    <span>#{index + 1}</span>
                    <strong>{entry.score} puntos</strong>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-5 text-slate-300">¡Sé la primera persona en jugar!</p>
            )}
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-slate-400">
          Hecho en Salta por @artugrande ·{" "}
          <a
            href="https://www.desafia.tech"
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 underline underline-offset-4"
          >
            Desafía
          </a>
        </footer>
      </div>
    </section>
  )
}

function ResultCard({
  snapshot,
  overlay,
}: {
  snapshot: SessionSnapshot
  overlay?: boolean
}) {
  const submitted = useRef(false)
  const won = snapshot.screen === "win"
  const [highScores, setHighScores] =
    useState<ReturnType<typeof loadHighScores>>([])

  useEffect(() => {
    if (submitted.current) return
    setHighScores(submitScore(snapshot.score))
    submitted.current = true
  }, [snapshot.score])

  return (
    <div
      className={
        overlay
          ? "absolute inset-x-0 bottom-0 z-30 flex justify-center bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-6 pt-16"
          : "flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#172554,#020617_60%,#000)] px-5"
      }
    >
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/85 p-8 text-center text-white backdrop-blur">
        <p className="text-5xl">{won ? "🛰️" : "💥"}</p>
        <h1 className="mt-4 text-4xl font-black">
          {won ? "¡Llegaste a la estación!" : "Fin de la misión"}
        </h1>
        <p className="mt-5 text-sm uppercase tracking-widest text-slate-400">
          Puntaje final
        </p>
        <p className="text-5xl font-black text-amber-300">{snapshot.score}</p>

        {snapshot.achievements.length > 0 ? (
          <div className="mt-6">
            <h2 className="font-bold text-sky-300">Logros desbloqueados</h2>
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {snapshot.achievements.map((achievement) => (
                <li
                  key={achievement}
                  className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sm"
                >
                  {achievementLabels[achievement]}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6">
          <h2 className="font-bold text-amber-300">🏆 Mejores puntajes</h2>
          <ol className="mt-3 space-y-2">
            {highScores.map((entry, index) => (
              <li
                key={`${entry.at}-${index}`}
                className="flex justify-between rounded-xl bg-black/20 px-4 py-2 text-sm"
              >
                <span>#{index + 1}</span>
                <strong>{entry.score} puntos</strong>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={startWithAudio}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 font-bold"
          >
            Jugar de nuevo
          </button>
          <button
            type="button"
            onClick={resetSession}
            className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-bold"
          >
            Inicio
          </button>
        </div>
      </div>
    </div>
  )
}

function PlayingScreen({ snapshot }: { snapshot: SessionSnapshot }) {
  const won = snapshot.screen === "win"
  const [showWinCard, setShowWinCard] = useState(false)

  useEffect(() => {
    if (!won) {
      setShowWinCard(false)
      return
    }
    const timer = window.setTimeout(() => setShowWinCard(true), 2200)
    return () => window.clearTimeout(timer)
  }, [won])

  return (
    <section className="relative h-screen w-screen overflow-hidden bg-black">
      <GameSession />
      {!won ? <Hud /> : null}

      {!won ? (
        <button
          type="button"
          onClick={resetSession}
          className="absolute bottom-4 left-4 z-20 rounded-xl border border-white/20 bg-slate-950/70 px-4 py-2 text-sm text-white backdrop-blur hover:bg-slate-800/80"
        >
          Volver al inicio
        </button>
      ) : null}

      {!snapshot.launched && !won ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-24 text-center text-white">
          <div className="rounded-2xl border border-sky-400/30 bg-slate-950/80 px-7 py-5 backdrop-blur">
            <p className="text-2xl font-black">Presioná Espacio para despegar</p>
            <p className="mt-1 text-sm text-slate-300">
              Flechas o A / D · 🛡️ escudo te salva · ⚡ impulso acelera todo
            </p>
          </div>
        </div>
      ) : null}

      {won && showWinCard ? <ResultCard snapshot={snapshot} overlay /> : null}
    </section>
  )
}

function EndScreen({ snapshot }: { snapshot: SessionSnapshot }) {
  return <ResultCard snapshot={snapshot} />
}

export default function NoeAlEspacio() {
  const snapshot = useSessionSnapshot()

  return (
    <main className="min-h-screen bg-black">
      {snapshot.screen === "home" || snapshot.screen === "loading" ? (
        <HomeScreen />
      ) : snapshot.screen === "playing" || snapshot.screen === "win" ? (
        <PlayingScreen snapshot={snapshot} />
      ) : (
        <EndScreen snapshot={snapshot} />
      )}
      <MobileControls />
      <OrientationWarning />
    </main>
  )
}
