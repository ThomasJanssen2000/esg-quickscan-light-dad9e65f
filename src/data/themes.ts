export interface Theme { id: string; name: string; purpose: string; output: string }

export const themes: Theme[] = [
  { id: "T1", name: "Rapportage & ketendruk", purpose: "Bepalen of de klant nu al informatie moet aanleveren aan klanten, financiers of stakeholders.", output: "VSME, CSRD-indirect, ESRS-datapunten, EcoVadis, GHG Protocol, klantvragen." },
  { id: "T2", name: "Energie & klimaat", purpose: "Bepalen of energieverplichtingen, CO2-inzicht en reductie belangrijk zijn.", output: "Energiebesparingsplicht-check, footprint, GHG Protocol, ISO 50001, CO2-Prestatieladder." },
  { id: "T3", name: "Product & circulariteit", purpose: "Bepalen of product-, afval- en producentenverantwoordelijkheid spelen.", output: "UPV, WEEE, Batterijverordening, REACH/CLP, PPWR, ESPR, sectorspecifieke productregels." },
  { id: "T4", name: "Ketenverantwoordelijkheid & mensenrechten", purpose: "Bepalen of due diligence, risicoketens en internationale sourcing spelen.", output: "OECD Due Diligence, UNGPs, CSDDD-indirect, Forced Labour, EUDR, conflict minerals, leverancierscode." },
  { id: "T5", name: "Sociaal & veiligheid", purpose: "Bepalen of arbeidsomstandigheden, veiligheid en sociale standaarden prioriteit hebben.", output: "Arbo/RI&E, arbeidstijden, minimumloon, ISO 45001, klokkenluidersregeling, sociale audits." },
  { id: "T6", name: "Governance & integriteit", purpose: "Bepalen of privacy, governance, gedragscode en integriteit expliciet moeten worden genoemd.", output: "AVG, gedragscode, meldregeling, rollen & verantwoordelijkheden, anti-corruptie-watchlist." },
  { id: "T7", name: "Aanbestedingen & certificering", purpose: "Bepalen of certificeringen en bewijsvoering nodig zijn voor tenders en professioneel opdrachtgeverschap.", output: "CO2-Prestatieladder, ISO 14001, ISO 45001, duurzaam inkopen, bewijsvoering." },
  { id: "T8", name: "Commerciële claims & positionering", purpose: "Bepalen of claims onderbouwd moeten worden en of vrijwillige standaarden commercieel nuttig zijn.", output: "ACM Leidraad, claim-onderbouwing, B Corp, UN SDGs als communicatiekader." },
];
