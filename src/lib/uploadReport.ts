// Upload het gegenereerde ESG-rapport (PDF) naar Supabase Storage.
// De publieke URL wordt vervolgens als esg_report_url naar HubSpot gestuurd,
// zodat Act Right vanuit elk contact het exact-zelfde PDF kan openen dat de
// klant gedownload heeft.
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

/** Korte, URL-veilige unieke suffix op basis van crypto.randomUUID. */
function shortId(): string {
  const uuid = crypto.randomUUID();
  return uuid.replace(/-/g, "").slice(0, 12);
}

/** Slugify een string voor gebruik in een bestandsnaam. */
function slug(s: string): string {
  const cleaned = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return cleaned || "onbekend";
}

/**
 * Upload een PDF-blob naar de publieke bucket en geef de publieke URL terug.
 *
 * Bestandspad: `YYYY-MM-DDTHH-mm-ss_{bedrijf-slug}_{12-char-uuid}.pdf`
 * Het UUID-deel zorgt voor onvindbaarheid zonder link; het timestamp +
 * bedrijfs-slug maken het voor Act Right menselijk te herkennen als ze
 * direct in Supabase Storage kijken.
 */
export async function uploadReportPdf(
  pdfBlob: Blob,
  contact: ContactInfo
): Promise<UploadResult> {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const companySlug = slug(contact.companyName);
  const path = `${stamp}_${companySlug}_${shortId()}.pdf`;

  try {
    const { error } = await supabase.storage.from(BUCKET).upload(path, pdfBlob, {
      cacheControl: "3600",
      contentType: "application/pdf",
      upsert: false,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl, path };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
