// Upload het gegenereerde ESG-rapport (PDF) naar Supabase Storage.
// De bucket is privé; we generen een signed URL met lange geldigheid die als
// esg_report_url naar HubSpot gestuurd wordt. Zo kan Act Right vanuit elk
// HubSpot-contact de PDF openen, zonder dat de bucket publiek doorzoekbaar is.
//
// Faalt zachtjes: als de upload mislukt (netwerkfout, Supabase down) toont
// Index.tsx het rapport tóch aan de klant en stuurt een lead naar HubSpot
// zonder URL. De klant merkt niets; Act Right mist in zo'n geval de PDF.

import { supabase } from "@/integrations/supabase/client";
import type { ContactInfo } from "./esgEngine";

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

const BUCKET = "esg-reports";

// 10 jaar geldigheid voor de signed URL: lang genoeg voor opvolging vanuit
// HubSpot, maar nog altijd een beperkt token i.p.v. een publieke URL.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 10;

/**
 * Upload een PDF-blob naar de privé-bucket en geef een signed URL terug.
 *
 * Bestandspad: `YYYY/MM/{uuid}.pdf` — volledig opake naam, geen bedrijfsnaam
 * of e-mailadres in het pad. Dit voorkomt dat metadata (klantnaam) lekt via
 * de URL die in HubSpot zichtbaar is.
 */
export async function uploadReportPdf(
  pdfBlob: Blob,
  // ContactInfo blijft in de signature voor backwards-compatibility, maar wordt
  // bewust NIET meer in het bestandspad verwerkt om PII-leakage te voorkomen.
  _contact: ContactInfo
): Promise<UploadResult> {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  const path = `${yyyy}/${mm}/${id}.pdf`;

  try {
    const { error } = await supabase.storage.from(BUCKET).upload(path, pdfBlob, {
      cacheControl: "3600",
      contentType: "application/pdf",
      upsert: false,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    const { data, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

    if (signErr || !data?.signedUrl) {
      return {
        ok: false,
        error: signErr?.message ?? "Kon signed URL niet aanmaken",
      };
    }

    return { ok: true, url: data.signedUrl, path };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
