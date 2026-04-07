import { motion } from "framer-motion";
import { ArrowRight, Shield, TrendingUp, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="font-heading font-bold text-xl tracking-tight text-primary">
          Act Right
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">ESG Quickscan Light</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="max-w-3xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-secondary mb-4">
              Gratis & vrijblijvend
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary leading-tight mb-5">
              Wat moet uw organisatie
              <br />
              <span className="text-secondary">nu écht doen met ESG?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Krijg in 5 minuten een eerste inzicht in uw ESG-positie. Ontvang een persoonlijk rapport met uw maturity score, risico's, kansen en concrete vervolgstappen.
            </p>
            <Button
              onClick={onStart}
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-base px-8 py-6 rounded-xl shadow-lg shadow-secondary/20 transition-all hover:shadow-xl hover:shadow-secondary/30"
            >
              Start de Quickscan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="grid md:grid-cols-3 gap-6 mt-16"
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-2xl p-6 border border-border/60 shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-heading font-bold text-primary text-sm mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Act Right · Adviesbureau Eindhoven
        </p>
      </footer>
    </div>
  );
}
