-- Deja SOLO public.leaderboard.
-- No toca schemas del sistema (auth, storage, realtime, etc.).
-- Corré esto en Supabase → SQL Editor → Run

do $$
declare
  r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename <> 'leaderboard'
  loop
    execute format('drop table if exists public.%I cascade', r.tablename);
    raise notice 'dropped public.%', r.tablename;
  end loop;
end $$;

-- Verificación
select tablename
from pg_tables
where schemaname = 'public'
order by tablename;
