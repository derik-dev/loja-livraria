-- Adiciona campos de tamanho na tabela categories
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS has_sizes boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_sizes text NOT NULL DEFAULT '';

-- Atualiza as categorias padrão se já existirem
UPDATE categories SET has_sizes = true,  default_sizes = 'P, M, G, GG, XGG'                     WHERE slug = 'roupas';
UPDATE categories SET has_sizes = true,  default_sizes = '34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44' WHERE slug = 'calcados';
UPDATE categories SET has_sizes = false, default_sizes = ''                                       WHERE slug = 'eletronicos';
UPDATE categories SET has_sizes = false, default_sizes = ''                                       WHERE slug = 'acessorios';
