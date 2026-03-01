# Design: Phase 2 – Mittlere Komplexität

> **Status:** Approved
> **Datum:** 2026-03-01
> **Nächster Schritt:** `superpowers:writing-plans` zur Erstellung des Implementierungsplans

---

## Ziel

Sechs conversion-starke Features mit mittlerer Komplexität umsetzen. Externe Abhängigkeiten (Stripe, Resend, Eurotax, Matelso Booking) werden mit Test-Keys / Demo-Daten hinterlegt und vor Go-Live durch echte Keys ersetzt.

---

## Tech-Stack (Ergänzungen zu Phase 1)

- `next-intl` — Mehrsprachigkeit
- `@stripe/stripe-js` + `stripe` (npm) — Payment
- `resend` (npm) — Transaktions-E-Mails
- `@vercel/kv` — Preisalarm-Subscriptions + Reservierungs-Status
- Matelso Booking Widget — iFrame-Embed (Platzhalter bis Widget konfiguriert)
- Eurotax API — Fahrzeugbewertung (Demo-Mock wenn kein API-Key)

---

## Go-Live Checkliste (VOR Produktivschaltung)

- [ ] `NEXT_PUBLIC_MATELSO_BOOKING_URL` im Matelso-Dashboard einrichten und eintragen
- [ ] `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` auf Live umstellen
- [ ] `RESEND_API_KEY` auf Production-Key umstellen
- [ ] `EUROTAX_API_KEY` + `EUROTAX_API_URL` eintragen
- [ ] Vercel KV Produktion-Datenbank verknüpfen (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)
- [ ] next-intl Übersetzungen (FR/IT/EN) durch Profi-Übersetzungen ersetzen

---

## Block 1: Mehrsprachigkeit (next-intl) — ZUERST

**Wird zuerst gebaut** — alle anderen Features kommen bereits mehrsprachig.

### Sprachen

| Locale | Prefix | Status |
|--------|--------|--------|
| `de` | keiner (Default) | Vollständig |
| `fr` | `/fr/` | Maschinen-Placeholder + `// TODO: Profi-Übersetzung` |
| `it` | `/it/` | Maschinen-Placeholder |
| `en` | `/en/` | Maschinen-Placeholder |

### Dateien

- Install: `next-intl`
- Create: `middleware.ts` — Locale-Detection + Redirect
- Create: `i18n.ts` — next-intl Config
- Create: `messages/de.json`, `messages/fr.json`, `messages/it.json`, `messages/en.json`
- Modify: `app/layout.tsx` → `app/[locale]/layout.tsx`
- Modify: Alle `app/**` Pages → unter `app/[locale]/`
- Create: `components/ui/LocaleSwitcher.tsx` — Dropdown im Header (DE / FR / IT / EN)
- Modify: `components/layout/Header.tsx` — LocaleSwitcher einbauen
- Modify: `next.config.ts` — next-intl Plugin

### SEO

- `alternates.languages` in `generateMetadata` für alle Pages
- `hreflang` x-default = DE

---

## Block 2: Fahrzeugvergleich

### Dateien

- Modify: `components/vehicles/VehicleCard.tsx` — Vergleichen-Toggle-Button
- Create: `components/vehicles/CompareBar.tsx` — fixe Bar, erscheint wenn ≥1 Fahrzeug gewählt
- Create: `app/[locale]/vergleich/page.tsx` — Vergleichsseite
- Create: `components/vehicles/CompareTable.tsx` — Side-by-Side Tabelle

### State

```ts
// URL: /vergleich?compare=1,3,5
// CompareBar liest/schreibt via useSearchParams + useRouter
// Max 3 Fahrzeuge — bei 3 sind weitere Buttons disabled
```

### Vergleichstabelle

Zeigt alle gemeinsamen Felder: Preis, Baujahr, km, Treibstoff, Getriebe, Leistung (PS), Karosserie, Farbe, Antrieb, Türen, Sitze, Energielabel.
Abweichende Werte werden farblich hervorgehoben (`bg-ct-cyan/10`).
Jede Spalte hat einen „Anfragen"-CTA-Button.

---

## Block 3: Probefahrt-Buchung (Matelso Widget)

### Dateien

- Create: `components/ui/MatelsoBookingWidget.tsx` — iFrame-Wrapper
- Modify: `components/vehicles/TestDriveModal.tsx` — Widget statt 3-Felder-Formular wenn URL konfiguriert
- Modify: `app/[locale]/kontakt/page.tsx` — neue Sektion „Probefahrt buchen"

### Logik

```ts
// components/ui/MatelsoBookingWidget.tsx
const BOOKING_URL = process.env.NEXT_PUBLIC_MATELSO_BOOKING_URL ?? null;

// Wenn BOOKING_URL null → Fallback: bestehendes 3-Felder-Formular (Phase 1)
// Wenn BOOKING_URL gesetzt → <iframe src={BOOKING_URL} />
```

### Neue .env.local Keys

```bash
NEXT_PUBLIC_MATELSO_BOOKING_URL=   # leer lassen bis Widget im Matelso-Dashboard konfiguriert
```

---

## Block 4: Preisalarm

### Dateien

- Create: `components/ui/PriceAlertForm.tsx` — E-Mail + aktive Filter als Kriterien
- Create: `app/api/price-alert/route.ts` — POST: speichert in Vercel KV, sendet Bestätigung via Resend
- Create: `app/api/cron/price-check/route.ts` — Vercel Cron (täglich 08:00), vergleicht Alerts mit Bestand
- Modify: `components/vehicles/AutosContent.tsx` — PriceAlertForm unterhalb des leeren Grids + nach Ergebnissen
- Modify: `app/[locale]/autos/[id]/page.tsx` — PriceAlertForm unterhalb der Preis-Card

