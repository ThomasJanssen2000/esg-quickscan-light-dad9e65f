import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Building2, Leaf, Users, ShieldCheck, Target, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { questions, sectors, employeeCounts, revenueRanges, getThemes, getQuestionsByTheme, type ScanAnswers, type Question } from "@/lib/esgQuestions";
import actRightLogo from "@/assets/actright-logo.png";

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
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-8 py-6 flex items-center justify-between border-b border-border/40">
        <img src={actRightLogo} alt="Act Right — for a better future" className="h-8 sm:h-10" />
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide">
          Stap {step + 1} van {steps.length}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      <main className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {isCompanyStep ? (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-accent" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-primary">Bedrijfsinformatie</h2>
                  </div>
                  <p className="text-muted-foreground mb-8 text-sm">Vertel ons iets over uw organisatie zodat we de resultaten beter kunnen afstemmen.</p>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-2 block">Bedrijfsnaam</Label>
                      <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Uw bedrijfsnaam" className="h-12 rounded-md border-border" />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">Sector</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {sectors.map((s) => (
                          <button key={s} onClick={() => setSector(s)} className={`text-left px-4 py-3 rounded-md border text-sm transition-all ${sector === s ? "border-accent bg-accent/10 text-primary font-medium" : "border-border hover:border-accent/40 text-foreground"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">Aantal medewerkers</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {employeeCounts.map((c) => (
                          <button key={c} onClick={() => setEmployeeCount(c)} className={`px-3 py-3 rounded-md border text-sm font-medium transition-all ${employeeCount === c ? "border-accent bg-accent/10 text-primary" : "border-border hover:border-accent/40 text-foreground"}`}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">Jaaromzet (indicatief)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {revenueRanges.map((r) => (
                          <button key={r} onClick={() => setRevenue(r)} className={`text-left px-4 py-3 rounded-md border text-sm transition-all ${revenue === r ? "border-accent bg-accent/10 text-primary font-medium" : "border-border hover:border-accent/40 text-foreground"}`}>
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
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      {(() => { const Icon = themeIcons[currentStep] || ShieldCheck; return <Icon className="h-5 w-5 text-accent" />; })()}
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-primary">{currentStep}</h2>
                  </div>
                  <p className="text-muted-foreground mb-8 text-sm">Beantwoord de onderstaande vragen zo eerlijk mogelijk.</p>

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

      <div className="px-8 py-5 border-t border-border/40 flex justify-between bg-background">
        <Button variant="ghost" onClick={() => (step === 0 ? onBack() : setStep(step - 1))} className="text-muted-foreground text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          terug
        </Button>
        <Button onClick={handleNext} disabled={!canProceed()} className="bg-accent hover:bg-accent/85 text-accent-foreground font-semibold px-6 rounded-md disabled:opacity-40 text-sm">
          {step === steps.length - 1 ? "bekijk rapport" : "volgende"}
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
        <span className="text-xs font-bold text-accent mr-2">{index}.</span>
        <span className="font-heading font-semibold text-foreground text-[15px]">{question.question}</span>
        {question.description && <p className="text-sm text-muted-foreground mt-1 ml-5">{question.description}</p>}
      </div>
      <div className="grid gap-2 ml-5">
        {question.options.map((opt) => (
          <button key={opt.value} onClick={() => onChange(opt.value)} className={`text-left px-4 py-3 rounded-md border text-sm transition-all ${value === opt.value ? "border-accent bg-accent/10 text-primary font-medium" : "border-border hover:border-accent/40 text-foreground"}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
