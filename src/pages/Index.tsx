import { useState } from "react";
import ESGIntro from "@/components/ESGIntro";
import ESGQuestionnaire from "@/components/ESGQuestionnaire";
import ESGReport from "@/components/ESGReport";
import { calculateReport, type ESGReport as ESGReportType } from "@/lib/esgScoring";
import type { ScanAnswers } from "@/lib/esgQuestions";

type View = "intro" | "questionnaire" | "report";

export default function Index() {
  const [view, setView] = useState<View>("intro");
  const [report, setReport] = useState<ESGReportType | null>(null);
  const [companyName, setCompanyName] = useState("");

  const handleComplete = (data: ScanAnswers) => {
    const result = calculateReport(data);
    setReport(result);
    setCompanyName(data.companyName);
    setView("report");
    window.scrollTo(0, 0);
  };

  const handleRestart = () => {
    setView("intro");
    setReport(null);
    setCompanyName("");
    window.scrollTo(0, 0);
  };

  if (view === "questionnaire") return <ESGQuestionnaire onComplete={handleComplete} onBack={() => setView("intro")} />;
  if (view === "report" && report) return <ESGReport report={report} companyName={companyName} onRestart={handleRestart} />;
  return <ESGIntro onStart={() => setView("questionnaire")} />;
}
