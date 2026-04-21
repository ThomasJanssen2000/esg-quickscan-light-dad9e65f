import { Info } from "lucide-react";

/**
 * Disclaimer-component voor de ESG Quickscan Light.
 *
 * Plaatsing: op de intro-pagina (compact), bovenaan het rapport (full),
 * en onderin de gegenereerde PDF (via generatePdf.ts als losse tekst).
 *
 * Juridisch doel: de klant duidelijk informeren dat het rapport een
 * indicatieve inschatting is op basis van high-level antwoorden, geen
 * juridisch advies, en dat definitieve beoordeling altijd verificatie
 * door Act Right of een eigen jurist vereist.
 */

interface Props {
  variant?: "compact" | "full";
  className?: string;
}

export default function ESGDisclaimer({ variant = "full", className = "" }: Props) {
  if (variant === "compact") {
    return (
      <div
        className={`flex items-start gap-2 text-xs text-muted-foreground ${className}`}
        role="note"
        aria-label="Disclaimer over de reikwijdte van de scan"
      >
        <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary/60" aria-hidden />
        <span>
          De Quickscan geeft een <span className="font-semibold">indicatief</span>{" "}
          beeld op basis van uw antwoorden. Act Right adviseert om de toepasselijkheid
          van elk onderwerp zelf te verifiëren of met ons te bespreken.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-primary/15 bg-primary/5 p-4 sm:p-5 ${className}`}
      role="note"
      aria-label="Disclaimer over de reikwijdte en status van het ESG-rapport"
    >
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Info className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div className="text-sm leading-relaxed text-primary/80">
          <p className="font-semibold text-primary mb-1">Let op: indicatief rapport</p>
          <p>
            Dit rapport is tot stand gekomen op basis van de 20 antwoorden die u in de
            Quickscan heeft gegeven. Het geeft een{" "}
            <span className="font-semibold">globale inschatting</span> van welke
            ESG-onderwerpen voor uw organisatie relevant lijken — géén juridisch of
            compliance-advies. Wettelijke drempels (zoals CSRD, CSDDD, EU-ETS of NL-
            energiebesparingsplicht) hangen vaak af van details die een korte scan niet
            volledig kan uitvragen.
          </p>
          <p className="mt-2">
            Act Right adviseert nadrukkelijk om de toepasselijkheid van de genoemde
            onderwerpen zelf te verifiëren, óf dit samen met ons op te pakken in een
            vervolggesprek voordat u compliance- of investeringsbesluiten neemt.
          </p>
        </div>
      </div>
    </div>
  );
}
