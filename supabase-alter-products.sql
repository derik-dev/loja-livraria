-- Adiciona colunas de cores, tamanhos e diferenciais na tabela products
-- Execute este SQL no Supabase SQL Editor

alter table products
  add column if not exists colors  jsonb    not null default '[]',
  add column if not exists sizes   text[]   not null default '{}',
  add column if not exists features text[]  not null default '{}';

-- Atualiza os produtos existentes com valores padrão razoáveis
update products set
  colors   = '[{"name":"PRETO","hex":"#111111"},{"name":"CINZA","hex":"#9ca3af"},{"name":"BRANCO","hex":"#f8f8f8"}]',
  sizes    = '{"P","M","G","GG","XGG"}',
  features = '{"Anti odor e anti suor","Não amassa e não desbota","Secagem rápida","Leveza extrema","Durabilidade garantida"}'
where colors = '[]';
