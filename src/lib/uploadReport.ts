// Upload het gegenereerde ESG-rapport (PDF) naar Supabase Storage.
//
// De bucket is publiek maar de paden bevatten een UUID, waardoor URLs
// onvindbaar zijn zonder de directe link. Listing is uitgeschakeld (geen
// anon SELECT-policy), dus anon-clients kunnen niet door de bucket bladeren.
// De publieke URL landt als esg_report_url op het HubSpot-contact zodat
// Act Right vanuit elk contact direct de PDF kan openen.
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

/**
 * Upload een PDF-blob naar de publieke bucket en geef de publieke URL terug.
 *
 * Bestandspad: `YYYY/MM/{uuid}.pdf` — volledig opake naam, geen bedrijfsnaam
 * of e-mailadres in het pad. Dit voorkomt dat metadata (klantnaam) lekt via
 * de URL die in HubSpot zichtbaar is.
 */
export async function uploadReportPdf(
  pdfBlob: Blob,
  // ContactInfo blijft in de signature voor backwards-compatibility, maar
  // wordt bewust NIET meer in het bestandspad verwerkt om PII-leakage te
  // voorkomen.
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

    // Public bucket: getPublicUrl retourneert een direct-accessible URL.
    // Geen extra API-call nodig (in tegenstelling tot createSignedUrl op
    // een private bucket, wat SELECT-rechten vereist).
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    if (!data?.publicUrl) {
      return { ok: false, error: "Kon public URL niet bepalen" };
    }

    return { ok: true, url: data.publicUrl, path };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
