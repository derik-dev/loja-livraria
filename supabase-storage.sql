-- Cria o bucket de imagens de produtos (público)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Qualquer um pode ver as imagens
create policy "Imagens públicas" on storage.objects
  for select using (bucket_id = 'product-images');

-- Anon pode fazer upload (painel admin)
create policy "Upload admin" on storage.objects
  for insert with check (bucket_id = 'product-images');

-- Anon pode deletar (painel admin)
create policy "Delete admin" on storage.objects
  for delete using (bucket_id = 'product-images');
