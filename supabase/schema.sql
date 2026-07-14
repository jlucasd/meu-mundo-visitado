-- Meu Mundo Visitado — esquema do banco (Supabase / Postgres)
-- Rode isto uma vez no SQL Editor do painel do Supabase.

-- Uma linha por usuário com os países marcados.
create table if not exists public.user_countries (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  visited    text[] not null default '{}',
  wishlist   text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Row Level Security: cada usuário só enxerga e altera a própria linha.
alter table public.user_countries enable row level security;

drop policy if exists "Usuário gerencia a própria linha" on public.user_countries;
create policy "Usuário gerencia a própria linha"
  on public.user_countries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
