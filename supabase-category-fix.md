# Fix: Padronização de categorias

Roda no editor SQL do Supabase. Normaliza os valores existentes e adiciona constraint para garantir consistência com o seletor de tipo de produto do admin.

```sql
-- Normaliza valores existentes que possam estar diferentes
UPDATE products SET category = 'roupas'      WHERE category ILIKE ANY(ARRAY['roupa', 'roupas', 'clothing', 'vestuario', 'camiseta', 'calça', 'calca', 'camisa', 'blusa', 'jaqueta', 'moletom']);
UPDATE products SET category = 'calcados'    WHERE category ILIKE ANY(ARRAY['calcado', 'calcados', 'calçado', 'calçados', 'tenis', 'tênis', 'sapato', 'shoe', 'shoes']);
UPDATE products SET category = 'eletronicos' WHERE category ILIKE ANY(ARRAY['eletronico', 'eletronicos', 'eletrônico', 'eletrônicos', 'tech', 'tecnologia', 'smartphone', 'fone']);
UPDATE products SET category = 'acessorios'  WHERE category ILIKE ANY(ARRAY['acessorio', 'acessorios', 'acessório', 'acessórios', 'bolsa', 'mochila', 'cinto']);

-- (Opcional) Adiciona constraint pra não aceitar valores fora do padrão no futuro
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('roupas', 'calcados', 'eletronicos', 'acessorios'));
```

Se algum produto falhar no `ADD CONSTRAINT`, significa que tem uma categoria fora do padrão. Rode isso para ver quais são:

```sql
SELECT id, name, category FROM products
WHERE category NOT IN ('roupas', 'calcados', 'eletronicos', 'acessorios');
```
