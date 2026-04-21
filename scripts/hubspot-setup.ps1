# Automatische HubSpot-setup voor de ESG Quickscan Light.
# Zie .claude/skills/lead-webhook-hubspot/SKILL.md voor het ontwerp.
#
# Leest een HubSpot Private App token uit
#   %USERPROFILE%\.hubspot-quickscan-token
# en maakt:
#   - 7 custom contact-properties
#   - 1 form "ESG Quickscan Light" (legitimate interest, NL)
# Schrijft vervolgens .env.local met VITE_HUBSPOT_PORTAL_ID en _FORM_GUID.
#
# Idempotent: re-run is veilig. Bestaande properties en forms worden hergebruikt.
#
#Requires -Version 5.1

$ErrorActionPreference = "Stop"

$tokenPath = Join-Path $env:USERPROFILE ".hubspot-quickscan-token"
$repoRoot = Split-Path -Parent $PSScriptRoot
$envLocalPath = Join-Path $repoRoot ".env.local"
$configPath = Join-Path $repoRoot "src\config\hubspot.ts"

# --- Read token ---
if (-not (Test-Path $tokenPath)) {
    Write-Host "Token file niet gevonden: $tokenPath" -ForegroundColor Red
    Write-Host "Maak hem eerst aan (zie instructies in chat)." -ForegroundColor Red
    exit 1
}
$token = (Get-Content $tokenPath -Raw).Trim()
if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "Token file is leeg." -ForegroundColor Red
    exit 1
}

$headers = @{
    Authorization  = "Bearer $token"
    "Content-Type" = "application/json"
}

function Invoke-HSApi {
    param(
        [Parameter(Mandatory)][string]$Method,
        [Parameter(Mandatory)][string]$Path,
        $Body,
        [switch]$AllowNotFound
    )
    $uri = "https://api.hubapi.com$Path"
    $params = @{
        Uri     = $uri
        Method  = $Method
        Headers = $headers
    }
    if ($null -ne $Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 20 -Compress)
    }
    try {
        return Invoke-RestMethod @params
    }
    catch {
        $code = $null
        try { $code = $_.Exception.Response.StatusCode.value__ } catch {}
        if ($AllowNotFound -and $code -eq 404) { return $null }
        # $_.ErrorDetails.Message bevat in PS 5.1+ de response-body als string
        # (handiger dan GetResponseStream dat al door de HTTP-client gelezen kan zijn).
        $body = $null
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $body = $_.ErrorDetails.Message
        }
        if (-not $body) {
            try {
                $resp = $_.Exception.Response
                if ($resp) {
                    $stream = $resp.GetResponseStream()
                    if ($stream.CanSeek) { $stream.Position = 0 }
                    $reader = New-Object System.IO.StreamReader($stream)
                    $body = $reader.ReadToEnd()
                }
            } catch {}
        }
        if (-not $body) { $body = "(geen response-body teruggegeven)" }
        throw "HubSpot API $Method $Path faalde ($code): $body"
    }
}

Write-Host "== ESG Quickscan HubSpot Setup ==" -ForegroundColor Cyan

# --- 1. Verify token ---
Write-Host ""
Write-Host "[1/4] Token verifieren..."
$me = Invoke-HSApi -Method GET -Path "/integrations/v1/me"
$portalId = $me.portalId
Write-Host ("  OK  Portal ID: {0}   Domain: {1}" -f $portalId, $me.hubDomain) -ForegroundColor Green

# --- 2. Custom properties ---
Write-Host ""
Write-Host "[2/4] Custom contact-properties aanmaken..."

