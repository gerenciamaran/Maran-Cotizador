-- Buckets privados: fotos de factura y PDFs de propuesta generados.
-- Privados a propósito (datos de clientes) — se acceden con URLs firmadas,
-- no con lectura pública.

insert into storage.buckets (id, name, public)
values
  ('bill-images', 'bill-images', false),
  ('proposal-pdfs', 'proposal-pdfs', false)
on conflict (id) do nothing;

create policy "bill_images_authenticated_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'bill-images')
  with check (bucket_id = 'bill-images');

create policy "proposal_pdfs_authenticated_all" on storage.objects
  for all to authenticated
  using (bucket_id = 'proposal-pdfs')
  with check (bucket_id = 'proposal-pdfs');
