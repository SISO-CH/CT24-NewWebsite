# Kundenfeedback Phase C Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 7 Features mit hohem Aufwand umsetzen: Fahrzeug-Archiv, Google Sheet Vorbestellungen, n8n Webhook, Voice Agent, GEO Standort-Landingpages, SEO maximal, CO2-Straf-Rechner.

**Architecture:** Cron-Job vergleicht taeglich AS24-Bestand mit KV-Snapshot — archiviert verkaufte Fahrzeuge und triggert n8n Webhook fuer neue. Google Sheets API liefert Vorbestellungen + SEO-Overrides. ElevenLabs STT/TTS fuer eigenstaendigen Voice Agent. AI-generierte MDX-Dateien fuer ~18 Standort-Landingpages. Structured Data (JSON-LD) fuer BreadcrumbList, LocalBusiness, Organization.

**Tech Stack:** Next.js 16, TypeScript, Vercel KV, Google Sheets API, ElevenLabs API, Claude Haiku, jsPDF, recharts, next-intl, Tailwind v4

**Security Note:** All JSON-LD structured data uses `JSON.stringify()` which auto-escapes content. All user inputs are validated server-side. ElevenLabs API key is only used server-side via proxy routes.

---

## Task 1: Feature-Branch erstellen

**Step 1:** Branch erstellen

```bash
git checkout master && git pull
git checkout -b feature/kundenfeedback-phaseC
```

**Step 2:** Dependencies installieren

```bash
npm install recharts
```

**Step 3:** Commit

```bash
git add package.json package-lock.json
git commit -m "chore: add recharts dependency for Phase C"
```

---

## Task 2: Fahrzeug-Archiv — Cron-Job + KV Persistenz + n8n Webhook

**Files:**
- Create: `app/api/cron/archive-vehicles/route.ts`

Cron-Job der:
1. Aktuelle AS24-Fahrzeuge mit KV-Snapshot vergleicht
2. Verkaufte Fahrzeuge archiviert (KV `archive:{as24Id}`)
3. Neue Fahrzeuge erkennt und n8n Webhook triggert (nur VDP-URL im Payload)
4. Snapshot aktualisiert

Pattern: Gleich wie `app/api/cron/price-check/route.ts` (Authorization Bearer, try/catch, KV).
KV-Fallback: In-memory Map wenn Vercel KV nicht konfiguriert.

**Step 1:** Implementieren
**Step 2:** Test: `curl -H "Authorization: Bearer test" http://localhost:3000/api/cron/archive-vehicles`
**Step 3:** Commit: `git commit -m "feat: Cron-Job fuer Fahrzeug-Archivierung + n8n Webhook"`

---

## Task 3: Fahrzeug-Archiv — Lib + API + Seiten

**Files:**
- Create: `lib/sold-vehicles.ts` — getSoldVehicles(), getSoldVehicle(id)
- Create: `app/api/sold-vehicles/route.ts` — GET returns archived vehicles
- Create: `app/[locale]/fahrzeug-archiv/page.tsx` — Listing mit "Verkauft"-Badge, grayscale Bilder
- Create: `app/[locale]/fahrzeug-archiv/[id]/page.tsx` — Detail mit Specs, "Verkauft" Banner, aehnliche aktive Fahrzeuge, CTA "Aehnliches Fahrzeug gesucht?", JSON-LD Product mit SoldOut

Archiv-Interface: `ArchivedVehicle extends Vehicle { archivedAt: string; status: "sold" }`

**Step 1:** Implementieren (4 Dateien)
**Step 2:** Test: `/fahrzeug-archiv` aufrufen (leer ist OK bei erstem Lauf)
**Step 3:** Commit: `git commit -m "feat: Fahrzeug-Archiv — Listing + Detail-Seiten"`

---

## Task 4: Fahrzeug-Archiv — Sitemap + Footer

**Files:**
- Modify: `app/sitemap.ts` — archiveRoutes + staticRoute `/fahrzeug-archiv`
- Modify: `components/layout/Footer.tsx` — Link in Col 2 "Fahrzeuge"

