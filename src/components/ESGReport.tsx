import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Target, BookOpen, CheckCircle2, AlertCircle, MinusCircle, RotateCcw, Mail, Info, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { ESGReport as ESGReportType, FrameworkAssessment } from "@/lib/esgScoring";

interface Props {
  report: ESGReportType;
  companyName: string;
  onRestart: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 60 ? "hsl(155, 60%, 40%)" : score >= 40 ? "hsl(40, 80%, 50%)" : "hsl(0, 70%, 55%)";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(210, 15%, 88%)" strokeWidth="8" />
        <motion.circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut" }} transform="rotate(-90 60 60)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="font-heading text-3xl font-extrabold text-primary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>{score}</motion.span>
        <span className="text-xs text-muted-foreground font-medium">van 100</span>
      </div>
    </div>
  );
}

function CategoryBar({ label, percentage }: { label: string; percentage: number }) {
  const color = percentage >= 60 ? "bg-secondary" : percentage >= 40 ? "bg-yellow-500" : "bg-destructive";
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-semibold text-foreground w-44 flex-shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>
      <span className="text-sm font-bold text-primary w-10 text-right">{percentage}%</span>
    </div>
  );
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  "verplicht": { color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle },
  "waarschijnlijk relevant": { color: "text-yellow-600", bg: "bg-yellow-50", icon: AlertTriangle },
  "aanbevolen": { color: "text-secondary", bg: "bg-secondary/10", icon: CheckCircle2 },
  "vrijwillig": { color: "text-muted-foreground", bg: "bg-muted/50", icon: Info },
  "nog niet van toepassing": { color: "text-muted-foreground", bg: "bg-muted/30", icon: MinusCircle },
};

