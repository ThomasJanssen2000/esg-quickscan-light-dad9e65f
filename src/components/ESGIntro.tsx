import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, Shield, FileText } from "lucide-react";
import actRightLogo from "@/assets/actright-logo.png";

interface Props { onStart: () => void }

const benefits = [
  { icon: Shield, text: "Inzicht in relevante wetgeving" },
  { icon: CheckCircle2, text: "Klant- en ketenverwachtingen" },
  { icon: Clock, text: "ESG kansen en risico's" },
  { icon: FileText, text: "Concrete vervolgstappen" },
];

export default function ESGIntro({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <img src={actRightLogo} alt="Act Right — for a better future" className="h-9 sm:h-10" />
          <span className="hidden sm:inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase text-muted-foreground">
            <span className="w-6 h-px bg-accent" />
            ESG Quickscan Light
          </span>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-soft pointer-events-none" />
        <div className="absolute top-32 right-0 w-[480px] h-[480px] rounded-full bg-accent/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32 relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-semibold tracking-wide text-primary mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              GRATIS ESG QUICKSCAN VOOR MKB
            </span>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-primary leading-[1.02] tracking-tight mb-6">
              Welke ESG-eisen zijn voor uw bedrijf <em className="text-accent" style={{ fontStyle: "italic" }}>écht</em> relevant?
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10">
              Ontvang binnen 5 minuten een persoonlijke ESG Quickscan voor uw organisatie — afgestemd op uw sector, omvang en keten.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-12">
              <Button onClick={onStart} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-base font-semibold rounded-md shadow-elegant group">
                Start gratis ESG Quickscan
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <span className="text-sm text-muted-foreground">⏱ ±5 minuten · Geen verplichtingen</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
              {benefits.map((b, i) => (
                <motion.div key={b.text} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <b.icon className="h-4 w-4 text-accent" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm font-medium text-primary">{b.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: "20", label: "gerichte vragen", sub: "afgestemd op MKB-praktijk" },
            { num: "89+", label: "ESG-onderwerpen", sub: "wetten, frameworks & standaarden" },
            { num: "5 min", label: "tot uw rapport", sub: "direct bruikbaar" },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-4">
              <span className="font-heading text-4xl text-accent font-medium">{s.num}</span>
              <div>
                <div className="text-sm font-semibold text-primary">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-4">Wat u ontvangt</p>
          <h2 className="font-heading text-4xl sm:text-5xl text-primary leading-tight tracking-tight">
            Een persoonlijk ESG-rapport. <em className="text-muted-foreground" style={{ fontStyle: "italic" }}>Geen generieke checklist.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: "01", title: "Wat nu relevant is", text: "Maximaal 5 onderwerpen waar u nu echt op moet acteren — met aanbevolen eerste stap." },
            { num: "02", title: "Wat binnenkort speelt", text: "Wetgeving en standaarden waar u zich op moet voorbereiden binnen 1-3 jaar." },
            { num: "03", title: "Concrete vervolgstappen", text: "Een mix van quick wins, compliance en strategische acties — afgestemd op uw volwassenheid." },
          ].map((c) => (
            <div key={c.num} className="bg-card rounded-xl border border-border p-7 shadow-card hover:shadow-soft transition-shadow">
              <span className="font-heading text-xs text-accent font-semibold tracking-wider">{c.num}</span>
              <h3 className="font-heading text-xl text-primary mt-3 mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-hero text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl leading-tight mb-6">
            Klaar om uw ESG-prioriteiten <em className="text-accent" style={{ fontStyle: "italic" }}>helder</em> te krijgen?
          </h2>
          <p className="text-base text-primary-foreground/70 mb-10 max-w-xl mx-auto">
            5 minuten. Een rapport op maat. Direct bruikbaar in uw volgende klant- of directiegesprek.
          </p>
          <Button onClick={onStart} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 text-base font-semibold rounded-md group">
            Start gratis ESG Quickscan
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground/70">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={actRightLogo} alt="Act Right" className="h-8 brightness-0 invert opacity-90" />
          <p className="text-xs tracking-wider uppercase text-accent/80">act responsible · act win-win · act now</p>
          <a href="https://www.actright.nl" className="text-xs hover:text-accent transition-colors">www.actright.nl</a>
        </div>
      </footer>
    </div>
  );
}
