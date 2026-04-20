import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { questions, type Question } from "@/data/questions";
import type { Answers } from "@/lib/esgEngine";
import actRightLogo from "@/assets/actright-logo.png";

interface Props {
  onComplete: (answers: Answers) => void;
  onBack: () => void;
}

export default function ESGQuestionnaire({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const total = questions.length;
  const q: Question = questions[step];
  const progress = ((step + 1) / total) * 100;

  const currentValue = answers[q.id];
  const canProceed = useMemo(() => {
    if (!q.required) return true;
    if (q.type === "multi") return Array.isArray(currentValue) && currentValue.length > 0;
    return typeof currentValue === "string" && currentValue.length > 0;
  }, [q, currentValue]);

  const setSingle = (val: string) => setAnswers(p => ({ ...p, [q.id]: val }));
  const toggleMulti = (val: string) => {
    setAnswers(p => {
      const cur = Array.isArray(p[q.id]) ? (p[q.id] as string[]) : [];
      // "Nee" / "Geen van deze" / "Geen" zijn exclusieve opties
      const isExclusive = /^(nee|geen)( |$)/i.test(val) || val === "Geen van deze" || val === "Geen";
      if (isExclusive) return { ...p, [q.id]: cur.includes(val) ? [] : [val] };
      const filtered = cur.filter(v => !/^(nee|geen)( |$)/i.test(v) && v !== "Geen van deze" && v !== "Geen");
      const next = filtered.includes(val) ? filtered.filter(v => v !== val) : [...filtered, val];
      return { ...p, [q.id]: next };
    });
  };

  const handleNext = () => {
    if (step < total - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      onComplete(answers);
    }
  };
  const handleBack = () => {
    if (step === 0) onBack();
    else { setStep(step - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <img src={actRightLogo} alt="Act Right" className="h-9" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground tabular-nums">
            Vraag <span className="text-primary font-semibold">{step + 1}</span> van {total}
          </span>
        </div>
        <div className="h-1 bg-muted">
          <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 lg:px-10 py-12 lg:py-16">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <span className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-accent mb-4">
                {q.type === "multi" ? "Meerdere antwoorden mogelijk" : "Kies één antwoord"}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl text-primary leading-tight tracking-tight mb-3">
                {q.question}
              </h2>
              {q.helper && (
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{q.helper}</p>
              )}

              <div className="grid gap-3 mt-8">
                {q.options.map(opt => {
                  const selected = q.type === "multi"
                    ? Array.isArray(currentValue) && currentValue.includes(opt.value)
                    : currentValue === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => q.type === "multi" ? toggleMulti(opt.value) : setSingle(opt.value)}
                      className={`group flex items-center gap-4 text-left px-5 py-4 rounded-lg border transition-all ${
                        selected
                          ? "border-accent bg-accent/8 shadow-card"
                          : "border-border bg-card hover:border-accent/50 hover:bg-accent/3"
                      }`}
                    >
                      <span className={`flex-shrink-0 h-5 w-5 ${q.type === "multi" ? "rounded" : "rounded-full"} border-2 flex items-center justify-center transition-colors ${
                        selected ? "border-accent bg-accent" : "border-muted-foreground/30 group-hover:border-accent/50"
                      }`}>
                        {selected && <Check className="h-3 w-3 text-accent-foreground" strokeWidth={3} />}
                      </span>
                      <span className={`text-[15px] ${selected ? "font-semibold text-primary" : "text-foreground"}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <div className="border-t border-border/60 bg-card">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-5 flex justify-between items-center">
          <Button variant="ghost" onClick={handleBack} className="text-muted-foreground hover:text-primary text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Vorige
          </Button>
          <Button onClick={handleNext} disabled={!canProceed} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 px-6 rounded-md disabled:opacity-30 disabled:cursor-not-allowed">
            {step === total - 1 ? "Bekijk mijn rapport" : "Volgende"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
