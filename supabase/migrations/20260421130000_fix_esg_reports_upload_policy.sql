-- Fix voor de upload-policy van esg-reports bucket.
--
-- De vorige Lovable security-fix (migration 20260421081958_...) introduceerde:
--     AND position('/' in name) = 0
-- Dat sluit *alle* paden met slashes uit. Maar de bijbehorende code
-- (src/lib/uploadReport.ts) upload juist naar `YYYY/MM/{uuid}.pdf` om
-- rapporten per maand te groeperen. Gevolg: elke upload werd geweigerd,
-- waardoor de PDF niet werd opgeslagen en (in sommige edge-cases) de
-- hele submit-flow stokte voordat HubSpot werd aangeroepen.
--
-- Fix: sta YYYY/MM-paden expliciet toe, behoud het PDF-only/10MB/kort-pad
-- beleid, en blokkeer path-traversal via een '..'-check i.p.v. een
-- absolute slash-ban.

drop policy if exists "anon can upload pdf to esg-reports" on storage.objects;

create policy "anon can upload pdf to esg-reports"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'esg-reports'
  and lower(storage.extension(name)) = 'pdf'
  and octet_length(name) < 200
  -- Sta jaar/maand-submappen toe (uploadReport.ts schrijft naar
  -- YYYY/MM/{uuid}.pdf), maar blokkeer path-traversal-trucs.
  and position('..' in name) = 0
  and name !~ '^/'
);