$properties = @(
    @{
        name        = "esg_sector"
        label       = "ESG Sector"
        type        = "string"
        fieldType   = "text"
        description = "Ingevulde sector in de ESG Quickscan Light (Q03)."
    },
    @{
        name        = "esg_maturity_label"
        label       = "ESG Maturity"
        type        = "enumeration"
        fieldType   = "select"
        description = "Maturity-fase zoals berekend door de ESG-engine."
        options     = @(
            @{ label = "Startfase";              value = "Startfase";              displayOrder = 0 },
            @{ label = "Basis op orde brengen";  value = "Basis op orde brengen";  displayOrder = 1 },
            @{ label = "Structureren";           value = "Structureren";           displayOrder = 2 },
            @{ label = "Opschalen";              value = "Opschalen";              displayOrder = 3 }
        )
    },
    @{
        name        = "esg_lead_segment"
        label       = "ESG Lead Segment"
        type        = "enumeration"
        fieldType   = "select"
        description = "hot / warm / koud, afgeleid van bedrijfsomvang, ketendruk en volwassenheid."
        options     = @(
            @{ label = "hot";   value = "hot";   displayOrder = 0 },
            @{ label = "warm";  value = "warm";  displayOrder = 1 },
            @{ label = "koud";  value = "koud";  displayOrder = 2 }
        )
    },
    @{
        name        = "esg_top_themes"
        label       = "ESG Top themes"
        type        = "string"
        fieldType   = "text"
        description = "Pipe-separated lijst van top 3 actieve thema-IDs (T1..T8)."
    },
    @{
        name        = "esg_primary_driver"
        label       = "ESG Primary driver"
        type        = "string"
        fieldType   = "text"
        description = "Belangrijkste reden om met ESG aan de slag te gaan (Q20)."
    },
    @{
        name        = "esg_scan_date"
        label       = "ESG Scan date"
        type        = "string"
        fieldType   = "text"
        description = "Datum van invullen in YYYY-MM-DD."
    },
    @{
        name        = "esg_marketing_optin"
        label       = "ESG Marketing opt-in"
        type        = "enumeration"
        fieldType   = "booleancheckbox"
        description = "Opt-in voor ESG-updates en whitepapers (apart van verwerkingsgrondslag)."
        options     = @(
            @{ label = "Ja";  value = "true";  displayOrder = 0 },
            @{ label = "Nee"; value = "false"; displayOrder = 1 }
        )
    },
    @{
        name        = "esg_report_url"
        label       = "ESG Report URL"
        type        = "string"
        fieldType   = "text"
        description = "Publieke link naar de PDF van het ESG-rapport (Supabase Storage). Gebruik deze link om het rapport van de klant te openen."
    }
)

foreach ($p in $properties) {
    $name = $p.name
    $existing = Invoke-HSApi -Method GET -Path "/crm/v3/properties/contacts/$name" -AllowNotFound
    if ($existing) {
        Write-Host ("  =   Bestaat al: {0}" -f $name) -ForegroundColor DarkYellow
    }
    else {
        $p.groupName = "contactinformation"
        Invoke-HSApi -Method POST -Path "/crm/v3/properties/contacts" -Body $p | Out-Null
        Write-Host ("  +   Aangemaakt: {0}" -f $name) -ForegroundColor Green
    }
}

# --- 3. Form ---
Write-Host ""
Write-Host "[3/4] Form 'ESG Quickscan Light' aanmaken/controleren..."

