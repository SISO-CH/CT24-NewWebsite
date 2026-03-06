# Kundenfeedback Phase C — Hoher Aufwand (Design)

**Datum:** 2026-03-06
**Status:** Approved

---

## Kontext

Fortsetzung der Kundenfeedback-Umsetzung. Phase A (9 Quick Wins) und Phase B (10 Features mittlerer Aufwand) sind abgeschlossen und gemerged. Phase C umfasst 7 Features mit hohem Aufwand.

---

## 20. Fahrzeug-Archiv fuer SEO

**Ziel:** Verkaufte Fahrzeuge als SEO-Content behalten statt verschwinden lassen.

**Mechanismus:**
- Cron-Job (`/api/cron/archive-vehicles`) vergleicht taeglich den aktuellen AS24-Bestand mit dem gespeicherten Snapshot in Vercel KV
- Fahrzeuge die nicht mehr `live === true` sind werden als Archiv-Eintrag gespeichert (volle Fahrzeugdaten)
- Snapshot der aktiven Fahrzeug-IDs wird nach jedem Cron-Lauf aktualisiert

**Seiten:**
- `/fahrzeug-archiv` — Listing aller verkauften Fahrzeuge (paginiert)
- `/fahrzeug-archiv/[id]` — Detail-Seite mit allen Fahrzeugdaten

**UI:**
- Badge "Verkauft" auf dem Fahrzeugbild
- Kein Kaufen/Reservieren/Probefahrt moeglich
- CTA: "Aehnliches Fahrzeug gesucht? Kontaktieren Sie uns."

**SEO:**
- JSON-LD Product Schema (mit `availability: SoldOut`)
- Meta-Tags mit Fahrzeugdaten
- Sitemap-Eintraege fuer alle archivierten Fahrzeuge
- Interne Verlinkung zu aehnlichen aktiven Fahrzeugen

**Persistenz:** Vercel KV (`archive:{as24Id}` -> Vehicle JSON)

---

## 21. Vorbestellte Fahrzeuge aus Google Sheet

**Ziel:** Kommende Fahrzeuge anzeigen die noch nicht im AS24-Bestand sind.

**Datenquelle:** Google Sheet mit definierten Spalten:
- Marke, Modell, Variante, Jahrgang, Preis (geschaetzt), Bild-URL, Beschreibung, Status (aktiv/inaktiv)

**Technisch:**
- `lib/preorder-vehicles.ts` fetcht via Google Sheets API mit Service Account
- Cache: 1 Stunde
- Fallback: leeres Array wenn Sheet nicht erreichbar

**Integration:**
- Fahrzeuge erscheinen im normalen Listing mit Badge "Demnaechst verfuegbar" (orange)
- Auf VDP: kein Reservieren/Probefahrt, stattdessen CTA "Interesse anmelden" -> Kontaktformular mit Fahrzeug-Referenz
- Homepage: "Kommende Fahrzeuge" Karussell-Sektion
- Sitemap: Eintraege mit `priority 0.6`

**Env-Vars:**
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_CREDENTIALS_JSON` (Base64-encoded Service Account JSON)

---

## 22. n8n Webhook-Trigger bei neuem Fahrzeug

**Ziel:** n8n-Workflow automatisch starten wenn ein neues Fahrzeug im Bestand erscheint.

**Mechanismus:**
- Der Cron-Job aus Feature 20 vergleicht ohnehin taeglich den Bestand
- Wenn **neue Fahrzeuge** erkannt werden (ID noch nicht im Snapshot): POST an `N8N_WEBHOOK_URL`
- Payload: nur die VDP-URL des neuen Fahrzeugs (z.B. `https://cartrade24.ch/autos/5`)
- n8n uebernimmt alles weitere (Preisschild etc.)

**Fehlerbehandlung:** Webhook-Fehler wird geloggt, blockiert den Cron-Job nicht.

**Env-Vars:**
- `N8N_WEBHOOK_URL`

---

## 23. Voice Agent (Eigenstaendig)

**Ziel:** Vollbild-Voice-Interface fuer sprachbasierte Fahrzeugberatung.

**Route:** `/voice`

**UI:**
- Eigene Vollbild-Seite, kein Teil des Chat-Widgets
- Grosser Mikrofon-Button zentral
- Waveform-Visualisierung waehrend Aufnahme
- Status-Anzeigen: "Zuhoeren..." / "Denke nach..." / "Spricht..."
- Mobile-optimiert: Fullscreen, grosse Touch-Targets

**Ablauf:**
1. User drueckt Mikrofon
2. ElevenLabs STT transkribiert Spracheingabe
3. Text an bestehende `/api/chat` Route
4. Claude-Antwort zurueck
5. ElevenLabs TTS spricht Antwort vor

**Backend-Proxy** (API-Key nicht im Client):
- `/api/voice/transcribe` (POST) — Audio-Blob -> Text via ElevenLabs STT
- `/api/voice/speak` (POST) — Text -> Audio via ElevenLabs TTS

**Kontext:**
- Gleicher System-Prompt wie Chat (kennt Fahrzeugbestand)
- Optional: `/voice?vehicle=5` -> Fahrzeug als Kontext vorausgewaehlt
- Link von VDP: "Sprachassistent starten"

**Env-Vars:**
- `ELEVENLABS_API_KEY`

---

## 25. GEO — Standort-Landingpages

**Ziel:** SEO-optimierte Landingpages fuer ~18 Staedte im Einzugsgebiet.

**Staedte:**

