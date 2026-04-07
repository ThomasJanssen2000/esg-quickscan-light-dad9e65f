import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, Leaf, Users, ShieldCheck, Target, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { questions, sectors, employeeCounts, revenueRanges, getThemes, getQuestionsByTheme, type ScanAnswers, type Question } from "@/lib/esgQuestions";

interface Props {
  onComplete: (data: ScanAnswers) => void;
  onBack: () => void;
}

const themeIcons: Record<string, React.ElementType> = {
  "Strategie & Bewustzijn": Target,
  "Milieu & Klimaat": Leaf,
  "Keten & Leveranciers": Link2,
  "Mensen & Sociaal": Users,
  "Governance & Rapportage": ShieldCheck,
  "Risicobeheer & Toekomst": ShieldCheck,
};

export default function ESGQuestionnaire({ onComplete, onBack }: Props) {
  const themes = getThemes();
  const steps = ["company", ...themes];
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [revenue, setRevenue] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentStep = steps[step];
  const isCompanyStep = currentStep === "company";
  const currentQuestions = isCompanyStep ? [] : getQuestionsByTheme(currentStep);

  const canProceed = () => {
    if (isCompanyStep) return companyName.trim() && sector && employeeCount && revenue;
    return currentQuestions.every((q) => answers[q.id]);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      onComplete({ companyName, sector, employeeCount, revenue, answers });
    }
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-border/50">
        <div className="font-heading font-bold text-xl tracking-tight text-primary">Act Right</div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">
            Stap {step + 1} van {steps.length}
          </span>
        </div>
      </header>

      <div className="h-1 bg-muted">
        <motion.div className="h-full bg-secondary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <main className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {isCompanyStep ? (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-primary">Bedrijfsinformatie</h2>
                  </div>
                  <p className="text-muted-foreground mb-8">Vertel ons iets over uw organisatie zodat we de resultaten beter kunnen afstemmen.</p>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Bedrijfsnaam</Label>
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Uw bedrijfsnaam" className="h-12 rounded-xl border-border" />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">Sector</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {sectors.map((s) => (
                          <button key={s} onClick={() => setSector(s)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${sector === s ? "border-secondary bg-secondary/10 text-secondary font-medium" : "border-border hover:border-secondary/40 text-foreground"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">Aantal medewerkers</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {employeeCounts.map((c) => (
                          <button key={c} onClick={() => setEmployeeCount(c)} className={`px-3 py-3 rounded-xl border text-sm font-medium transition-all ${employeeCount === c ? "border-secondary bg-secondary/10 text-secondary" : "border-border hover:border-secondary/40 text-foreground"}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">Jaaromzet (indicatief)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {revenueRanges.map((r) => (
                          <button key={r} onClick={() => setRevenue(r)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${revenue === r ? "border-secondary bg-secondary/10 text-secondary font-medium" : "border-border hover:border-secondary/40 text-foreground"}`}>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      {(() => { const Icon = themeIcons[currentStep] || ShieldCheck; return <Icon className="h-5 w-5 text-secondary" />; })()}
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-primary">{currentStep}</h2>
                  </div>
                  <p className="text-muted-foreground mb-8">Beantwoord de onderstaande vragen zo eerlijk mogelijk.</p>

                  <div className="space-y-8">
                    {currentQuestions.map((q, i) => (
                      <QuestionCard key={q.id} question={q} index={i + 1} value={answers[q.id]} onChange={(v) => handleAnswer(q.id, v)} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div className="px-6 py-5 border-t border-border/50 flex justify-between">
        <Button variant="ghost" onClick={() => (step === 0 ? onBack() : setStep(step - 1))} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-6 rounded-xl disabled:opacity-40">
          {step === steps.length - 1 ? "Bekijk rapport" : "Volgende"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function QuestionCard({ question, index, value, onChange }: { question: Question; index: number; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="mb-3">
        <span className="text-xs font-bold text-secondary mr-2">{index}.</span>
        <span className="font-heading font-semibold text-foreground">{question.question}</span>
        {question.description && <p className="text-sm text-muted-foreground mt-1 ml-5">{question.description}</p>}
      </div>
      <div className="grid gap-2 ml-5">
        {question.options.map((opt) => (
          <button key={opt.value} onClick={() => onChange(opt.value)} className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${value === opt.value ? "border-secondary bg-secondary/10 text-secondary font-medium" : "border-border hover:border-secondary/40 text-foreground"}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
