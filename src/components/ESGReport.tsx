import { motion } from "framer-motion";
import { Calendar, Download, ArrowRight, ExternalLink, AlertCircle, CheckCircle2, Clock, MinusCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ESGReport as ESGReportType, ScoredTopic, ContactInfo } from "@/lib/esgEngine";
import { generateESGPdf } from "@/lib/generatePdf";
import actRightLogo from "@/assets/actright-logo.png";

interface Props {
  report: ESGReportType;
  contact: ContactInfo;
  onRestart: () => void;
}

const labelMeta: Record<string, { color: string; icon: any; bg: string }> = {
  "Nu verplicht":                                       { color: "text-destructive", bg: "bg-destructive/10",        icon: AlertCircle },
  "Hoog relevant via keten":                            { color: "text-accent",      bg: "bg-accent/15",              icon: CheckCircle2 },
  "Marktstandaard / aanbevolen":                        { color: "text-primary",     bg: "bg-primary/10",             icon: CheckCircle2 },
  "Sectorspecifiek vervolgonderzoek":                   { color: "text-info",        bg: "bg-blue-100",               icon: AlertCircle },
  "Monitoren / voorbereiden":                           { color: "text-warning",     bg: "bg-amber-100",              icon: Clock },
  "Mogelijk relevant – nadere toetsing aanbevolen":     { color: "text-warning",     bg: "bg-amber-50",               icon: AlertCircle },
  "Niet prioritair":                                    { color: "text-muted-foreground", bg: "bg-muted",             icon: MinusCircle },
};

const maturityProgress: Record<string, { step: number; color: string }> = {
  "Startfase":               { step: 1, color: "bg-amber-500" },
  "Basis op orde brengen":   { step: 2, color: "bg-info" },
  "Structureren":            { step: 3, color: "bg-accent" },
  "Opschalen":               { step: 4, color: "bg-success" },
};

