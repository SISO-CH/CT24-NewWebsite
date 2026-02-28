# Design: Phase 1 – Quick Wins

> **Status:** Approved
> **Datum:** 2026-02-28
> **Ansatz:** B — Nach Bereich gruppiert
> **Nächster Schritt:** `superpowers:writing-plans` zur Erstellung des Implementierungsplans

---

## Ziel

Conversion-starke Features mit niedrigster Komplexität zuerst umsetzen, ohne externe Abhängigkeiten oder neue Backend-Infrastruktur. Alle Änderungen sind rein clientseitig oder nutzen bestehende API-Routes.

---

## Tech-Stack (unverändert)

- Next.js 16 App Router, TypeScript 5, Tailwind v4
- `lucide-react` (bereits installiert)
- Kein neues npm-Package zwingend nötig

---

## Scope Phase 1 (5 Blöcke)

```
Block 1: Erweiterte Filter          → components/vehicles/VehicleFilter.tsx + AutosContent.tsx
Block 2: VDP-Ergänzungen            → app/autos/[id]/page.tsx + neue Komponenten
Block 3: Interaktiver Leasingrechner → app/finanzierung/page.tsx + components/ui/LeasingCalculator.tsx
Block 4: Homepage                   → app/page.tsx + components/layout/Footer.tsx
Block 5: Sticky Mobile CTA-Bar      → app/layout.tsx + components/ui/MobileCTABar.tsx
```

---

## Block 1: Erweiterte Filter

### Dateien
- Modify: `components/vehicles/VehicleFilter.tsx`
- Modify: `components/vehicles/AutosContent.tsx`

### FilterState (erweitert)

```ts
export interface FilterState {
  // Bestehend
  search: string;
  make: string;
  priceMax: string;
  body: VehicleBody | "";
  sort: "default" | "price_asc" | "price_desc" | "mileage_asc" | "year_desc";
  // NEU
  priceMin: string;         // z.B. "15000"
  yearMin: string;          // z.B. "2018"
  yearMax: string;          // z.B. "2024"
  kmMax: string;            // z.B. "50000"
  fuel: string;             // "Elektro" | "Hybrid" | "Benzin" | "Diesel" | ""
  transmission: string;     // "Automatik" | "Manuell" | ""
  color: string;            // aus verfügbaren Farben dynamisch
  drivetrain: string;       // "Frontantrieb" | "Allrad" | "Heckantrieb" | ""
  monthlyRateMax: string;   // Budget-Suche: max. Monatsrate CHF
}
```

### UI-Layout (zweizeilig)

```
Zeile 1: [🔍 Search] [Marke▾] [Karosserie▾] [Preis min▾] [Preis max▾]
Zeile 2: [Treibstoff▾] [Getriebe▾] [Jahr von▾] [Jahr bis▾] [km max▾] [Rate max▾] [Sort▾]
```

- Zeile 2 ist aufklappbar per „Mehr Filter"-Toggle (spart Mobile-Platz)
- Filter-Chips zeigen alle aktiven Filter (bestehend, unverändert)
- Reset-Button setzt alle neuen Felder ebenfalls zurück

### Filter-Logik (AutosContent.tsx)

Alle neuen Felder fließen in die clientseitige `useMemo`-Filter-Kette ein:
- `priceMin`: `v.price >= parseInt(priceMin)`
- `yearMin/yearMax`: `v.year >= yearMin && v.year <= yearMax`
- `kmMax`: `v.mileage <= parseInt(kmMax)`
- `fuel`: `v.fuel === fuel`
- `transmission`: `v.transmission === transmission`
- `color`: `v.color === color`
- `drivetrain`: `v.drivetrain === drivetrain`
- `monthlyRateMax`: `v.leasingPrice <= parseInt(monthlyRateMax)`

---

## Block 2: VDP-Ergänzungen

### Dateien
- Modify: `app/autos/[id]/page.tsx`
- Create: `components/vehicles/VDPContactForm.tsx`
- Create: `components/vehicles/LeasingWidget.tsx`
- Create: `components/vehicles/TestDriveModal.tsx`

### 2a: WhatsApp-Button

In der Preis-Card, unterhalb des Telefon-Links:

```tsx
<a
  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Guten Tag, ich interessiere mich für den ${vehicle.make} ${vehicle.model}${vehicle.variant ? ' ' + vehicle.variant : ''} (CHF ${vehicle.price.toLocaleString('de-CH')}).`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
             text-white text-sm font-semibold"
  style={{ backgroundColor: "#25D366" }}
>
  <WhatsAppIcon /> WhatsApp
