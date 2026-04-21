-- ESG Quickscan Light: storage-bucket voor PDF-rapporten
--
-- Doel: elke lead-submit uploadt een kopie van het gegenereerde PDF-rapport.
-- De URL landt in HubSpot als custom property esg_report_url zodat Act Right
-- het rapport vanuit een contact kan openen.
--
-- AVG: bestanden krijgen een UUID-achtig pad (onvindbaar zonder link) en de
-- bewaartermijn volgt het contact-bewaarbeleid in HubSpot (24 maanden). Voor
-- productie kan hier later een pg_cron-job komen die objecten ouder dan 24
-- maanden verwijdert.

-- 1. Public bucket. De publicatie-flag maakt GET-URLs direct bereikbaar voor
--    Act Right-medewerkers; de onvindbaarheid komt uit het random pad.
insert into storage.buckets (id, name, public)
values ('esg-reports', 'esg-reports', true)
on conflict (id) do nothing;

-- 2. Anon mag een bestand UPLOADEN naar deze bucket (de Quickscan is publiek,
--    we hebben geen ingelogde gebruikers). Strikt gescoped op bucket-id.
drop policy if exists "anon can upload to esg-reports" on storage.objects;
create policy "anon can upload to esg-reports"
on storage.objects for insert
to anon
with check (bucket_id = 'esg-reports');

-- 3. Expliciete read-policy, zodat publieke URLs ook werken als de bucket
--    later privé wordt gemaakt.
drop policy if exists "anon can read esg-reports" on storage.objects;
create policy "anon can read esg-reports"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'esg-reports');

-- Expliciet NIET: update/delete-policies voor anon. De Quickscan mag alleen
-- uploaden, niet overschrijven of verwijderen.
