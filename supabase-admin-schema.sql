-- ─────────────────────────────────────────────
-- TABELA: orders (pedidos)
-- ─────────────────────────────────────────────
create table if not exists orders (
  id              text primary key,           -- ex: #10045
  customer_name   text not null,
  customer_email  text not null,
  product_name    text not null,
  items           int not null default 1,
  total           numeric(10,2) not null,
  status          text not null default 'Processando'
                    check (status in ('Pago','Enviado','Processando','Cancelado')),
  created_at      timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Leitura pública orders" on orders
  for select using (true);

create policy "Escrita admin orders" on orders
  for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABELA: customers (clientes)
-- ─────────────────────────────────────────────
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null unique,
  phone           text,
  total_orders    int not null default 0,
  total_spent     numeric(10,2) not null default 0,
  last_order_at   timestamptz,
  created_at      timestamptz not null default now()
);

alter table customers enable row level security;

create policy "Leitura pública customers" on customers
  for select using (true);

create policy "Escrita admin customers" on customers
  for all using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- TABELA: discounts (cupons de desconto)
-- ─────────────────────────────────────────────
create table if not exists discounts (
  id              serial primary key,
  code            text not null unique,
  type            text not null check (type in ('percentual','fixo')),
  value           numeric(10,2) not null,
  min_order       numeric(10,2) not null default 0,
  usage_count     int not null default 0,
  usage_limit     int,                        -- null = ilimitado
  expires_at      date not null,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table discounts enable row level security;

create policy "Leitura pública discounts" on discounts
  for select using (true);

-- Cupons precisam de escrita pelo admin no painel (client-side com anon key)
-- Política permissiva para operações admin
create policy "Escrita admin discounts" on discounts
  for all using (true) with check (true);

-- ─────────────────────────────────────────────
-- SEED: dados iniciais
-- ─────────────────────────────────────────────
insert into orders (id, customer_name, customer_email, product_name, items, total, status, created_at) values
  ('#10045', 'Maria Silva',     'maria@email.com',     'Smartphone Pro Ultra',       1, 3499.99, 'Pago',         now() - interval '0 days'),
  ('#10044', 'João Pereira',    'joao@email.com',      'Fone Bluetooth Premium',     1,  599.99, 'Enviado',      now() - interval '0 days'),
  ('#10043', 'Ana Costa',       'ana@email.com',       'Camiseta Premium Algodão',   2,   89.99, 'Pago',         now() - interval '1 day'),
  ('#10042', 'Rafael Lima',     'rafael@email.com',    'Tênis Running Pro',          1,  349.99, 'Processando',  now() - interval '1 day'),
  ('#10041', 'Carla Mendes',    'carla@email.com',     'Bolsa Couro Clássica',       1,  459.99, 'Pago',         now() - interval '2 days'),
  ('#10040', 'Bruno Alves',     'bruno@email.com',     'Calça Alfaiataria',          1,  299.99, 'Enviado',      now() - interval '2 days'),
  ('#10039', 'Fernanda Rocha',  'fernanda@email.com',  'Vestido Midi Linho',         1,  389.99, 'Cancelado',    now() - interval '3 days'),
  ('#10038', 'Lucas Martins',   'lucas@email.com',     'Blazer Slim Fit',            1,  549.99, 'Pago',         now() - interval '3 days'),
  ('#10037', 'Isabela Santos',  'isabela@email.com',   'Camiseta Premium Algodão',   2,  179.98, 'Pago',         now() - interval '4 days'),
  ('#10036', 'Pedro Oliveira',  'pedro@email.com',     'Tênis Running Pro',          1,  349.99, 'Enviado',      now() - interval '4 days')
on conflict (id) do nothing;

insert into customers (name, email, phone, total_orders, total_spent, last_order_at) values
  ('Maria Silva',    'maria@email.com',    '(11) 99999-1234', 5,  8749.95, now() - interval '0 days'),
  ('João Pereira',   'joao@email.com',     '(21) 98888-5678', 3,  1849.97, now() - interval '0 days'),
  ('Ana Costa',      'ana@email.com',      '(11) 97777-4321', 7,  3129.93, now() - interval '1 day'),
  ('Rafael Lima',    'rafael@email.com',   '(31) 96666-8765', 2,   699.98, now() - interval '1 day'),
  ('Carla Mendes',   'carla@email.com',    '(11) 95555-2468', 4,  1839.96, now() - interval '2 days'),
  ('Bruno Alves',    'bruno@email.com',    '(41) 94444-1357', 1,   299.99, now() - interval '2 days'),
  ('Fernanda Rocha', 'fernanda@email.com', '(11) 93333-9876', 6,  2339.94, now() - interval '3 days'),
  ('Lucas Martins',  'lucas@email.com',    '(51) 92222-5432', 2,  1099.98, now() - interval '3 days'),
  ('Isabela Santos', 'isabela@email.com',  '(11) 91111-6789', 8,  4399.92, now() - interval '4 days'),
  ('Pedro Oliveira', 'pedro@email.com',    '(21) 90000-3456', 3,  1049.97, now() - interval '4 days')
on conflict (email) do nothing;

insert into discounts (code, type, value, min_order, usage_count, usage_limit, expires_at, active) values
  ('BOAS-VINDAS', 'percentual', 10,   0, 84, null, '2026-12-31', true),
  ('VERAO25',     'percentual', 25, 200, 37,  100, '2026-06-30', true),
  ('FRETE50',     'fixo',       50, 150, 12,   50, '2026-06-30', false),
  ('BLACK30',     'percentual', 30, 300,  0,  200, '2026-11-29', false),
  ('VIP15',       'percentual', 15,   0, 21, null, '2026-12-31', true)
on conflict (code) do nothing;
