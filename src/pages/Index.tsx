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

type View = "intro" | "questionnaire" | "leadgate" | "report";

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
    const contactInfo: ContactInfo = {
      firstName: form.firstName,
      lastName: form.lastName,
      companyName: form.companyName,
      email: form.email,
      phone: form.phone,
      employees: form.employees,
    };

    const finalReport = calculateReport(answers, contactInfo);

    // Stuur de lead naar HubSpot, maar blokkeer het rapport niet als dat faalt.
    const result = await submitLead(form, answers, finalReport);
    if (result.ok === false) {
      // Log voor ontwikkelaars, informeer gebruiker zonder paniek.
      console.error("[submitLead]", result.error);
      toast.error(
        "We konden uw rapport niet automatisch opslaan, maar u kunt het hieronder direct inzien en downloaden."
      );
    }

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
    return <ESGQuestionnaire onComplete={handleComplete} onBack={() => setView("intro")} />;
  if (view === "leadgate")
    return <ESGLeadGate onSubmit={handleLeadSubmit} onBack={() => setView("questionnaire")} />;
  if (view === "report" && report && contact)
    return <ESGReport report={report} contact={contact} onRestart={handleRestart} />;
  return <ESGIntro onStart={() => setView("questionnaire")} />;
}
