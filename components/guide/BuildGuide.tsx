"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { GUIDE_PAGES } from "@/lib/guide/buildGuideContent"
import { GuideBlocks } from "./GuideBlocks"

type Mode = "slides" | "scroll"

export function BuildGuide() {
  const [mode, setMode] = useState<Mode>("slides")
  const [index, setIndex] = useState(0)
  const page = GUIDE_PAGES[index]
  const total = GUIDE_PAGES.length

  const go = useCallback(
    (next: number) => {
      setIndex(Math.min(total - 1, Math.max(0, next)))
    },
    [total],
  )

  useEffect(() => {
    if (mode !== "slides") return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault()
        go(index + 1)
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault()
        go(index - 1)
      }
      if (event.key === "Home") go(0)
      if (event.key === "End") go(total - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mode, index, go, total])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#0c4a6e_0%,#020617_45%,#000_100%)] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
            >
              ← Inicio
            </Link>
            <Image
              src="/images/noe-al-espacio-logo.png"
              alt="Noe al Espacio"
              width={926}
              height={1046}
              className="h-12 w-auto sm:h-14"
              priority
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
                Noe al Espacio
              </p>
              <p className="text-sm font-bold">Construí tu propio juego</p>
            </div>
          </div>

          <div className="flex rounded-xl border border-white/15 bg-black/30 p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("slides")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                mode === "slides"
                  ? "bg-sky-500 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Presentación
            </button>
            <button
              type="button"
              onClick={() => setMode("scroll")}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                mode === "scroll"
                  ? "bg-sky-500 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Lectura
            </button>
          </div>
        </div>
      </header>

      {mode === "slides" ? (
        <section className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-4xl flex-col px-4 py-8 sm:py-12">
          <div className="mb-6 flex items-center justify-between gap-3 text-sm text-slate-400">
            <span>
              Diapositiva {index + 1} / {total}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10 mx-4 max-w-xs">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-300 transition-all"
                style={{ width: `${((index + 1) / total) * 100}%` }}
              />
            </div>
            <span className="hidden sm:inline">← → para navegar</span>
          </div>

          <article className="flex flex-1 flex-col rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-sky-950/40 backdrop-blur sm:p-10">
            {page.id === "portada" ? (
              <Image
                src="/images/noe-al-espacio-logo.png"
                alt="Noe al Espacio"
                width={926}
                height={1046}
                className="mx-auto mb-6 h-auto w-[min(14rem,55vw)] drop-shadow-[0_10px_30px_rgba(56,189,248,0.3)]"
                priority
              />
            ) : null}
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
              {page.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-balance sm:text-5xl">
              {page.title}
            </h1>
            {page.subtitle ? (
              <p className="mt-4 max-w-2xl text-lg text-slate-300">{page.subtitle}</p>
            ) : null}
            <div className="mt-8 flex-1 overflow-y-auto pr-1">
              <GuideBlocks blocks={page.blocks} />
            </div>

            {page.id === "cta" ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="https://github.com/artugrande/noe-al-espacio"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-center text-lg font-bold shadow-lg shadow-sky-950/40 transition hover:scale-[1.02]"
                >
                  🚀 Abrir el repo y construir
                </a>
                <Link
                  href="/"
                  className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-center text-lg font-bold hover:bg-white/10"
                >
                  Volver a jugar
                </Link>
              </div>
            ) : null}
          </article>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold disabled:opacity-30"
            >
              Anterior
            </button>
            <div className="flex max-w-[50%] flex-wrap justify-center gap-1.5">
              {GUIDE_PAGES.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Ir a ${item.title}`}
                  onClick={() => go(i)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    i === index ? "bg-amber-300 scale-125" : "bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={index === total - 1}
              className="rounded-xl border border-white/15 bg-sky-500/80 px-4 py-2 font-semibold disabled:opacity-30"
            >
              Siguiente
            </button>
          </div>
        </section>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-sky-300">
              Índice
            </p>
            <nav className="max-h-[70vh] space-y-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-3 text-sm">
              {GUIDE_PAGES.map((item, i) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <span className="mr-2 text-slate-500">{i + 1}.</span>
                  {item.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-10 pb-24">
            {GUIDE_PAGES.map((item) => (
              <article
                key={item.id}
                id={item.id}
                className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10"
              >
                {item.id === "portada" ? (
                  <Image
                    src="/images/noe-al-espacio-logo.png"
                    alt="Noe al Espacio"
                    width={952}
                    height={1019}
                    className="mx-auto mb-6 h-auto w-[min(16rem,60vw)]"
                  />
                ) : null}
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
                  {item.eyebrow}
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  {item.title}
                </h2>
                {item.subtitle ? (
                  <p className="mt-3 max-w-2xl text-lg text-slate-300">{item.subtitle}</p>
                ) : null}
                <div className="mt-8">
                  <GuideBlocks blocks={item.blocks} />
                </div>
                {item.id === "cta" ? (
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="https://github.com/artugrande/noe-al-espacio"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-center text-lg font-bold"
                    >
                      🚀 Construir tu propio juego de Noe al Espacio
                    </a>
                    <Link
                      href="/"
                      className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-center text-lg font-bold"
                    >
                      Volver al inicio
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
