-- ─────────────────────────────────────────────────────────────
-- TABELA COMPLETA DE PRODUTOS — execute no SQL Editor do Supabase
-- Se a tabela já existe, este script a recria do zero.
-- ─────────────────────────────────────────────────────────────

-- Remove a tabela antiga se existir
drop table if exists products cascade;

-- Cria a tabela com todos os campos
create table products (
  id            text        primary key,
  name          text        not null,
  slug          text        not null unique,
  description   text        not null default '',
  price         numeric(10,2) not null,
  original_price numeric(10,2),
  category      text        not null,
  stock         integer     not null default 0,
  rating        numeric(3,1) not null default 5.0,
  review_count  integer     not null default 0,
  featured      boolean     not null default false,
  images        text[]      not null default '{}',
  tags          text[]      not null default '{}',
  colors        jsonb       not null default '[]',   -- [{"name":"PRETO","hex":"#111111"}]
  sizes         text[]      not null default '{}',   -- ["P","M","G","GG","XGG"]
  features      text[]      not null default '{}',   -- ["Anti odor","Secagem rápida"]
  created_at    timestamptz not null default now()
);

-- ─── RLS ──────────────────────────────────────────────────────
alter table products enable row level security;

-- Loja pública pode ler
create policy "Leitura pública" on products
  for select using (true);

-- Painel admin pode escrever (anon key)
create policy "Escrita admin" on products
  for all using (true) with check (true);

-- ─── Storage: bucket de imagens ───────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Imagens públicas"  on storage.objects;
drop policy if exists "Upload admin"      on storage.objects;
drop policy if exists "Delete admin"      on storage.objects;

create policy "Imagens públicas" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Upload admin" on storage.objects
  for insert with check (bucket_id = 'product-images');

create policy "Delete admin" on storage.objects
  for delete using (bucket_id = 'product-images');
