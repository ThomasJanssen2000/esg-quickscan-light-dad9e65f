import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import actRightLogo from "@/assets/actright-logo.png";

interface Props {
  companyName: string;
  onSubmit: (name: string, email: string) => void;
  onBack: () => void;
}

export default function ESGLeadGate({ companyName, onSubmit, onBack }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const isValid = name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-8 py-6 flex items-center justify-between border-b border-border/40">
        <img src={actRightLogo} alt="Act Right — for a better future" className="h-8 sm:h-10" />
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide">ESG Quickscan Light</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-card rounded-lg border border-border/60 p-8">
            <div className="text-center mb-8">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <h1 className="font-heading text-2xl font-extrabold text-primary mb-2">
                Uw rapport is klaar
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vul uw gegevens in om het persoonlijke ESG-rapport voor <strong className="text-foreground">{companyName}</strong> te bekijken.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">Naam</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Uw volledige naam"
                    className="h-12 pl-10 rounded-md border-border"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1.5 block">E-mailadres</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="uw@email.nl"
                    type="email"
                    className="h-12 pl-10 rounded-md border-border"
                  />
                </div>
              </div>
              <Button
                onClick={() => isValid && onSubmit(name.trim(), email.trim())}
                disabled={!isValid}
                className="w-full bg-accent hover:bg-accent/85 text-accent-foreground font-semibold h-12 rounded-md disabled:opacity-40"
              >
                bekijk mijn rapport
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-5 leading-relaxed">
              Wij gebruiken uw gegevens alleen om contact met u op te nemen over uw ESG-resultaten. Geen spam, dat beloven we.
            </p>
          </div>
        </motion.div>
      </main>

      <div className="px-8 py-5 border-t border-border/40 flex justify-start bg-background">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          terug naar vragen
        </Button>
      </div>
    </div>
  );
}
