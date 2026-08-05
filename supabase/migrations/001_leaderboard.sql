-- Noe al Espacio · ranking global + keepalive (anti-pausa free tier)
-- Corré esto en Supabase → SQL Editor → Run

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 16),
  score integer not null check (score >= 0 and score <= 1000000),
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_score_idx
  on public.leaderboard (score desc, created_at desc);

alter table public.leaderboard enable row level security;

drop policy if exists "Public read leaderboard" on public.leaderboard;
create policy "Public read leaderboard"
  on public.leaderboard for select
  to anon, authenticated
  using (true);

drop policy if exists "Public insert leaderboard" on public.leaderboard;
create policy "Public insert leaderboard"
  on public.leaderboard for insert
  to anon, authenticated
  with check (
    char_length(name) between 1 and 16
    and score >= 0
    and score <= 1000000
  );