**Step 1:** Sitemap: getSoldVehicles() -> archiveRoutes mit priority 0.4
**Step 2:** Footer: `<FooterLink href="/fahrzeug-archiv">Fahrzeug-Archiv</FooterLink>` nach Zeile 125
**Step 3:** Commit: `git commit -m "feat: Fahrzeug-Archiv in Sitemap + Footer"`

---

## Task 5: Google Sheets Integration — Shared Library

**Files:**
- Create: `lib/google-sheets.ts`

Einfacher Fetch ueber Google Sheets API v4 mit API Key (kein SDK). Sheet muss oeffentlich lesbar sein.
Function: `fetchSheet(sheetName: string): Promise<SheetRow[]>` — Row 1 = Headers, Rest = Daten.
Cache: `next: { revalidate: 3600 }`.
Env-Vars: `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_API_KEY`.

**Step 1:** Implementieren
**Step 2:** Commit: `git commit -m "feat: Google Sheets shared integration library"`

---

## Task 6: Vorbestellte Fahrzeuge — Lib + Badge + Integration

**Files:**
- Create: `lib/preorder-vehicles.ts` — fetchPreorderVehicles() mappt Sheet-Rows auf Vehicle
- Modify: `lib/vehicles.ts:54` — neues Feld `preorder?: boolean`
- Modify: `components/vehicles/VehicleCard.tsx` — Badge "Demnaechst verfuegbar" (orange) wenn vehicle.preorder

Sheet-Spalten: marke, modell, variante, jahrgang, km, ps, getriebe, treibstoff, preis, bild, karosserie, beschreibung, status (aktiv/inaktiv).
IDs starten bei 9000 um Kollision mit AS24 zu vermeiden.

**Step 1:** Implementieren (3 Dateien)
**Step 2:** Commit: `git commit -m "feat: Vorbestellte Fahrzeuge aus Google Sheet"`

---

## Task 7: Vorbestellte Fahrzeuge — Listing + Homepage + VDP

**Files:**
- Modify: `app/[locale]/autos/page.tsx` — fetchPreorderVehicles() + merge mit aktiven
- Modify: `app/[locale]/page.tsx` — "Demnaechst verfuegbar" Karussell-Sektion
- Modify: `app/[locale]/autos/[id]/page.tsx` — Preorder: "Interesse anmelden" statt Reserve/Probefahrt

**Step 1:** Listing: `Promise.all([fetchVehicles(), fetchPreorderVehicles()])`, concat, an AutosContent
**Step 2:** Homepage: Karussell mit horizontal scroll + snap wenn preorderVehicles.length > 0
**Step 3:** VDP: `vehicle.preorder ? <InteresseAnmeldenCTA/> : <NormaleCTAs/>`
**Step 4:** Commit: `git commit -m "feat: Vorbestellungen in Listing, Homepage + VDP"`

---

## Task 8: GEO — Locations-Daten + Content-Generator

**Files:**
- Create: `lib/locations.ts` — 18 Staedte mit name, slug, kanton, distanceKm, lat, lng
- Create: `scripts/generate-location-content.ts` — Claude AI generiert MDX pro Stadt

Staedte: Wohlen, Bremgarten, Muri, Lenzburg, Aarau, Baden, Brugg, Zuerich, Luzern, Zug, Dietikon, Olten, Solothurn, Bern, Basel, Winterthur, St. Gallen, Thun.

Content-Format pro MDX:
```
---
title: Occasion kaufen in {Stadt}
description: Meta-Description max 155 Zeichen
h1: Occasion kaufen in {Stadt} — Ihr Autohaendler in der Naehe
---
[Intro ~150 Woerter]
## Haeufige Fragen
### Frage 1
Antwort 1
```

Script: `npx tsx scripts/generate-location-content.ts`

**Step 1:** Implementieren
**Step 2:** Commit: `git commit -m "feat: GEO Locations-Daten + Content-Generator"`

---

## Task 9: GEO — Landingpage + Sitemap + Footer