function FrameworkCard({ fw }: { fw: FrameworkAssessment }) {
  const config = statusConfig[fw.status] || statusConfig["vrijwillig"];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border border-border/60 ${config.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-heading font-bold text-sm text-foreground">{fw.name}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color} border border-current/20`}>
              {fw.status}
            </span>
            <span className="text-xs text-muted-foreground">· {fw.type}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{fw.fullName}</p>
          <p className="text-sm text-foreground leading-relaxed">{fw.reason}</p>
          {fw.actionRequired && (
            <p className="text-sm text-secondary font-medium mt-2">→ {fw.actionRequired}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ESGReport({ report, companyName, onRestart }: Props) {
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadName, setDownloadName] = useState("");
  const [downloadEmail, setDownloadEmail] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const canDownload = downloadName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(downloadEmail);

  const handleDownloadPdf = async () => {
    if (!canDownload) return;
    setIsGenerating(true);
    try {
      const { generateESGPdf } = await import("@/lib/generatePdf");
      const doc = generateESGPdf(report, companyName);
      doc.save(`ESG-Quickscan-${companyName.replace(/\s+/g, "-")}.pdf`);
      setShowDownloadDialog(false);
      setDownloadName("");
      setDownloadEmail("");
    } finally {
      setIsGenerating(false);
    }
  };

  const verplicht = report.frameworks.filter((f) => f.status === "verplicht");
  const relevant = report.frameworks.filter((f) => f.status === "waarschijnlijk relevant");
  const aanbevolen = report.frameworks.filter((f) => f.status === "aanbevolen");
  const rest = report.frameworks.filter((f) => f.status === "vrijwillig" || f.status === "nog niet van toepassing");

  return (
    <>
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-primary">Rapport downloaden als PDF</DialogTitle>
            <DialogDescription>Vul uw naam en e-mailadres in om het rapport te downloaden.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Naam</Label>
              <Input value={downloadName} onChange={(e) => setDownloadName(e.target.value)} placeholder="Uw volledige naam" />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">E-mailadres</Label>
              <Input value={downloadEmail} onChange={(e) => setDownloadEmail(e.target.value)} placeholder="uw@email.nl" type="email" />
            </div>
            <Button onClick={handleDownloadPdf} disabled={!canDownload || isGenerating} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-xl">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {isGenerating ? "Genereren..." : "Download PDF"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen flex flex-col">
        <header className="px-6 py-5 flex items-center justify-between border-b border-border/50">
          <div className="font-heading font-bold text-xl tracking-tight text-primary">Act Right</div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowDownloadDialog(true)} variant="outline" size="sm" className="rounded-xl border-secondary text-secondary hover:bg-secondary/10">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">ESG Rapport</span>
          </div>
        </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Hero score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border/60 p-8 text-center shadow-sm">
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-primary mb-1">ESG Quickscan Light — Rapport</h1>
            <p className="text-muted-foreground mb-6">{companyName}</p>
            <ScoreRing score={report.overallScore} />
            <div className="mt-4">
              <span className="inline-block bg-secondary/10 text-secondary font-heading font-bold text-sm px-4 py-1.5 rounded-full">{report.maturityLevel}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">{report.maturityDescription}</p>
          </motion.div>

          {/* Category breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border/60 p-8 shadow-sm">
            <h2 className="font-heading font-bold text-lg text-primary mb-5">Score per thema</h2>
            <div className="space-y-4">
              {report.categoryScores.map((c) => (
                <CategoryBar key={c.category} label={c.label} percentage={c.percentage} />
              ))}
            </div>
          </motion.div>

          {/* Risks */}
          <Section icon={AlertTriangle} title="Geïdentificeerde risico's" items={report.risks} iconColor="text-destructive" delay={0.2} />

          {/* Opportunities */}
          <Section icon={TrendingUp} title="Kansen" items={report.opportunities} iconColor="text-secondary" delay={0.3} />

          {/* Priorities */}
          <Section icon={Target} title="Prioriteiten voor de korte termijn" items={report.priorities} iconColor="text-primary" delay={0.4} />

          {/* Frameworks - grouped */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl border border-border/60 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-heading font-bold text-lg text-primary">Regelgeving, standaarden & frameworks</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Op basis van uw antwoorden hebben we beoordeeld welke regelgeving, standaarden en frameworks relevant zijn voor uw organisatie.
            </p>

            {verplicht.length > 0 && (
              <div className="mb-6">
                <h3 className="font-heading font-bold text-sm text-destructive mb-3 uppercase tracking-wide">Verplicht</h3>
                <div className="space-y-3">{verplicht.map((f) => <FrameworkCard key={f.name} fw={f} />)}</div>
              </div>
            )}
            {relevant.length > 0 && (
              <div className="mb-6">
                <h3 className="font-heading font-bold text-sm text-yellow-600 mb-3 uppercase tracking-wide">Waarschijnlijk relevant</h3>
                <div className="space-y-3">{relevant.map((f) => <FrameworkCard key={f.name} fw={f} />)}</div>
              </div>
            )}
            {aanbevolen.length > 0 && (
              <div className="mb-6">
                <h3 className="font-heading font-bold text-sm text-secondary mb-3 uppercase tracking-wide">Aanbevolen</h3>
                <div className="space-y-3">{aanbevolen.map((f) => <FrameworkCard key={f.name} fw={f} />)}</div>
              </div>
            )}
            {rest.length > 0 && (
              <div>
                <h3 className="font-heading font-bold text-sm text-muted-foreground mb-3 uppercase tracking-wide">Overig</h3>
                <div className="space-y-3">{rest.map((f) => <FrameworkCard key={f.name} fw={f} />)}</div>
              </div>
            )}
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-primary rounded-2xl p-8 text-center">
            <h2 className="font-heading text-xl font-bold text-primary-foreground mb-2">Klaar voor de volgende stap?</h2>
            <p className="text-primary-foreground/80 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Dit is een eerste indicatie. Met de volledige ESG Quickscan van Act Right krijgt u een diepgaande analyse, persoonlijk advies en een concreet actieplan — afgestemd op uw organisatie.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-6 rounded-xl">
                <a href="mailto:info@actright.nl?subject=ESG%20Quickscan%20-%20Meer%20informatie">
                  <Mail className="mr-2 h-4 w-4" />
                  Neem contact op
                </a>
              </Button>
              <Button variant="outline" onClick={onRestart} className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded-xl">
                <RotateCcw className="mr-2 h-4 w-4" />
                Opnieuw invullen
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Act Right · Adviesbureau Eindhoven · Dit rapport is indicatief en vervangt geen professioneel advies.</p>
      </footer>
    </div>
  );
}

function Section({ icon: Icon, title, items, iconColor, delay }: { icon: React.ElementType; title: string; items: string[]; iconColor: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card rounded-2xl border border-border/60 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h2 className="font-heading font-bold text-lg text-primary">{title}</h2>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-secondary flex-shrink-0" />
            <span className="text-sm text-foreground leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
