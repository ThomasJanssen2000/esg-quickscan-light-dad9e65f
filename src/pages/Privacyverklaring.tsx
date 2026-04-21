import { Link } from "react-router-dom";
import actRightLogo from "@/assets/actright-logo.png";

/**
 * Privacyverklaring voor de ESG Quickscan Light.
 *
 * Deze tekst is een werkversie die Act Right juridisch nog moet valideren
 * voordat de Quickscan live gaat. Plaatshouders staan tussen vierkante haken
 * en moeten worden ingevuld voordat deze pagina publiek bereikbaar is.
 */
export default function Privacyverklaring() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={actRightLogo} alt="Act Right" className="h-9" />
          </Link>
          <span className="text-xs font-medium text-muted-foreground">Privacyverklaring</span>
        </div>
      </header>

      <main className="flex-1 px-6 lg:px-10 py-12">
        <article className="prose prose-slate max-w-3xl mx-auto">
          <h1 className="font-heading text-primary">Privacyverklaring ESG Quickscan Light</h1>
          <p className="text-sm text-muted-foreground">
            Versiedatum: [datum invullen]. Werkversie — juridisch valideren voor livegang.
          </p>

          <h2>1. Verwerkingsverantwoordelijke</h2>
          <p>
            Act Right B.V. ([adres], KvK [nummer]) is de verwerkingsverantwoordelijke
            voor de persoonsgegevens die via de ESG Quickscan Light worden verzameld.
            Voor privacyvragen kunt u contact opnemen via{" "}
            <a href="mailto:privacy@actright.nl">privacy@actright.nl</a>.
          </p>

          <h2>2. Welke gegevens verwerken wij</h2>
          <ul>
            <li>Voor- en achternaam, bedrijfsnaam, zakelijk e-mailadres, telefoonnummer (optioneel), aantal medewerkers.</li>
            <li>Uw antwoorden op de 20 quickscan-vragen en het gegenereerde ESG-profiel.</li>
            <li>Afgeleide leadsegmentatie (hot / warm / koud) op basis van bedrijfsomvang en ketendruk.</li>
            <li>Technische gegevens: browser-type, datum en tijd van de scan, HubSpot-trackingcookie (indien geplaatst).</li>
          </ul>

          <h2>3. Doelen en rechtsgrondslag</h2>
          <table>
            <thead>
              <tr>
                <th>Doel</th>
                <th>Rechtsgrond (AVG)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Genereren en leveren van uw ESG-rapport</td>
                <td>Uitvoering van de overeenkomst (art. 6 lid 1 sub b)</td>
              </tr>
              <tr>
                <td>Verzenden van ESG-updates en whitepapers (alleen na opt-in)</td>
                <td>Toestemming (art. 6 lid 1 sub a)</td>
              </tr>
              <tr>
                <td>Contact opnemen voor een vervolggesprek</td>
                <td>Gerechtvaardigd belang (art. 6 lid 1 sub f)</td>
              </tr>
            </tbody>
          </table>

          <h2>4. Ontvangers en verwerkers</h2>
          <ul>
            <li>
              <strong>HubSpot</strong> — CRM- en marketingplatform. Gegevens worden
              verwerkt in [EU- of US-datacenter, specificeer]. HubSpot treedt op
              als verwerker onder een Data Processing Agreement.
            </li>
            <li>
              <strong>Hostingprovider</strong> ([naam hostingpartij]) — voor het
              leveren van de website.
            </li>
            <li>
              Wij delen uw gegevens niet met andere derden, tenzij wij daartoe
              wettelijk verplicht zijn.
            </li>
          </ul>

          <h2>5. Doorgifte buiten de EER</h2>
          <p>
            Indien HubSpot gegevens verwerkt buiten de Europese Economische Ruimte,
            gebeurt dit op basis van de Standard Contractual Clauses van de
            Europese Commissie en het EU-US Data Privacy Framework. Wij vragen
            HubSpot om passende beveiligingsmaatregelen.
          </p>

          <h2>6. Bewaartermijn</h2>
          <p>
            Wij bewaren uw gegevens maximaal 24 maanden na uw laatste interactie,
            tenzij u eerder om verwijdering verzoekt of tenzij u klant wordt van
            Act Right. In dat geval gelden de bewaartermijnen uit ons algemene
            klantprivacybeleid.
          </p>

          <h2>7. Uw rechten</h2>
          <p>U heeft het recht om:</p>
          <ul>
            <li>uw gegevens in te zien, te laten corrigeren of te laten verwijderen;</li>
            <li>bezwaar te maken tegen de verwerking op basis van gerechtvaardigd belang;</li>
            <li>uw toestemming voor marketingcommunicatie op elk moment in te trekken;</li>
            <li>uw gegevens in een gangbaar formaat te laten overdragen (dataportabiliteit);</li>
            <li>
              een klacht in te dienen bij de Autoriteit Persoonsgegevens via{" "}
              <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noreferrer">
                autoriteitpersoonsgegevens.nl
              </a>.
            </li>
          </ul>
          <p>
            Een verzoek kunt u indienen via{" "}
            <a href="mailto:privacy@actright.nl">privacy@actright.nl</a>. Wij
            reageren binnen een maand.
          </p>

          <h2>8. Cookies</h2>
          <p>
            De ESG Quickscan gebruikt uitsluitend functionele cookies die nodig
            zijn voor de werking van het formulier. Als de HubSpot-trackingpixel
            wordt geplaatst, gebeurt dit alleen na expliciete toestemming via de
            cookiebanner. [Werk bij als tracking-pixels of analytics worden
            toegevoegd.]
          </p>

          <h2>9. Wijzigingen</h2>
          <p>
            Wij kunnen deze privacyverklaring aanpassen. De meest actuele versie
            staat altijd op deze pagina, met een versiedatum.
          </p>

          <div className="mt-10 not-prose">
            <Link
              to="/"
              className="text-primary underline underline-offset-2 hover:text-primary/70"
            >
              ← Terug naar de ESG Quickscan
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
