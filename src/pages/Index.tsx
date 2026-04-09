import { useState } from "react";
import ESGIntro from "@/components/ESGIntro";
import ESGQuestionnaire from "@/components/ESGQuestionnaire";
import ESGLeadGate from "@/components/ESGLeadGate";
import ESGReport from "@/components/ESGReport";
import { calculateReport, type ESGReport as ESGReportType } from "@/lib/esgScoring";
import type { ScanAnswers } from "@/lib/esgQuestions";

type View = "intro" | "questionnaire" | "leadgate" | "report";

export default function Index() {
  const [view, setView] = useState<View>("intro");
  const [report, setReport] = useState<ESGReportType | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleComplete = (data: ScanAnswers) => {
    const result = calculateReport(data);
    setReport(result);
    setCompanyName(data.companyName);
    setView("leadgate");
    window.scrollTo(0, 0);
  };

  const handleLeadSubmit = (name: string, email: string) => {
    setContactName(name);
    setContactEmail(email);
    setView("report");
    window.scrollTo(0, 0);
  };

  const handleRestart = () => {
    setView("intro");
    setReport(null);
    setCompanyName("");
    setContactName("");
    setContactEmail("");
    window.scrollTo(0, 0);
  };

  if (view === "questionnaire") return <ESGQuestionnaire onComplete={handleComplete} onBack={() => setView("intro")} />;
  if (view === "leadgate") return <ESGLeadGate companyName={companyName} onSubmit={handleLeadSubmit} onBack={() => setView("questionnaire")} />;
  if (view === "report" && report) return <ESGReport report={report} companyName={companyName} contactName={contactName} contactEmail={contactEmail} onRestart={handleRestart} />;
  return <ESGIntro onStart={() => setView("questionnaire")} />;
}
