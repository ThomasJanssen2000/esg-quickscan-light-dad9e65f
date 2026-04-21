// HubSpot Forms API v3 configuratie voor de ESG Quickscan Light.
//
// Deze IDs zijn NIET geheim — ze staan zichtbaar in elke HubSpot-embed-code
// en zijn ontworpen om client-side gebruikt te worden. Ze committen is veilig.
//
// Overschrijven per omgeving:
//   - Lokale dev: zet VITE_HUBSPOT_PORTAL_ID / VITE_HUBSPOT_FORM_GUID in .env.local
//   - Productie: pas deze defaults aan (of draai scripts/hubspot-setup.ps1
//     tegen een ander HubSpot-portal; die update dit bestand).

const envPortalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID as
  | string
  | undefined;
const envFormGuid = import.meta.env.VITE_HUBSPOT_FORM_GUID as
  | string
  | undefined;

export const HUBSPOT_PORTAL_ID = envPortalId || "20146126";
export const HUBSPOT_FORM_GUID =
  envFormGuid || "f113877a-970e-4c25-8751-d6fa232b5c7a";