</a>
```

**Konfiguration:** `WHATSAPP_NUMBER` als Umgebungsvariable in `.env.local` (Format: `41791234567`, ohne `+`). Platzhalter: `NEXT_PUBLIC_WHATSAPP_NUMBER=41791234567`.

### 2b: Kompaktes Leasingrechner-Widget (LeasingWidget.tsx)

Eingebettet in die Preis-Card unterhalb des Kaufpreises:

```
Leasingrechner
Laufzeit: [24] [36] [48★] [60]
km/Jahr:  [10K] [15K★] [20K] [30K]
─────────────────────────────────
Monatsrate: CHF 447 /Mt.
*3.9% p.a., 10% Anzahlung, vorbehaltl. Bonitätsprüfung
[Detailrechner → /finanzierung]
```

**Formel:**
```ts
const rate = (price * (1 - downPaymentRatio))
  * (monthlyRate * Math.pow(1 + monthlyRate, months))
  / (Math.pow(1 + monthlyRate, months) - 1);
// monthlyRate = 0.039 / 12
// Anzahlung default: 10%
```

Props: `price: number` (vorausgefüllt vom Fahrzeugpreis).

### 2c: Inline Kontaktformular (VDPContactForm.tsx)

Accordion-Sektion „Direkt anfragen" in der Preis-Card, unterhalb der CTA-Buttons:

```
Name *          [________________]
Telefon/E-Mail *[________________]
Nachricht       [Ich interessiere mich für den VW Golf...] (vorausgefüllt)
                [Nachricht senden →]
```

Submit → `POST /api/contact` mit `subject: "VDP-Direktanfrage: [Fahrzeug]"`.
Maximal 3 sichtbare Felder (Name, Kontakt, Nachricht). Loading-State + Erfolgs-/Fehler-Feedback.

### 2d: Probefahrt-Modal (TestDriveModal.tsx)

Neuer CTA-Button in der Preis-Card: „Probefahrt buchen" (Outline-Style).

Modal mit 3 Feldern:
- Name *
- Telefon *
- Wunschtermin (date input, min = heute + 1 Tag)

Submit → `POST /api/contact` mit `subject: "[Probefahrt] VW Golf – 15.03.2026"`.
Trigger: Button in Preis-Card + Sticky Mobile CTA-Bar (Block 5).

---

## Block 3: Interaktiver Leasingrechner

### Dateien
- Modify: `app/finanzierung/page.tsx`
- Create: `components/ui/LeasingCalculator.tsx`

### Komponente LeasingCalculator.tsx (Client Component)

```
┌──────────────────────────────────────────────────────┐
│  Ihr persönlicher Leasingrechner                     │
│                                                      │
│  Fahrzeugpreis:  ●────────────── CHF 33'500          │
│                  10'000          100'000             │
│                                                      │
│  Anzahlung:      ─●──────────── 10%  = CHF 3'350    │
│                  0%             40%                  │
│                                                      │
│  Laufzeit:    [24 Mt.] [36 Mt.] [48 Mt.★] [60 Mt.] │
│                                                      │
│  km/Jahr:  [10'000] [15'000★] [20'000] [30'000]    │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Ihre Monatsrate:  CHF 589 /Mt.               │  │
│  │  *3.9% p.a., inkl. 8.1% MwSt.                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [Jetzt Offerte anfragen →]                          │
└──────────────────────────────────────────────────────┘
```

**Parameter:**
- Preis-Slider: CHF 10'000 – 100'000 (Step: 500)
- Anzahlungs-Slider: 0% – 40% (Step: 5%)
- Laufzeit: 24 | 36 | 48 | 60 Monate (Toggle-Buttons)
- km/Jahr: 10'000 | 15'000 | 20'000 | 30'000 (Toggle-Buttons)
- Zinssatz: 3.9% p.a. (fest, Schweizer Marktstandard)

**Formel (identisch zu LeasingWidget):**
```ts
const monthly = 0.039 / 12;
const n = laufzeit;
const financed = price * (1 - downPayment / 100);
const rate = financed * (monthly * Math.pow(1 + monthly, n)) / (Math.pow(1 + monthly, n) - 1);
```

**Placement:** Nach der Leasing-Tabelle auf `/finanzierung`, vor dem B2B-Teaser.

---

## Block 4: Homepage-Ergänzungen

### Dateien
- Modify: `app/page.tsx`
- Modify: `components/layout/Footer.tsx`

### 4a: Google Reviews-Section

Neue Section nach dem Steps-Block (vor dem Feature/USP-Grid):

```
─────────────────────────────────────────────────────
            Das sagen unsere Kunden
    ⭐⭐⭐⭐⭐  4.9 von 5  ·  47 Bewertungen

  [Review 1]  [Review 2]  [Review 3]  [→ Alle auf Google]
