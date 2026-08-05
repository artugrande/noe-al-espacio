"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useSyncExternalStore } from "react"
import { GameSession } from "@/components/game/GameSession"
import { Hud } from "@/components/hud/Hud"
import { LeaderboardPanel } from "@/components/hud/LeaderboardPanel"
import { MobileControls } from "@/components/hud/MobileControls"
import { OrientationWarning } from "@/components/hud/OrientationWarning"
import { ScorePublishForm } from "@/components/hud/ScorePublishForm"
import {
  getSnapshot,
  resetSession,
  startPlaying,
  subscribe,
  type SessionSnapshot,
} from "@/components/game/gameState"
import { unlock } from "@/lib/game/audio"
import { pickCuriosity } from "@/lib/game/curiosidades"
import { fetchLeaderboard } from "@/lib/game/scores"
import type { AchievementId, HighScoreEntry } from "@/lib/game/types"

const achievementLabels: Record<AchievementId, string> = {
  first_mate: "Primer mate",
  survived_90s: "90 segundos en órbita",
  first_shield: "Escudo al rescate",
  first_boost: "Sobreviví el impulso",
  first_magnet: "Imán de mates",
  combo_x4: "Combo x4",
  mate_objective: "5 mates en una misión",
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
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([])
  const [globalBoard, setGlobalBoard] = useState(false)
  const [loadingScores, setLoadingScores] = useState(true)

  useEffect(() => {
    setCuriosity(pickCuriosity(Date.now()))
    let cancelled = false
    void fetchLeaderboard().then((result) => {
      if (cancelled) return
      setHighScores(result.scores)
      setGlobalBoard(result.global)
      setLoadingScores(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative min-h-screen bg-[radial-gradient(circle_at_top,#172554,#020617_55%,#000)] px-5 py-8 text-white sm:py-10">
      <div className="mx-auto w-full max-w-4xl pb-12">
        <header className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/images/noe-al-espacio-logo.png"
            alt="Logo de Noe al Espacio: cohete blanco con mate y estrellas"
            width={930}
            height={1050}
            priority
            className="noe-logo-tilt mb-3 h-auto w-[min(10.5rem,42vw)] drop-shadow-[0_10px_28px_rgba(56,189,248,0.3)] sm:w-[min(12rem,28vw)]"
          />
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">
            Misión Argentina
          </p>
          <h1 className="sr-only">Noe al Espacio</h1>
          <p className="mt-1 max-w-xl text-slate-300">
            Esquivá oleadas, armá combos, juntá mates con el 🧲 imán, y llegá a
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
            <LeaderboardPanel
              scores={highScores}
              global={globalBoard}
              loading={loadingScores}
            />
          </div>
        </div>

        <Link
          href="/construir"
          className="mt-5 block rounded-3xl border border-amber-300/30 bg-gradient-to-br from-amber-500/15 via-sky-500/10 to-indigo-600/20 p-6 backdrop-blur transition hover:border-amber-300/60 hover:scale-[1.01]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
            Modo taller
          </p>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Construí tu propio juego
          </h2>
          <p className="mt-2 max-w-2xl text-slate-200">
            Guía educativa: Cursor, stack, prompts, arquitectura y el paso a paso
            para armar tu misión — en modo presentación o lectura. Inspirado en
            astronautas argentinos.
          </p>
          <p className="mt-4 text-sm font-bold text-sky-300">
            Abrir la guía →
          </p>
        </Link>

        <footer className="mt-8 text-center text-sm text-slate-400">
          Hecho en Salta por{" "}
          <a
            href="https://x.com/ArtuGrande"
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 underline underline-offset-4"
          >
            @artugrande
          </a>{" "}
          ·{" "}
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
  const won = snapshot.screen === "win"

  if (won) {
    return (
      <div
        className={
          overlay
            ? "absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm"
            : "flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#172554,#020617_60%,#000)] px-5 py-8"
        }
      >
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 text-white shadow-2xl shadow-sky-950/40 backdrop-blur md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="relative min-h-56 bg-slate-900 md:min-h-full">
            <Image
              src="/images/noe-estacion.png"
              alt="NOE llegando a la estación espacial"
              width={1254}
              height={1254}
              priority
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div className="flex max-h-[85vh] flex-col justify-center overflow-y-auto p-6 text-center sm:p-8 md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
              Misión cumplida
            </p>
            <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
              ¡Felicidades!
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-200 sm:text-lg">
              Lograste llevar a NOE hasta la estación espacial y completar su
              misión.
            </p>

            <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-4">
              <p className="text-xs uppercase tracking-widest text-amber-200/80">
                Tu puntaje
              </p>
              <p className="text-5xl font-black text-amber-300">
                {snapshot.score}
              </p>
            </div>

            {snapshot.achievements.length > 0 ? (
              <ul className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                {snapshot.achievements.map((achievement) => (
                  <li
                    key={achievement}
                    className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs sm:text-sm"
                  >
                    {achievementLabels[achievement]}
                  </li>
                ))}
              </ul>
            ) : null}

            <ScorePublishForm score={snapshot.score} align="left" />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={startWithAudio}
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 font-bold transition hover:scale-[1.02]"
              >
                Jugar de nuevo
              </button>
              <button
                type="button"
                onClick={resetSession}
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-bold transition hover:bg-white/10"
              >
                Menú inicial
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#172554,#020617_60%,#000)] px-5 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/85 p-8 text-center text-white backdrop-blur">
        <p className="text-5xl">💥</p>
        <h1 className="mt-4 text-4xl font-black">Fin de la misión</h1>
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

        <ScorePublishForm score={snapshot.score} />

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
            Menú inicial
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
              A/D · 🛡️ escudo · ⚡ impulso · 🧲 imán · 🧉 meta · near-miss
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
  const inGame =
    snapshot.screen === "playing" ||
    snapshot.screen === "win" ||
    snapshot.screen === "gameOver"

  useEffect(() => {
    if (!inGame) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [inGame])

  return (
    <main
      className={`min-h-screen bg-black ${
        inGame ? "h-screen overflow-hidden" : "overflow-y-auto"
      }`}
    >
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
