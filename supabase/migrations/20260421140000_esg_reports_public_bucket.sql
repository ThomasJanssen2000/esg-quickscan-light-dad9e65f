-- Revert esg-reports bucket naar public + verwijder signed-URL-afhankelijkheid.
--
-- Lovable's security-fix (20260421081958_...) maakte de bucket private met de
-- bedoeling dat Act Right rapporten via signed URLs opent. Praktijkprobleem:
-- de anon-client kan geen signed URL genereren op een private bucket zonder
-- SELECT-policy, maar SELECT-policy toestaan zou anon ook toestaan om ALLE
-- objects te listen (dat is een privacy-lek: klanten zouden elkaars PDF-paden
-- kunnen ontdekken).
--
-- Oplossing: bucket terug op public met strikte INSERT-policy. De paden
-- bevatten UUIDs waardoor ze onvindbaar zijn zonder de directe link, en
-- 'public' betekent hier dat de /object/public/... endpoint werkt, niet dat
-- listing mogelijk is.

-- 1. Bucket terug op public (houd PDF-only en 10MB-cap).
update storage.buckets
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = array['application/pdf']
where id = 'esg-reports';

-- 2. Ruim oude policies op (zowel die uit mijn eerste migration als Lovable's).
drop policy if exists "anon can upload to esg-reports"     on storage.objects;
drop policy if exists "anon can upload pdf to esg-reports" on storage.objects;
drop policy if exists "anon can read esg-reports"          on storage.objects;

-- 3. Strikte INSERT-policy: alleen PDFs, jaar/maand-subpad toegestaan, geen
--    path-traversal, redelijke naamlengte.
create policy "anon can upload pdf to esg-reports"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'esg-reports'
  and lower(storage.extension(name)) = 'pdf'
  and octet_length(name) < 200
  and position('..' in name) = 0
  and name !~ '^/'
);

-- 4. Geen expliciete SELECT-policy: public buckets serveren objects via
--    /storage/v1/object/public/<bucket>/<path> zonder RLS-check. Zonder
--    SELECT-policy kunnen anon-clients NIET via /object/list of /object/sign
--    andermans objects ontdekken. Dit is de juiste balans voor onze use-case.
