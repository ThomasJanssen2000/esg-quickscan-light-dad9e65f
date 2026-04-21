
-- Make the esg-reports bucket private (no public listing/reading) and tighten the
-- anonymous upload policy so only PDFs with the expected naming structure can be
-- uploaded. Act Right staff will receive long-lived signed URLs via HubSpot.

UPDATE storage.buckets
SET public = false,
    file_size_limit = 10485760, -- 10 MB cap
    allowed_mime_types = ARRAY['application/pdf']
WHERE id = 'esg-reports';

-- Drop the old, overly broad policies.
DROP POLICY IF EXISTS "anon can upload to esg-reports" ON storage.objects;
DROP POLICY IF EXISTS "anon can read esg-reports" ON storage.objects;

-- Re-create the upload policy with strict checks: PDF extension, sane filename
-- length, and no path traversal. This still allows anonymous uploads from the
-- quickscan form (no auth in the funnel) but blocks bucket abuse for arbitrary
-- file hosting.
CREATE POLICY "anon can upload pdf to esg-reports"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'esg-reports'
  AND lower(storage.extension(name)) = 'pdf'
  AND octet_length(name) < 200
  AND position('/' in name) = 0
);

-- No SELECT policy: the bucket is now private. Act Right staff access reports
-- via signed URLs generated at upload time (sent through HubSpot) or via the
-- service role from the dashboard.
