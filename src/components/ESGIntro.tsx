import { motion } from "framer-motion";
import { ArrowRight, Shield, TrendingUp, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import actRightLogo from "@/assets/actright-logo.png";

interface ESGIntroProps {
  onStart: () => void;
}

const features = [
  { icon: ClipboardList, title: "ESG Maturity Score", desc: "Ontdek waar uw organisatie staat op een schaal van 0-100" },
  { icon: Shield, title: "Risico-identificatie", desc: "Inzicht in de belangrijkste ESG-risico's voor uw organisatie" },
  { icon: TrendingUp, title: "Kansen & Prioriteiten", desc: "Concrete actiepunten en commerciële kansen" },
];

export default function ESGIntro({ onStart }: ESGIntroProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-8 py-6 flex items-center justify-between">
        <img src={actRightLogo} alt="Act Right — for a better future" className="h-8 sm:h-10" />
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.2em]">ESG Quickscan Light</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-3xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-5">
              Gratis & vrijblijvend
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-primary leading-[1.15] mb-6">
              Wat moet uw organisatie
              <br />
              <span className="text-accent">nu écht doen met ESG?</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Krijg in 5 minuten een eerste inzicht in uw ESG-positie. Ontvang een persoonlijk rapport met uw maturity score, risico's, kansen en concrete vervolgstappen.
            </p>
            <Button
              onClick={onStart}
              className="bg-accent hover:bg-accent/85 text-accent-foreground font-semibold text-sm px-8 py-5 rounded-md shadow-none border border-accent transition-all hover:shadow-md"
            >
              start de quickscan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="grid md:grid-cols-3 gap-6 mt-20"
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-lg p-6 border border-border/60"
              >
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-heading font-bold text-primary text-sm mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      <footer className="bg-primary px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} act right b.v.
          </p>
          <p className="text-xs text-primary-foreground/40">
            act responsible. act win-win. act now.
          </p>
        </div>
      </footer>
    </div>
  );
}