# Desired state: alle velden die de form moet hebben.
$baseValidation = @{ blockedEmailAddresses = @(); useDefaultBlockList = $false }
function New-FormField {
    param($FieldType, $Name, $Label, [bool]$Required, [bool]$Hidden)
    return @{
        fieldType    = $FieldType
        objectTypeId = "0-1"
        name         = $Name
        label        = $Label
        required     = $Required
        hidden       = $Hidden
        description  = ""
        defaultValue = ""
        placeholder  = ""
        validation   = $baseValidation
    }
}
$fields = @(
    (New-FormField "email"            "email"               "Zakelijk e-mailadres" $true  $false),
    (New-FormField "single_line_text" "firstname"           "Voornaam"             $true  $false),
    (New-FormField "single_line_text" "lastname"            "Achternaam"           $true  $false),
    (New-FormField "single_line_text" "company"             "Bedrijfsnaam"         $true  $false),
    (New-FormField "phone"            "phone"               "Telefoonnummer"       $false $false),
    (New-FormField "single_line_text" "numemployees"        "Aantal medewerkers"   $false $false),
    (New-FormField "single_line_text" "esg_sector"          "ESG Sector"           $false $true),
    (New-FormField "single_line_text" "esg_maturity_label"  "ESG Maturity"         $false $true),
    (New-FormField "single_line_text" "esg_lead_segment"    "ESG Lead segment"     $false $true),
    (New-FormField "single_line_text" "esg_top_themes"      "ESG Top themes"       $false $true),
    (New-FormField "single_line_text" "esg_primary_driver"  "ESG Primary driver"   $false $true),
    (New-FormField "single_line_text" "esg_scan_date"       "ESG Scan date"        $false $true),
    (New-FormField "single_line_text" "esg_marketing_optin" "ESG Marketing opt-in" $false $true),
    (New-FormField "single_line_text" "esg_report_url"      "ESG Report URL"       $false $true)
)

# HubSpot v3 Forms beperkt groepen tot max 3 velden. Dynamische chunking.
$fieldGroups = @()
for ($i = 0; $i -lt $fields.Count; $i += 3) {
    $chunk = @()
    $end = [Math]::Min($i + 3, $fields.Count)
    for ($j = $i; $j -lt $end; $j++) { $chunk += $fields[$j] }
    $fieldGroups += @{
        groupType    = "default_group"
        richTextType = "text"
        fields       = $chunk
    }
}

$formConfiguration = @{
    language                    = "nl"
    cloneable                   = $true
    postSubmitAction            = @{ type = "thank_you"; value = "Bedankt. Uw rapport wordt geopend." }
    editable                    = $true
    archivable                  = $true
    recaptchaEnabled            = $false
    notifyContactOwner          = $false
    notifyRecipients            = @()
    createNewContactForNewEmail = $false
    prePopulateKnownValues      = $true
    allowLinkToResetKnownValues = $false
    lifecycleStages             = @()
}
$formDisplay = @{
    renderRawHtml    = $false
    theme            = "default_style"
    submitButtonText = "Bekijk mijn rapport"
    style            = @{
        fontFamily              = "arial, helvetica, sans-serif"
        backgroundWidth         = "100%"
        labelTextColor          = "#384026"
        labelTextSize           = "13px"
        helpTextColor           = "#7C98B6"
        helpTextSize            = "11px"
        legalConsentTextColor   = "#384026"
        legalConsentTextSize    = "14px"
        submitColor             = "#C5D63D"
        submitAlignment         = "left"
        submitFontColor         = "#384026"
        submitSize              = "12px"
    }
    cssClass         = ""
}
# Legitimate interest met createdAt bleek schema-onvriendelijk in v3. 'none'
# betekent hier: geen HubSpot-managed consent-block in dit form; onze eigen
# React-UI vangt de AVG-consent op (required checkbox + aparte marketing
# opt-in via esg_marketing_optin).
$formLegal = @{ type = "none" }

# Check bestaande form
$existingForms = Invoke-HSApi -Method GET -Path "/marketing/v3/forms/?limit=200"
$existingForm = $null
foreach ($f in $existingForms.results) {
    if ($f.name -eq "ESG Quickscan Light") { $existingForm = $f; break }
}