### Vercel KV Schema

```ts
// Key: "alert:{uuid}"
// Value: { email, filters: FilterState, createdAt, locale }
// Index: "alerts" → Set of UUIDs
```

### E-Mails (Resend)

- Bestätigungs-E-Mail nach Anmeldung (Resend Template)
- Alert-E-Mail bei Match: „Neues Fahrzeug: [Marke Modell] – CHF X" + Link zum Fahrzeug
- Demo: `RESEND_API_KEY=re_test_...` → E-Mails erscheinen im Resend-Dashboard

### Neue .env.local Keys

```bash
RESEND_API_KEY=re_test_...
RESEND_FROM=noreply@cartrade24.ch
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

---

## Block 5: Fahrzeug-Reservierung

### Dateien

- Modify: `app/[locale]/autos/[id]/page.tsx` — „Jetzt reservieren"-Button in Preis-Card
- Create: `app/api/reserve/route.ts` — POST: erstellt Stripe Checkout Session
- Create: `app/api/webhooks/stripe/route.ts` — empfängt `checkout.session.completed`
- Create: `app/[locale]/reservierung/bestaetigung/page.tsx` — Erfolgsseite
- Create: `app/[locale]/reservierung/abgebrochen/page.tsx` — Abbruch-Seite
- Modify: `components/vehicles/VehicleCard.tsx` — „Reserviert"-Badge

### Flow

```
VDP → POST /api/reserve { vehicleId }
  → Stripe Checkout Session (CHF 200, metadata: { vehicleId })
  → Redirect zu Stripe Hosted Checkout
  → Erfolg → /reservierung/bestaetigung?session_id=...
  → Webhook: KV.set(`reserved:${vehicleId}`, { until: +48h, sessionId })
  → Resend: Bestätigung an Kunde + Händler
```

### Neue .env.local Keys

```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESERVATION_AMOUNT_CHF=200
RESERVATION_HOURS=48
```

---

## Block 6: Digitale Inzahlungnahme

### Dateien

- Create: `app/[locale]/inzahlungnahme/page.tsx` — 3-Schritt-Wizard
- Create: `components/ui/TradeInWizard.tsx` — Client Component, Stepper
- Create: `lib/eurotax.ts` — Bewertungs-API (mit Demo-Fallback)
- Create: `app/api/trade-in/valuate/route.ts` — POST: Eurotax-Schätzung
- Create: `app/api/trade-in/checkout/route.ts` — POST: Stripe Checkout CHF 20
- Create: `app/[locale]/inzahlungnahme/bestaetigung/page.tsx` — Erfolgsseite
- Modify: `components/layout/Footer.tsx` + Navigation — Link zu `/inzahlungnahme`
- Modify: `app/[locale]/page.tsx` (Homepage) — Inzahlungnahme-Teaser-Block

### Wizard-Schritte

```
Schritt 1: Kontrollschild (CH-Format), km-Stand, Zustand (Sehr gut / Gut / Gebraucht)
Schritt 2: Sofortschätzung CHF X'000 – Y'000 (Eurotax oder Demo-Mock)
           + „Jetzt verbindlich bewerten lassen – CHF 20"
Schritt 3: Stripe Checkout CHF 20
           → Erfolg: „Wir melden uns innert 24h mit einem verbindlichen Angebot"
```

### Eurotax Demo-Mock

```ts
// lib/eurotax.ts
export async function getValuation(plate: string, km: number, condition: string) {
  if (!process.env.EUROTAX_API_KEY) {
    // Demo: plausible Schätzung basierend auf km
    const base = Math.max(5000, 35000 - km * 0.2);
    return { min: Math.round(base * 0.85), max: Math.round(base * 1.15), currency: "CHF" };
  }
  // Echter Eurotax API-Call
}
```

### Neue .env.local Keys

```bash
EUROTAX_API_KEY=          # leer lassen für Demo-Modus
EUROTAX_API_URL=https://api.eurotax.ch/v1
TRADEIN_FEE_CHF=20
```

---

## NICHT in Phase 2 (Phase 3)

| Feature | Phase |
|---------|-------|
| KI-Chatbot | 3 |
| 360°-Ansichten | 3 |
| Cardossier-Integration | 3 |
| E-Signatur | 3 |
| Self-Service-Probefahrt | 3 |
| Video-Walkarounds | 3 |
| Marktpreisvergleich | 3 |
| Personalisierung | 3 |
| KI-SEO | 3 |
| Zulassungsservice | 3 |
| Fahrzeug-Sourcing | 3 |
| Home Delivery | 3 |

---

## Erwartete Business-Wirkung (Phase 2)

| Feature | Erwartete Wirkung |
|---------|-------------------|
| Mehrsprachigkeit | Erschliessung FR/IT/EN Markt; SEO in 4 Sprachen |
| Fahrzeugvergleich | Längere Session-Dauer; höhere Kaufintention |
| Probefahrt via Matelso | Leads direkt im CRM; keine manuelle Übertragung |
| Preisalarm | Remarketing ohne Werbekosten; Wiederkehrerrate ↑ |
| Fahrzeug-Reservierung | Bindung vor Besuch; Reduktion No-Shows |
| Digitale Inzahlungnahme | Neuer Lead-Kanal; qualifizierte Verkäufer-Leads |
