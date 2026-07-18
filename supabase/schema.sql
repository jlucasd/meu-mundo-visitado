-- Meu Mundo Visitado — esquema do banco (Supabase / Postgres)
-- Rode este script no SQL Editor do painel do Supabase.
--
-- ATENÇÃO: substitui a tabela user_countries antiga (que era amarrada ao
-- Supabase Auth). As tabelas novas são usadas pelo sistema de login próprio
-- do app (usuários gerenciados pelo admin dentro do app).

drop table if exists public.user_countries cascade;
drop table if exists public.app_users cascade;

-- Usuários do app (senha nunca em texto plano: hash PBKDF2-SHA-256 + salt).
create table public.app_users (
  id            uuid primary key,
  email         text not null unique,
  role          text not null default 'user' check (role in ('admin', 'user')),
  password_hash text not null,
  salt          text not null,
  iterations    int  not null,
  created_at    timestamptz not null default now()
);

-- Uma linha por usuário com os países marcados.
create table public.user_countries (
  user_id    uuid primary key references public.app_users (id) on delete cascade,
  visited    text[] not null default '{}',
  wishlist   text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- O app acessa o banco com a chave anon (o login é feito pelo próprio app,
-- não pelo Supabase Auth), então as políticas liberam acesso via anon.
-- Trade-off consciente para um app pessoal: quem tiver a URL + anon key
-- consegue ler/escrever nas tabelas. As senhas estão protegidas por hash.
alter table public.app_users enable row level security;
alter table public.user_countries enable row level security;

create policy "app_users acesso anon" on public.app_users
  for all using (true) with check (true);

create policy "user_countries acesso anon" on public.user_countries
  for all using (true) with check (true);