export default function ESGReport({ report, contact, onRestart }: Props) {
  const handleDownload = () => {
    const pdf = generateESGPdf(report, contact);
    const safeCompany = contact.companyName.replace(/[^a-zA-Z0-9]/g, "_");
    pdf.save(`ESG-Quickscan-${safeCompany}.pdf`);
  };

  const handleDiscoveryCall = () => {
    window.open("https://www.actright.nl/contact", "_blank");
  };

  const maturity = maturityProgress[report.maturityLabel];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <img src={actRightLogo} alt="Act Right" className="h-9" />
          <div className="flex items-center gap-3">
            <Button onClick={onRestart} variant="ghost" size="sm" className="text-muted-foreground hidden sm:inline-flex">
              <RefreshCcw className="h-4 w-4 mr-2" /> Opnieuw
            </Button>
            <Button onClick={handleDownload} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Hero summary */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-soft pointer-events-none" />
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20 relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-4">Uw ESG Quickscan Resultaat</p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-primary leading-[1.05] tracking-tight mb-4">
              {contact.companyName}
            </h1>
            <p className="text-sm text-muted-foreground tracking-wide mb-8">{report.profileType}</p>

            <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">
              <p className="text-lg lg:text-xl text-foreground leading-relaxed max-w-3xl">
                {report.summary}
              </p>

              <div className="bg-card border border-border rounded-2xl p-6 shadow-elegant min-w-[280px]">
                <div className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-3">Volwassenheid</div>
                <div className="font-heading text-3xl text-primary mb-3">{report.maturityLabel}</div>
                <div className="flex gap-1.5 mb-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= maturity.step ? maturity.color : "bg-muted"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{report.maturityExplanation}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 lg:px-10 py-16 space-y-20">
        {/* Wat nu relevant */}
        <Section
          eyebrow="01 — Direct relevant"
          title="Wat nu relevant is"
          subtitle={`Op basis van uw antwoorden zijn dit de ${report.nuRelevant.length} belangrijkste aandachtspunten. Begin hier.`}
        >
          {report.nuRelevant.length === 0 ? (
            <EmptyCard text="Op basis van uw antwoorden zien wij momenteel geen ESG-onderwerpen die directe actie vereisen. Een verkenning kan dit beeld bevestigen of nuanceren." />
          ) : (
            <div className="space-y-4">
              {report.nuRelevant.map((t, i) => <TopicCard key={t.topic.id} item={t} index={i + 1} />)}
            </div>
          )}
        </Section>

        {/* Binnenkort relevant */}
        {report.binnenkortRelevant.length > 0 && (
          <Section
            eyebrow="02 — Op de horizon"
            title="Wat binnenkort relevant wordt"
            subtitle="Onderwerpen waar u zich op moet voorbereiden in de komende 1-3 jaar."
          >
            <div className="space-y-4">
              {report.binnenkortRelevant.map((t, i) => <TopicCard key={t.topic.id} item={t} index={i + 1} compact />)}
            </div>
          </Section>
        )}

        {/* Geen prioriteit */}
        {report.geenPrioriteit.length > 0 && (
          <Section
            eyebrow="03 — Geen zorg"
            title="Wat nu geen prioriteit heeft"
            subtitle="Onderwerpen die vaak worden overschat, maar voor uw organisatie nu niet direct relevant zijn."
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {report.geenPrioriteit.map(t => (
                <div key={t.topic.id} className="bg-muted/40 border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MinusCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-primary">{t.topic.subject}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t.reasons[0]}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Acties */}
        <Section
          eyebrow="04 — Actie"
          title="Concrete vervolgstappen"
          subtitle={`5 acties op maat — afgestemd op uw volwassenheidsniveau (${report.maturityLabel.toLowerCase()}) en drijfveer.`}
        >
          <div className="space-y-3">
            {report.acties.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-4 bg-card border border-border rounded-lg p-5 hover:border-accent/40 transition-colors"
              >
                <span className="font-heading text-2xl text-accent w-10 flex-shrink-0 leading-none">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-sm text-foreground leading-relaxed pt-1">{a}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Discovery call CTA */}
        <section className="bg-hero rounded-2xl text-primary-foreground p-10 lg:p-14 shadow-elegant relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-4">Volgende stap</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
              Wilt u weten wat dit concreet betekent voor <em className="text-accent" style={{ fontStyle: "italic" }}>uw</em> organisatie?
            </h2>
            <p className="text-base text-primary-foreground/75 mb-8 leading-relaxed">
              Plan een gratis ESG Discovery Call met Act Right. In 30 minuten vertalen we deze quickscan naar een concrete aanpak voor uw situatie.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleDiscoveryCall} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-13 px-7 font-semibold">
                <Calendar className="h-4 w-4 mr-2" />
                Plan Discovery Call
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button onClick={handleDownload} size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 h-13 px-7 font-semibold">
                <Download className="h-4 w-4 mr-2" />
                Download PDF rapport
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground/70 mt-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src={actRightLogo} alt="Act Right" className="h-8 brightness-0 invert opacity-90" />
          <p className="text-xs tracking-wider uppercase text-accent/80">act responsible · act win-win · act now</p>
          <a href="https://www.actright.nl" className="text-xs hover:text-accent transition-colors">www.actright.nl · info@actright.nl</a>
        </div>
      </footer>
    </div>
  );
}

function Section({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-accent mb-3">{eyebrow}</p>
        <h2 className="font-heading text-3xl sm:text-4xl text-primary leading-tight tracking-tight mb-3">{title}</h2>
        {subtitle && <p className="text-base text-muted-foreground leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function TopicCard({ item, index, compact }: { item: ScoredTopic; index: number; compact?: boolean }) {
  const meta = labelMeta[item.label] ?? labelMeta["Marktstandaard / aanbevolen"];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="bg-card border border-border rounded-xl p-6 lg:p-7 shadow-card hover:shadow-soft transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 min-w-0">
          <span className="font-heading text-2xl text-accent flex-shrink-0 leading-none w-9">{String(index).padStart(2, "0")}</span>
          <div className="min-w-0">
            <h3 className="font-heading text-xl lg:text-2xl text-primary leading-tight mb-1.5">{item.topic.subject}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${meta.bg} ${meta.color}`}>
                <Icon className="h-3 w-3" /> {item.label}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                {item.topic.directIndirect}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                {item.horizon}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">{item.topic.description}</p>
      )}

      {item.reasons.length > 0 && (
        <div className="bg-accent-soft/40 border-l-2 border-accent pl-4 py-3 mb-3 rounded-r">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Waarom voor u relevant</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{item.reasons[0]}</p>
        </div>
      )}

      {!compact && item.topic.url && (
        <a
          href={item.topic.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-accent transition-colors"
        >
          Meer informatie <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </motion.div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
      <p className="text-sm text-muted-foreground max-w-md mx-auto">{text}</p>
    </div>
  );
}