Kern (Freiamt/Aargau): Wohlen, Bremgarten, Muri, Lenzburg, Aarau, Baden, Brugg

Erweitert (30-50km): Zuerich, Luzern, Zug, Dietikon, Olten, Solothurn

Schweiz: Bern, Basel, Winterthur, St. Gallen

**Route:** `/autos-in-[city]` (z.B. `/autos-in-zuerich`)

**Content:**
- Einmalig via Claude AI generiert, als MDX in `content/locations/` gespeichert
- Kein Runtime-API-Call fuer Content

**Seitenstruktur:**
- H1: "Occasion kaufen in {Stadt}"
- Lokaler Intro-Text (~150 Woerter, SEO-optimiert)
- Aktuelles Fahrzeug-Listing (gleiche Daten wie `/autos`)
- FAQ-Sektion mit lokalen Fragen ("Wie komme ich von {Stadt} nach Wohlen?", "Liefern Sie nach {Stadt}?")
- CTA: "Jetzt Probefahrt vereinbaren"

**SEO:**
- JSON-LD: LocalBusiness + ItemList Schema
- Meta-Description mit Stadtname
- Sitemap-Eintraege fuer alle Staedte

**Navigation:** Footer-Sektion "Standorte" mit Links zu allen Staedten.

**Daten:** `lib/locations.ts` mit Name, Slug, Kanton, Distanz ab Wohlen, Koordinaten.

---

## 26. SEO maximal (Technisch + Inhaltlich)

**Ziel:** Umfassende technische SEO-Optimierung + Google Sheet fuer manuelle SEO-Overrides.

### Structured Data erweitern

- `BreadcrumbList` Schema auf allen Seiten (Home -> Autos -> Marke Modell)
- `LocalBusiness` Schema auf Homepage + Kontakt (Adresse, Telefon, Oeffnungszeiten, Logo)
- `Organization` Schema (Firmenname, Gruendung, Kontakt)
- `AggregateOffer` auf Listing-Seite (Preisrange aller Fahrzeuge)
- `FAQPage` Schema auf allen Seiten die FAQs haben

### Technisches SEO

- Breadcrumb-Komponente sichtbar auf allen Unterseiten
- Canonical Tags auf allen Seiten
- Interne Verlinkung: Blog-Posts verlinken auf relevante Fahrzeuge, VDP verlinkt auf Blog-Themen
- `hreflang`-Tags fuer alle 9 Sprachen auf jeder Seite
- Image Alt-Tags systematisch

### SEO-Overrides via Google Sheet

Zweiter Tab im gleichen Spreadsheet wie Feature 21. Spalten:
- Seite (z.B. `/autos`, `/autos-in-zuerich`)
- Fokus-Keyword
- Meta-Title Override
- Meta-Description Override
- H1 Override

`lib/seo-overrides.ts` fetcht das Sheet, cached 1 Stunde. Wenn Override existiert, wird er statt dem automatisch generierten Wert verwendet. Gleiche Env-Vars wie Feature 21 (selbes Spreadsheet, anderer Tab).

---

## 27. CO2-Straf-Rechner fuer Haendler

**Ziel:** B2B-Tool das Haendlern ihre CO2-Flottenstrafe berechnet und emissionsarme Fahrzeuge aus dem CT24-Bestand empfiehlt.

**Route:** `/co2-rechner`

**Zielgruppe:** Autohaendler (B2B)

**Eingabe:**
- Anzahl Fahrzeuge im Flottenbestand
- Durchschnittlicher CO2-Ausstoss (g/km) — oder detailliert: mehrere Fahrzeuge einzeln mit CO2-Wert eingeben

**Berechnung (Schweizer CO2-Sanktionen):**
- Zielwert: 95 g/km fuer PKW-Flotten (ASTRA)
- Strafe: ~100-150 CHF pro g/km Ueberschreitung pro Fahrzeug
- Anzeige: Flotten-Durchschnitt, Abweichung vom Zielwert, Strafzahlung in CHF

**Empfehlung:**
- "Durch den Einkauf dieser Fahrzeuge senken Sie Ihren Flottendurchschnitt:"
- Zeigt emissionsarme Fahrzeuge aus aktuellem CT24-Bestand (Elektro, Hybrid, tiefes CO2)
- Berechnet neue Strafe nach Kauf — Ersparnis prominent angezeigt

**Lead-Capture:**
- Formular: Firma, Ansprechpartner, E-Mail, Telefon
- "Persoenliche Beratung zur CO2-Optimierung"
- Tracking: `lead_form_submit` mit `form_type: "co2_rechner"`

**Verlinkung:** Von der Haendler-Seite (`/haendler`) + Footer.

---

## Neue Env-Vars (Gesamt Phase C)

```
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SHEETS_CREDENTIALS_JSON=...
N8N_WEBHOOK_URL=...
ELEVENLABS_API_KEY=...
```

## Go-Live Checkliste (Ergaenzungen Phase C)

- [ ] Google Sheet erstellen mit Tabs: "Vorbestellungen" + "SEO Overrides"
- [ ] Google Cloud Service Account erstellen + Sheet teilen
- [ ] `GOOGLE_SHEETS_SPREADSHEET_ID` + `GOOGLE_SHEETS_CREDENTIALS_JSON` eintragen
- [ ] `N8N_WEBHOOK_URL` eintragen (self-hosted n8n)
- [ ] `ELEVENLABS_API_KEY` eintragen
- [ ] Standort-Landingpages Content pruefen/anpassen
- [ ] CO2-Strafbetraege gegen aktuelle ASTRA-Werte verifizieren
