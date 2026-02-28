# Design: Seitenstruktur-Überarbeitung cartrade24

> **Status:** Approved
> **Datum:** 2026-02-27
> **Ansatz:** B — Aufbrechen von /informationen, neue Konversionsseiten

---

## Ziel

Die bestehende Seitenstruktur ist zu generisch. `/informationen` bündelt zu viele unterschiedliche Themen auf einer Seite. Neue Kernservices (Leasing, B2B, Ankauf) fehlen als eigenständige Seiten. Die Navigation spiegelt nicht die wichtigsten Conversion-Ziele wider.

---

## Sitemap

### Haupt-Navigation (Header)

```
Home | Autos | Finanzierung | Firmenkunden | Über uns | Kontakt
```

### Vollständige Sitemap

```
/                    Home (unverändert)
/autos               Fahrzeugliste (unverändert)
/autos/[id]          Fahrzeugdetail (unverändert)
/finanzierung        Leasing & Finanzierung — NEU
/firmenkunden        Firmenkunden & Flottenservice — NEU
/ueber-uns           Über uns — ERWEITERT
/kontakt             Kontakt (unverändert)

— Footer-only (kein Haupt-Nav) —
/ankauf              Fahrzeug verkaufen — NEU
/garantie            Garantie-Details — NEU
/faq                 FAQ — NEU
/news                News & Angebote (bleibt, aus Nav raus)
/agb                 AGB (unverändert)
/datenschutz         Datenschutz (unverändert)

— Gelöscht / Redirect —
/informationen  →  301 redirect nach /ueber-uns
```

### Footer-Spalten (neu)

```
Col 1: Brand + Tagline + Social Icons
Col 2: Fahrzeuge → /autos, /ankauf, /finanzierung
Col 3: Unternehmen → /ueber-uns, /garantie, /faq, /news
Col 4: Rechtliches + Kontakt → /agb, /datenschutz, Adresse, Öffnungszeiten
```

---

## Neue Seiten

### `/finanzierung` — Leasing & Finanzierung

**Ziel:** Kaufhemmer "zu teuer" überwinden, Leasing als Einstieg positionieren.

**Sections:**
1. Hero-Band — "Flexibel finanzieren. Sofort fahren."
2. 3 Wege zur Finanzierung — Barkauf / Kredit / Leasing (Cards mit Vor-/Nachteil)
3. Leasing im Detail — Laufzeiten, Kilometeroptionen, Beispielrechnung mit echten Zahlen (z.B. VW Golf ab CHF 299/Mt.)
4. B2B-Teaser-Banner — "Firmenkunde? Spezialkonditionen verfügbar" → CTA zu `/firmenkunden`
5. CTA — "Jetzt Offerte anfragen" → Kontaktformular

**SEO-Keywords:** Leasing Occasion Schweiz, Auto finanzieren Aargau, Leasingrechner

---

### `/firmenkunden` — Firmenkunden & Flottenservice

**Ziel:** CFOs/Flottenmanager ansprechen, Seriosität und Sonderkonditionen kommunizieren.

**Sections:**
1. Hero-Band — "Mobilität für Ihr Unternehmen"
2. Vorteile B2B — 4 Punkte: Flottenrabatte / MwSt-Rückerstattung / Direktabrechnung / persönlicher Ansprechpartner
3. Ablauf in 3 Schritten — Anfrage → Offerte → Übergabe
4. Fahrzeugauswahl — Link zu `/autos`
5. CTA — "Unternehmensanfrage stellen" → Kontaktformular (Felder: Firmenname, Anzahl Fahrzeuge)

**SEO-Keywords:** Flottenfahrzeuge Schweiz, Firmenauto Leasing Aargau, B2B Autohandel

---

### `/ankauf` — Fahrzeug verkaufen

**Ziel:** Eintausch-Leads generieren (Nebenservice, klarer CTA).

**Sections:**
1. Hero-Band — "Ihr Auto fair bewertet"
2. 3 Schritte — Formular ausfüllen → Bewertung erhalten → Auszahlung
3. Mini-Formular — Marke, Modell, Jahr, Kilometer, Kontakt → sendet an bestehende Kontakt-API
4. Vertrauens-Strip — "Sofortige Auszahlung · Keine Kommission · Kostenlose Bewertung"

**SEO-Keywords:** Auto verkaufen Aargau, Occasionsankauf Wohlen, Fahrzeugeintausch Schweiz

---

### `/garantie` — Garantie

**Ziel:** Kaufvertrauen stärken, SEO auf "Garantie Occasionen Schweiz".

**Sections:**
1. Hero-Band — "Bis zu 7 Jahre Garantie"
2. Was ist abgedeckt? — Motor, Getriebe, Elektronik, Antrieb (Tabelle/Cards)
3. Laufzeiten — 1 / 2 / 3 / 5 / 7 Jahre (visuell, statisch)
4. Häufige Fragen zur Garantie — 4–5 Accordion-FAQs
5. CTA → Kontakt

**SEO-Keywords:** Garantie Occasion Schweiz, Gebrauchtwagen Garantie Aargau

---

### `/faq` — FAQ

**Ziel:** SEO + Supportlast reduzieren. Accordion-Struktur für Schema.org FAQPage Markup.

**Kategorien:**
- Kauf & Bezahlung — Zahlungsarten, Reservierung, Anzahlung
- Lieferung & Abholung — Kosten, Gebiete, Termine
- Garantie & Service — Laufzeit, Schadensmeldung
- Finanzierung & Leasing — Voraussetzungen, Laufzeiten
- Fahrzeugankauf — Ablauf, Bewertung, Auszahlung

**SEO-Keywords:** Autohandel FAQ, Occasionsgarantie Fragen, Leasing Fragen Schweiz

---

## Geänderte Seiten

### `/ueber-uns` — Erweitert

Zwei neue Sections werden aus `/informationen` übernommen:
- **ASTRA-Zulassung** — Grossimporteur-Status, was das bedeutet
- **Unser Qualitätsprozess** — Fahrzeugprüfung, Aufbereitung, Zertifizierung

### Header

Nav-Links ändern von:
```
Home | Autos | Informationen | News | Über uns | Kontakt
```
zu:
```
Home | Autos | Finanzierung | Firmenkunden | Über uns | Kontakt
```

### Footer

Spalten 2 und 3 werden neu strukturiert (siehe Sitemap oben).

### `/informationen`

301-Redirect auf `/ueber-uns`.

---

## Technische Entscheidungen

- Alle neuen Seiten: Server Components (statischer Inhalt, kein Interaktionsbedarf)
- `/ankauf`-Formular: Client Component, nutzt bestehende `/api/contact` Route (Subject = "Fahrzeugankauf")
- `/firmenkunden`-Formular: Client Component, nutzt bestehende `/api/contact` Route (Subject = "Firmenkundenanfrage", extra Felder: Firmenname, Anzahl Fahrzeuge)
- FAQ Accordion: Client Component (`useState` für open/closed)
- Schema.org `FAQPage` JSON-LD auf `/faq` für SEO
- Design-Tokens: konsistent mit bestehendem System (ct-cyan, ct-magenta, ct-dark, ct-light)
- Section-Padding: `py-16 md:py-24`, Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

---

## Nicht im Scope

- Echte Fahrzeugdaten (bleibt hardcoded in `lib/vehicles.ts`)
- CMS-Integration für News
- Leasingrechner als interaktives Tool (Berechnungslogik erfordert Bankkonditionen)
- Mehrsprachigkeit
