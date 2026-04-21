import { useState } from "react";
import { toast } from "sonner";
import ESGIntro from "@/components/ESGIntro";
import ESGQuestionnaire from "@/components/ESGQuestionnaire";
import ESGLeadGate from "@/components/ESGLeadGate";
import ESGReport from "@/components/ESGReport";
import {
  calculateReport,
  type ESGReport as ESGReportType,
  type Answers,
  type ContactInfo,
} from "@/lib/esgEngine";
import { submitLead, type LeadFormData } from "@/lib/submitLead";
import { generateESGPdf } from "@/lib/generatePdf";
import { uploadReportPdf, type UploadResult } from "@/lib/uploadReport";

type View = "intro" | "questionnaire" | "leadgate" | "report";

// Maximum tijd die we wachten op de Supabase-upload voordat we zonder URL
// doorgaan naar HubSpot. We zien liever een HubSpot-contact zonder PDF-link
// dan een klant die op een loader blijft hangen omdat de bucket ontbreekt.
const UPLOAD_TIMEOUT_MS = 8000;

export default function Index() {
  const [view, setView] = useState<View>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [report, setReport] = useState<ESGReportType | null>(null);
  const [contact, setContact] = useState<ContactInfo | null>(null);

  const handleComplete = (a: Answers) => {
    setAnswers(a);
    setReport(calculateReport(a));
    setView("leadgate");
    window.scrollTo(0, 0);
  };

  const handleLeadSubmit = async (form: LeadFormData) => {
    console.log("[Quickscan] Start lead submit", { email: form.email });

    const contactInfo: ContactInfo = {
      firstName: form.firstName,
      lastName: form.lastName,
      companyName: form.companyName,
      email: form.email,
      phone: form.phone,
      employees: form.employees,
    };

    const finalReport = calculateReport(answers, contactInfo);

    // --- Stap 1: PDF genereren + uploaden naar Supabase Storage ---
    // Met timeout zodat een hangende upload nooit de HubSpot-submit blokkeert.
    let reportUrl: string | undefined;
    try {
      const uploadRace = Promise.race<UploadResult | "timeout">([
        (async () => {
          const pdfBlob = generateESGPdf(finalReport, contactInfo).output(
            "blob"
          ) as Blob;
          console.log("[Quickscan] PDF blob gegenereerd, size:", pdfBlob.size);
          return await uploadReportPdf(pdfBlob, contactInfo);
        })(),
        new Promise<"timeout">((resolve) =>
          setTimeout(() => resolve("timeout"), UPLOAD_TIMEOUT_MS)
        ),
      ]);
      const outcome = await uploadRace;
      if (outcome === "timeout") {
        console.warn(
          "[Quickscan] Upload duurde > %dms, ga door zonder URL",
          UPLOAD_TIMEOUT_MS
        );
      } else if (outcome.ok) {
        reportUrl = outcome.url;
        console.log("[Quickscan] Upload OK, URL:", outcome.url);
      } else {
        console.error("[Quickscan] Upload faalde:", outcome.error);
      }
    } catch (e) {
      console.error("[Quickscan] Fout in PDF-of-upload blok:", e);
    }

    // --- Stap 2: HubSpot-submit (MOET fire'n, ook als upload faalde) ---
    console.log("[Quickscan] Submit naar HubSpot, reportUrl =", reportUrl);
    try {
      const result = await submitLead(form, answers, finalReport, reportUrl);
      if (result.ok === false) {
        console.error("[Quickscan] submitLead retourneerde fout:", result.error);
        toast.error(
          "We konden uw rapport niet automatisch opslaan, maar u kunt het hieronder direct inzien en downloaden."
        );
      } else {
        console.log("[Quickscan] submitLead OK");
      }
    } catch (e) {
      console.error("[Quickscan] submitLead gooide onverwachte fout:", e);
      toast.error("Er ging iets mis bij het verzenden van uw gegevens.");
    }

    // --- Stap 3: rapport tonen ---
    setContact(contactInfo);
    setReport(finalReport);
    setView("report");
    window.scrollTo(0, 0);
  };

  const handleRestart = () => {
    setView("intro");
    setAnswers({});
    setReport(null);
    setContact(null);
    window.scrollTo(0, 0);
  };

  if (view === "questionnaire")
    return (
      <ESGQuestionnaire
        onComplete={handleComplete}
        onBack={() => setView("intro")}
      />
    );
  if (view === "leadgate")
    return (
      <ESGLeadGate
        onSubmit={handleLeadSubmit}
        onBack={() => setView("questionnaire")}
      />
    );
  if (view === "report" && report && contact)
    return (
      <ESGReport report={report} contact={contact} onRestart={handleRestart} />
    );
  return <ESGIntro onStart={() => setView("questionnaire")} />;
}