─────────────────────────────────────────────────────
```

**Implementierung:**
- Statische Reviews als Array in `app/page.tsx` (von Google Business Profil kopieren)
- Google-Badge mit Gesamtrating + Sterndarstellung + Link zu Google Maps
- Kein externer Embed, keine Google-Widget-JS-Einbindung (DSGVO-konform)
- TODO-Kommentar: `// TODO: Place ID = ChIJ... → Google Places API für Live-Reviews`
- Wenn `NEXT_PUBLIC_GOOGLE_PLACE_ID` gesetzt ist, werden Live-Reviews via API Route geladen

**Struktur:**
```ts
const googleReviews = [
  { text: "...", name: "Thomas K.", stars: 5, date: "Jan 2026" },
  // … weitere
];
const googleRating = { average: 4.9, count: 47 };
```

### 4b: MWST-konforme Preisdarstellung

**VehicleCard:**
- Kaufpreis erhält kleinen Subtext: `inkl. MwSt.`
- Leasing-Rate behält bestehenden Hinweis

**VDP (app/autos/[id]/page.tsx):**
- Kaufpreis-Card: „inkl. 8.1% MwSt." unterhalb des Preises
- Für Occasionen: Tooltip/Subtext „Margenbesteuerung (fikt. Vorsteuerabzug)"

**Footer:**
- UID-Nummer: `CHE-XXX.XXX.XXX MWST` (Platzhalter — du ersetzt mit echter Nummer)
- Rechtliche Pflichtangabe neben Firmenname/Adresse

---

## Block 5: Sticky Mobile CTA-Bar

### Dateien
- Create: `components/ui/MobileCTABar.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (body padding)

### Design

```
┌─────────────────────────────────────────────────────┐
│  [📞 Anrufen]    [💬 WhatsApp]    [📅 Probefahrt]   │
└─────────────────────────────────────────────────────┘
  fixed bottom-0, md:hidden, w-full, bg-white, shadow-top
```

**Farben:**
- Anrufen: `bg-ct-dark text-white`
- WhatsApp: `bg-[#25D366] text-white`
- Probefahrt/Termin: `bg-ct-cyan text-white`

**Context-aware Logik:**
```tsx
"use client"
const pathname = usePathname();
const isVDP = pathname?.startsWith("/autos/") && pathname !== "/autos";
// → Probefahrt-Button öffnet Modal wenn auf VDP, sonst Link zu /kontakt
```

**Body-Padding:**
```css
/* globals.css */
body { padding-bottom: 5rem; }
@media (min-width: 768px) { body { padding-bottom: 0; } }
```

**Links:**
- Anrufen: `href="tel:+41566185544"`
- WhatsApp: `href="https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}"`
- Termin: VDP → öffnet TestDriveModal; andere Seiten → `/kontakt`

---

## Konfiguration (.env.local Ergänzungen)

```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=41791234567   # Separate WhatsApp-Nummer (ohne +)
NEXT_PUBLIC_GOOGLE_PLACE_ID=ChIJ...       # Optional, für Live-Reviews
```

---

## NICHT in Phase 1 (Phase 2+)

| Feature | Phase |
|---------|-------|
| Probefahrt-Buchung mit Kalender/Verfügbarkeit | 2 |
| Digitale Inzahlungnahme (Kontrollschild + Stripe) | 2 |
| Fahrzeug-Reservierung (TWINT/Stripe) | 2 |
| Mehrsprachigkeit DE/FR/IT/EN | 2 |
| Preisalarm / Push-Benachrichtigungen | 2 |
| Fahrzeugvergleich (bis 3 Fahrzeuge) | 2 |
| KI-Chatbot (Matador.ai / Toma) | 3 |
| 360°-Ansichten (Spyne/Glo3D) | 3 |
| Cardossier-Integration | 3 |
| E-Signatur (Skribble) | 3 |
| Self-Service-Probefahrt | 3 |
| Video-Walkarounds | 3 |
| Marktpreisvergleich (AS24-Ø-Preis) | 3 |
| Echtzeit-Personalisierung | 3 |
| AI SEO / AI Overviews Optimierung | 3 |
| Zulassungsservice | 3 |
| Fahrzeug-Sourcing-Service | 3 |

---

## Erwartete Business-Wirkung (Phase 1)

| Feature | Erwartete Wirkung |
|---------|-------------------|
| Sticky Mobile CTA-Bar | +15–25% mobile Leads |
| WhatsApp-Button | Niedrigschwelligster Kontaktkanal, hohe Öffnungsrate |
| Erweiterte Filter | 2–3× höhere Conversion bei gezielter Suche (Typeahead-Effekt) |
| Leasingrechner | Kaufhemmer "zu teuer" überwinden; +20–30% Offerte-Anfragen |
| Google Reviews | 88% der Konsumenten vertrauen Reviews wie persönlichen Empfehlungen |
| MWST-Anzeige | Gesetzliche Pflicht; vermeidet Abmahnung |
