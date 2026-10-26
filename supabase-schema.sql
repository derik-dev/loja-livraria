-- Tabela de produtos
create table if not exists products (
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  price       numeric(10,2) not null,
  original_price numeric(10,2),
  images      text[] not null default '{}',
  category    text not null,
  stock       integer not null default 0,
  rating      numeric(3,1) not null default 5.0,
  review_count integer not null default 0,
  description text not null default '',
  tags        text[] not null default '{}',
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Habilitar RLS
alter table products enable row level security;

-- Qualquer um pode ler
create policy "Leitura pública" on products
  for select using (true);

-- Apenas service role pode escrever (admin)
create policy "Escrita admin" on products
  for all using (auth.role() = 'service_role');
