import { useState } from "react";
import ESGIntro from "@/components/ESGIntro";
import ESGQuestionnaire from "@/components/ESGQuestionnaire";
import ESGLeadGate from "@/components/ESGLeadGate";
import ESGReport from "@/components/ESGReport";
import { calculateReport, type ESGReport as ESGReportType, type Answers, type ContactInfo } from "@/lib/esgEngine";

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

  const handleLeadSubmit = (c: ContactInfo) => {
    setContact(c);
    setReport(calculateReport(answers, c));
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

  if (view === "questionnaire") return <ESGQuestionnaire onComplete={handleComplete} onBack={() => setView("intro")} />;
  if (view === "leadgate") return <ESGLeadGate onSubmit={handleLeadSubmit} onBack={() => setView("questionnaire")} />;
  if (view === "report" && report && contact) return <ESGReport report={report} contact={contact} onRestart={handleRestart} />;
  return <ESGIntro onStart={() => setView("questionnaire")} />;
}