if (-not $existingForm) {
    $nowMs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $formBody = @{
        name                = "ESG Quickscan Light"
        formType            = "hubspot"
        archived            = $false
        createdAt           = $nowMs
        updatedAt           = $nowMs
        fieldGroups         = $fieldGroups
        configuration       = $formConfiguration
        displayOptions      = $formDisplay
        legalConsentOptions = $formLegal
    }
    $created = Invoke-HSApi -Method POST -Path "/marketing/v3/forms/" -Body $formBody
    $formGuid = $created.id
    Write-Host ("  +   Form aangemaakt: {0}" -f $formGuid) -ForegroundColor Green
}
else {
    $formGuid = $existingForm.id
    # Check welke velden al bestaan; PATCH alleen als er iets mist.
    $existingFieldNames = @()
    foreach ($g in $existingForm.fieldGroups) {
        foreach ($fld in $g.fields) { $existingFieldNames += $fld.name }
    }
    $wantedNames = $fields | ForEach-Object { $_.name }
    $missing = @()
    foreach ($w in $wantedNames) {
        if ($existingFieldNames -notcontains $w) { $missing += $w }
    }

    if ($missing.Count -eq 0) {
        Write-Host ("  =   Form bestaat en is compleet: {0}" -f $formGuid) -ForegroundColor DarkYellow
    }
    else {
        Write-Host ("  ~   Form bestaat maar mist velden: {0}" -f ($missing -join ', ')) -ForegroundColor Yellow
        $patchBody = @{
            fieldGroups         = $fieldGroups
            configuration       = $formConfiguration
            displayOptions      = $formDisplay
            legalConsentOptions = $formLegal
        }
        Invoke-HSApi -Method PATCH -Path "/marketing/v3/forms/$formGuid" -Body $patchBody | Out-Null
        Write-Host ("  +   Form bijgewerkt: {0}" -f $formGuid) -ForegroundColor Green
    }
}

# --- 4. Config-bestand schrijven ---
Write-Host ""
Write-Host "[4/4] src/config/hubspot.ts bijwerken..."
$configContent = @"
// HubSpot Forms API v3 configuratie voor de ESG Quickscan Light.
//
// Auto-gegenereerd door scripts/hubspot-setup.ps1.
// Deze IDs zijn NIET geheim - ze staan zichtbaar in elke HubSpot-embed-code
// en zijn ontworpen om client-side gebruikt te worden. Ze committen is veilig.
//
// Overschrijven per omgeving:
//   - Lokale dev: zet VITE_HUBSPOT_PORTAL_ID / VITE_HUBSPOT_FORM_GUID in .env.local
//   - Productie: draai dit script opnieuw (bijv. tegen een ander HubSpot-portal)

const envPortalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID as
  | string
  | undefined;
const envFormGuid = import.meta.env.VITE_HUBSPOT_FORM_GUID as
  | string
  | undefined;

export const HUBSPOT_PORTAL_ID = envPortalId || "$portalId";
export const HUBSPOT_FORM_GUID =
  envFormGuid || "$formGuid";
"@
# BOM-vrije UTF-8 zodat TS-tooling niet kiebelt op lege regels
[System.IO.File]::WriteAllText(
    $configPath,
    $configContent,
    (New-Object System.Text.UTF8Encoding $false)
)
Write-Host ("  +   Geschreven: {0}" -f $configPath) -ForegroundColor Green

# Voor lokale dev houden we ook .env.local bij (overschrijft config bij import.meta.env).
$envLines = @(
    "# Auto-gegenereerd door scripts/hubspot-setup.ps1",
    "# Niet committen - staat in .gitignore via *.local.",
    "VITE_HUBSPOT_PORTAL_ID=$portalId",
    "VITE_HUBSPOT_FORM_GUID=$formGuid"
) -join [Environment]::NewLine
[System.IO.File]::WriteAllText(
    $envLocalPath,
    $envLines,
    (New-Object System.Text.UTF8Encoding $false)
)
Write-Host ("  +   Geschreven: {0}" -f $envLocalPath) -ForegroundColor Green

Write-Host ""
Write-Host "== Klaar ==" -ForegroundColor Cyan
Write-Host ("   Portal ID: {0}" -f $portalId)
Write-Host ("   Form GUID: {0}" -f $formGuid)
Write-Host ""
Write-Host "Verwijder het tokenbestand zodra je klaar bent met setup:"
Write-Host ("   Remove-Item `"{0}`"" -f $tokenPath)
Write-Host "Je kunt de Private App in HubSpot ook geheel verwijderen als je geen verdere automatisering doet."
