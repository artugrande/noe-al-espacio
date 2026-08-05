import { NextResponse } from "next/server"
import { listGlobalScores, submitGlobalScore } from "@/lib/game/leaderboard"
import { sanitizePlayerName, sanitizeScore } from "@/lib/game/scoreValidation"
import { isRedisConfigured } from "@/lib/server/redis"

export const runtime = "nodejs"

export async function GET() {
  if (!isRedisConfigured()) {
    return NextResponse.json(
      { scores: [], global: false, error: "Leaderboard no configurado" },
      { status: 503 },
    )
  }

  try {
    const scores = (await listGlobalScores()) ?? []
    return NextResponse.json({ scores, global: true })
  } catch (error) {
    console.error("GET /api/scores", error)
    return NextResponse.json(
      { scores: [], global: false, error: "No se pudo leer el ranking" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  if (!isRedisConfigured()) {
    return NextResponse.json(
      { error: "Leaderboard no configurado" },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const record = body as { name?: unknown; score?: unknown }
  const name = typeof record.name === "string" ? sanitizePlayerName(record.name) : null
  const score = sanitizeScore(record.score)

  if (!name) {
    return NextResponse.json(
      { error: "Nombre inválido (1–16 caracteres, sin símbolos raros)" },
      { status: 400 },
    )
  }
  if (score === null) {
    return NextResponse.json({ error: "Puntaje inválido" }, { status: 400 })
  }

  try {
    const scores = (await submitGlobalScore(name, score)) ?? []
    return NextResponse.json({ scores, global: true })
  } catch (error) {
    console.error("POST /api/scores", error)
    return NextResponse.json(
      { error: "No se pudo guardar el puntaje" },
      { status: 500 },
    )
  }
}