**Files:**
- Create: `lib/location-content.ts` — getLocationContent(slug) liest MDX mit gray-matter
- Create: `app/[locale]/autos-in-[city]/page.tsx` — Landingpage mit Intro, Fahrzeug-Grid, FAQ, CTA, JSON-LD (AutoDealer + FAQPage)
- Modify: `app/sitemap.ts` — locationRoutes mit priority 0.7
- Modify: `components/layout/Footer.tsx` — "Standorte" Sektion mit Links zu allen Staedten

generateStaticParams() liefert alle Slugs. FAQ als `<details>` Akkordeon.

**Step 1:** Implementieren (4 Dateien)
**Step 2:** Test: `/autos-in-wohlen` aufrufen (braucht MDX-Datei, sonst 404)
**Step 3:** Commit: `git commit -m "feat: GEO Standort-Landingpages mit FAQ + JSON-LD"`

---

## Task 10: SEO maximal — Breadcrumbs + Structured Data

**Files:**
- Create: `components/seo/BreadcrumbSchema.tsx` — sichtbare Breadcrumbs + JSON-LD BreadcrumbList
- Create: `components/seo/LocalBusinessSchema.tsx` — AutoDealer Schema mit Adresse, Oeffnungszeiten, Geo
- Modify: `app/[locale]/page.tsx` — LocalBusinessSchema einbinden
- Modify: `app/[locale]/autos/page.tsx` — BreadcrumbSchema (Home > Fahrzeuge)
- Modify: `app/[locale]/autos/[id]/page.tsx` — BreadcrumbSchema (Home > Fahrzeuge > Marke Modell)

BreadcrumbSchema Props: `crumbs: { name: string; href: string }[]`
Sichtbar als `<nav aria-label="Breadcrumb">` mit `/` Separatoren.

**Step 1:** Implementieren
**Step 2:** Commit: `git commit -m "feat: SEO — BreadcrumbList + LocalBusiness Schema"`

---

## Task 11: SEO maximal — Google Sheet Overrides

**Files:**
- Create: `lib/seo-overrides.ts` — getSeoOverride(path) liest Tab "SEO Overrides"

Sheet-Spalten: seite, fokus-keyword, meta-title, meta-description, h1.
Wenn Override existiert, wird er statt automatischem Wert verwendet.
Integration: In generateMetadata() der jeweiligen Seiten optional einbinden.

**Step 1:** Implementieren
**Step 2:** Commit: `git commit -m "feat: SEO-Overrides via Google Sheet"`

---

## Task 12: CO2-Straf-Rechner — Lib + Komponente + Seite

**Files:**
- Create: `lib/co2.ts` — calculateFleetPenalty(), calculateOptimized()
- Create: `components/tools/Co2Calculator.tsx` — Client-Komponente mit einfach/detailliert Modus
- Create: `app/[locale]/co2-rechner/page.tsx` — Server-Page mit Low-Emission Fahrzeugen

CO2-Konstanten: Zielwert 118 g/km (ASTRA 2025), ~108 CHF/g/km Strafe.
Einfach-Modus: Anzahl + Durchschnitt. Detail-Modus: Einzelne Fahrzeuge.
Ergebnis: Flotten-Durchschnitt, Ueberschreitung, Strafe total.
Empfehlung: Top 3 emissionsarme CT24-Fahrzeuge + neue Strafe nach Kauf + Ersparnis.
Lead-CTA: Link zu /kontakt?subject=CO2-Flottenberatung.

**Step 1:** Implementieren (3 Dateien)
**Step 2:** Test: `/co2-rechner` mit verschiedenen Werten
**Step 3:** Commit: `git commit -m "feat: CO2-Straf-Rechner fuer Haendler"`

---

## Task 13: CO2-Rechner — Footer + Haendler-Seite + Sitemap

**Files:**
- Modify: `components/layout/Footer.tsx` — Link in Col 2
- Modify: `app/[locale]/haendler/page.tsx` — CTA-Card zum CO2-Rechner
- Modify: `app/sitemap.ts` — `/co2-rechner` mit priority 0.7

**Step 1:** Implementieren
**Step 2:** Commit: `git commit -m "feat: CO2-Rechner in Footer, Haendler-Seite + Sitemap"`

---

## Task 14: Voice Agent — Backend API Proxies

