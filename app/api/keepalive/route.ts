import { NextResponse } from "next/server"
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Ping diario para que el proyecto free de Supabase no se pause por inactividad.
 * Vercel Cron → GET /api/keepalive
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  // On Vercel Cron, Authorization: Bearer <CRON_SECRET> is sent when set.
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const isVercelCron = request.headers.get("x-vercel-cron") === "1"
    if (!isVercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Supabase no configurado" },
      { status: 503 },
    )
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  try {
    const { error: readError } = await supabase
      .from("leaderboard")
      .select("id")
      .limit(1)

    if (readError) throw readError

    // Write touch so the free project stays warm even with 0 scores.
    const { error: writeError } = await supabase.from("keepalive").upsert(
      { id: 1, last_ping: new Date().toISOString() },
      { onConflict: "id" },
    )

    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      project: "noe-al-espacio",
      wroteHeartbeat: !writeError,
    })
  } catch (error) {
    console.error("GET /api/keepalive", error)
    return NextResponse.json(
      { ok: false, error: "Ping falló" },
      { status: 500 },
    )
  }
}
