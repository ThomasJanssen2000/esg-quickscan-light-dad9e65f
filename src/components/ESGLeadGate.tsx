import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { LeadFormData } from "@/lib/submitLead";
import actRightLogo from "@/assets/actright-logo.png";

interface Props {
  onSubmit: (form: LeadFormData) => Promise<void> | void;
  onBack: () => void;
}

const employeeOptions = ["1-9", "10-49", "50-249", "250+"];

export default function ESGLeadGate({ onSubmit, onBack }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [employees, setEmployees] = useState("");
  const [consentProcessing, setConsentProcessing] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const valid =
    firstName.trim() &&
    lastName.trim() &&
    companyName.trim() &&
    isEmail &&
    consentProcessing;

  const handleClick = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        employees: employees || undefined,
        consentProcessing: true,
        subscribeToUpdates,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <img src={actRightLogo} alt="Act Right" className="h-9" />
          <span className="text-xs font-medium text-muted-foreground">Bijna klaar</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 lg:px-10 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-xs font-semibold text-primary mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Uw ESG-profiel is gereed
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl text-primary leading-tight tracking-tight mb-4 font-extrabold">
              Uw ESG-profiel is <span className="text-primary/70">gereed</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Wij hebben meerdere relevante ESG-aandachtspunten gevonden voor uw organisatie. Vul uw gegevens in om direct uw rapport te bekijken en gratis te downloaden.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-soft p-8 lg:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Voornaam *">
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Voornaam" className="h-12" />
              </Field>
              <Field label="Achternaam *">
                <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Achternaam" className="h-12" />
              </Field>
              <Field label="Bedrijfsnaam *" full>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Uw organisatie" className="h-12" />
              </Field>
              <Field label="Zakelijk e-mailadres *" full>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="naam@organisatie.nl" className="h-12" />
              </Field>
              <Field label="Telefoonnummer">
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+31 …" className="h-12" />
              </Field>
              <Field label="Aantal medewerkers">
                <select value={employees} onChange={e => setEmployees(e.target.value)} className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Selecteer…</option>
                  {employeeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-7 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={consentProcessing}
                  onCheckedChange={v => setConsentProcessing(!!v)}
                  className="mt-0.5"
                  aria-label="Akkoord met verwerking"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Ik ga akkoord met de verwerking van mijn gegevens om het ESG-rapport te genereren en via e-mail te ontvangen. Lees de{" "}
                  <a
                    href="/privacyverklaring"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/70"
                  >
                    privacyverklaring
                  </a>
                  . *
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={subscribeToUpdates}
                  onCheckedChange={v => setSubscribeToUpdates(!!v)}
                  className="mt-0.5"
                  aria-label="Aanmelden voor ESG-updates"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  Ja, ik ontvang graag maximaal 1 keer per maand relevante ESG-updates, whitepapers en uitnodigingen van Act Right. Ik kan me op elk moment uitschrijven.
                </span>
              </label>
            </div>

            <Button
              onClick={handleClick}
              disabled={!valid || submitting}
              className="w-full mt-7 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold btn-pill disabled:opacity-30 text-base"
              style={{ height: "52px" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Rapport wordt gegenereerd…
                </>
              ) : (
                <>
                  Bekijk mijn rapport
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="mt-5 flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Uw gegevens worden vertrouwelijk behandeld en maximaal 24 maanden bewaard.
            </div>
          </div>

          <button onClick={onBack} className="mt-6 flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Terug naar vragen
          </button>
        </motion.div>
      </main>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-xs font-semibold text-primary mb-2 block tracking-wide">{label}</Label>
      {children}
    </div>
  );
}