**Files:**
- Create: `app/api/voice/transcribe/route.ts` — ElevenLabs STT Proxy (POST audio -> text)
- Create: `app/api/voice/speak/route.ts` — ElevenLabs TTS Proxy (POST text -> audio/mpeg)

STT: FormData mit audio Blob -> ElevenLabs `/v1/speech-to-text` (model: scribe_v1, language: deu)
TTS: JSON mit text -> ElevenLabs `/v1/text-to-speech/{voiceId}` (model: eleven_multilingual_v2)
Auth: `ELEVENLABS_API_KEY` nur server-seitig, nie im Client.
Fallback: 503 wenn kein Key konfiguriert.

**Step 1:** Implementieren
**Step 2:** Commit: `git commit -m "feat: Voice Agent — ElevenLabs STT/TTS API Proxies"`

---

## Task 15: Voice Agent — Frontend UI

**Files:**
- Create: `components/voice/VoiceAgent.tsx` — Fullscreen Client-Component
- Create: `app/[locale]/voice/page.tsx` — Server-Page mit optionalem vehicle Query-Param

UI: Dunkler Fullscreen, grosser Mikrofon-Button, Status-Anzeige (idle/listening/thinking/speaking), Waveform-Farben, Transcript + Response Bubbles, Zurueck-Link.
Flow: Mikrofon -> MediaRecorder -> Blob -> /api/voice/transcribe -> /api/chat (SSE) -> /api/voice/speak -> Audio.play()
Optional: `?vehicle=5` als Kontext fuer Claude.

**Step 1:** Implementieren
**Step 2:** Test: `/voice` aufrufen (ohne ElevenLabs Key: Fehlermeldung)
**Step 3:** Commit: `git commit -m "feat: Voice Agent — Vollbild-Sprachassistent"`

---

## Task 16: Voice Agent — VDP Link + Sitemap

**Files:**
- Modify: `app/[locale]/autos/[id]/page.tsx` — Link "Sprachassistent" mit Mic-Icon
- Modify: `app/sitemap.ts` — `/voice` mit priority 0.4

**Step 1:** VDP CTA-Bereich: `<Link href={/voice?vehicle=${vehicle.id}}>Sprachassistent</Link>`
**Step 2:** Sitemap entry
**Step 3:** Commit: `git commit -m "feat: Voice Agent Link auf VDP + Sitemap"`

---

## Task 17: Env-Vars + Go-Live Checkliste

**Files:**
- Modify: `.env.local` — Platzhalter fuer Phase C Keys

Neue Env-Vars:
```
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_API_KEY=
N8N_WEBHOOK_URL=
ELEVENLABS_API_KEY=
```

Go-Live Checkliste (Memory aktualisieren):
- [ ] Google Sheet erstellen: Tab "Vorbestellungen" + Tab "SEO Overrides"
- [ ] Google Sheets API aktivieren + API Key erstellen
- [ ] Sheet oeffentlich lesbar oder Service Account einrichten
- [ ] GOOGLE_SHEETS_SPREADSHEET_ID + GOOGLE_SHEETS_API_KEY eintragen
- [ ] N8N_WEBHOOK_URL eintragen (self-hosted n8n)
- [ ] ELEVENLABS_API_KEY eintragen
- [ ] Location-Content generieren: npx tsx scripts/generate-location-content.ts
- [ ] Standort-Content pruefen/anpassen
- [ ] CO2-Strafbetraege gegen aktuelle ASTRA-Werte verifizieren

**Step 1:** .env.local aktualisieren
**Step 2:** Commit: `git commit -m "chore: Env-Var Platzhalter fuer Phase C"`

---

## Task 18: Build + Test + Push + PR

**Step 1:** Dev-Server starten, alle neuen Seiten testen:
- `/fahrzeug-archiv`
- `/co2-rechner`
- `/voice`
- `/autos` (Breadcrumbs)
- `/autos/1` (Breadcrumbs + Voice Link)

**Step 2:** Build: `npm run build`

**Step 3:** Push + PR:
```bash
git push -u origin feature/kundenfeedback-phaseC
gh pr create --title "feat: Kundenfeedback Phase C — 7 Features"
```
