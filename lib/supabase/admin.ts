import { createClient } from "@supabase/supabase-js"

function supabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  )
}

function supabaseServerKey() {
  // Prefer secret/service role on the server; fall back to publishable/anon.
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  )
}

/** Lightweight server client for leaderboard + keepalive (no cookie session). */
export function createServiceClient() {
  const url = supabaseUrl()
  const key = supabaseServerKey()
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabaseServerKey())
}
