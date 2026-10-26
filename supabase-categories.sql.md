# SQL — Tabela de Categorias

Cole no **Supabase → SQL Editor** e execute.

```sql
create table public.categories (
  id          serial primary key,
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Índice para busca por slug
create index on public.categories (slug);

-- RLS
alter table public.categories enable row level security;

create policy "Leitura pública"
  on public.categories for select
  using (true);

create policy "Escrita autenticada"
  on public.categories for all
  using (true)
  with check (true);
```
