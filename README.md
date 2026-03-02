# Car Trade24 — Website

Moderne Automobil-Website für **Car Trade24**, Wohlen (Aargau, Schweiz).
Gebaut auf Next.js 16 mit vollständiger AutoScout24-Integration, KI-Features und digitalen Services.

---

## Tech Stack

| Technologie | Version | Zweck |
|-------------|---------|-------|
| Next.js | 16 | Framework (App Router, SSR/ISR) |
| React | 19 | UI-Bibliothek |
| TypeScript | 5 | Typsicherheit |
| Tailwind CSS | 4 | Styling |
| next-intl | 4.8 | Mehrsprachigkeit (DE / FR / IT / EN) |
| @anthropic-ai/sdk | 0.78 | Claude AI Integration |
| Stripe | 20.4 | Zahlungsabwicklung |
| @vercel/kv | 3.0 | Datenspeicherung (Reservierungen, Preisalarme) |
| Resend | 6.9 | Transaktions-E-Mails |
| lucide-react | 0.575 | Icons |

---

## Features

### Fahrzeugbörse
- **Fahrzeugliste** mit Echtzeit-Filterung (Marke, Preis, Baujahr, km, Treibstoff, Getriebe, Antrieb, Farbe, Leasingrate)
- **Fahrzeugdetailseite (VDP)** mit Bildergalerie, 360°-Ansicht, Video-Walkaround als Tabs
- **Fahrzeugvergleich** bis 3 Fahrzeuge tabellarisch (via URL-Parameter)
- **Zuletzt angesehene Fahrzeuge** (localStorage, auf Startseite angezeigt)
- **Ähnliche Fahrzeuge** — automatische Empfehlungen auf der Detailseite
- **Marktpreisvergleich** — Preistransparenz via Eurotax

### KI-Features (Claude AI)
- **Automatische Verkäufertexte** — individueller Beschreibungstext pro Fahrzeug
- **SEO-Metadaten** — automatisch generierte Meta-Description + Keywords
- **KI-Chat-Assistent** — schwebender Chat auf jeder Seite, kennt den Fahrzeugbestand

### Digitale Services
- **Fahrzeug-Reservierung** — Online-Anzahlung CHF 200 via Stripe, 48h Reservierung
- **Inzahlungnahme-Assistent** — Kontrollschild-Eingabe → Sofortbewertung → opt. Stripe-Zahlung CHF 20
- **Probefahrt-Buchung** — eigene Seite mit Anfrage-Formular
- **Home Delivery** — Lieferanfrage bis 50 km
- **Zulassungsservice** — kompletter Anmeldeservice
- **Fahrzeug-Sourcing** — «Wir finden Ihr Wunschauto»
- **Preisalarm** — E-Mail-Benachrichtigung bei Preissenkungen (täglich via Cron-Job)
- **E-Signatur** (vorbereitet) — Kaufverträge digital unterzeichnen via Skribble

### Technische Features
- Mehrsprachigkeit: DE / FR / IT / EN (URL-Präfix `/fr/`, `/it/`, `/en/`)
- SEO: strukturierte Daten (JSON-LD), automatische Sitemaps, individuelle Meta-Tags
- DSGVO-konformer Cookie-Banner
- Google Tag Manager Integration
- Sticky Mobile CTA-Leiste (Anrufen / WhatsApp / Probefahrt)
- Matelso Telefontracking

---

## Projektstruktur

```
app/
├── [locale]/              # Alle Seiten (mehrsprachig)
│   ├── page.tsx           # Startseite
│   ├── autos/             # Fahrzeugliste + Detailseite (VDP)
│   ├── finanzierung/      # Interaktiver Leasingrechner
│   ├── inzahlungnahme/    # Inzahlungnahme-Assistent
│   ├── probefahrt/        # Probefahrt-Buchung
│   ├── home-delivery/     # Home Delivery Service
│   ├── zulassungsservice/ # Zulassungsservice
│   ├── fahrzeug-sourcing/ # Fahrzeug-Sourcing
│   ├── ankauf/            # Fahrzeug-Ankauf
│   ├── firmenkunden/      # Flottenlösungen
│   ├── garantie/          # Garantieleistungen
│   ├── ueber-uns/         # Über uns
│   ├── kontakt/           # Kontakt
│   └── faq/               # FAQ
├── api/                   # API Routes (chat, contact, reserve, price-alert, webhooks)
components/
├── layout/                # Header, Footer, Navigation
├── vehicles/              # Fahrzeug-Komponenten (VDP, Filter, Galerie, etc.)
├── ui/                    # Allgemeine UI-Komponenten
└── analytics/             # GTM, Matelso
lib/
├── as24.ts                # AutoScout24 Dealer API
├── ai.ts                  # Claude AI Integration
├── vehicles.ts            # Fallback-Daten (Demo)
└── eurotax.ts             # Eurotax Fahrzeugbewertung
docs/
└── plans/                 # Design- und Implementationsdokumente
```

---

## Setup

### Voraussetzungen
- Node.js 20+
- npm

### Installation

```bash
git clone git@github.com:SISO-CH/CT24-NewWebsite.git
cd CT24-NewWebsite
npm install
cp .env.example .env.local   # API Keys eintragen
npm run dev
```

### Umgebungsvariablen

Pflichtangaben (`.env.local`):

```env
# AutoScout24
AS24_API_KEY=
AS24_DEALER_ID=

# Anthropic Claude AI
ANTHROPIC_API_KEY=

# Stripe (Reservierung + Inzahlungnahme)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# E-Mail
RESEND_API_KEY=
DEALER_EMAIL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Vercel KV (Reservierungen, Preisalarme)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Allgemein
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_BASE_URL=https://cartrade24.ch
```

Optionale Angaben:

```env
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GOOGLE_PLACE_ID=
NEXT_PUBLIC_MATELSO_ID=
NEXT_PUBLIC_MATELSO_BOOKING_URL=
EUROTAX_API_KEY=
EUROTAX_API_URL=
SKRIBBLE_USERNAME=
SKRIBBLE_API_KEY=
CRON_SECRET=
```

---

## Benötigte externe Dienste

| Dienst | Zweck | Pflicht |
|--------|-------|---------|
| AutoScout24 Dealer API | Fahrzeugbestand (Live-Daten) | Ja |
| Anthropic Claude API | KI-Texte + Chat | Ja |
| Stripe | Online-Zahlungen | Ja |
| Resend | Transaktions-E-Mails | Ja |
| Vercel KV | Datenspeicherung | Ja |
| Eurotax | Verbindliche Fahrzeugbewertung | Optional |
| Matelso | Telefontracking + Terminbuchung | Optional |
| Google Tag Manager | Analytics + Tracking | Optional |
| Skribble | Digitale Kaufvertrag-Signatur | Optional |

---

## Git-Workflow

```
master = stabiler Stand (protected, kein direkter Push)

1. git checkout -b feature/name
2. Änderungen + Commits
3. git push origin feature/name
4. Pull Request auf GitHub erstellen
5. Review + Merge auf GitHub
```

---

## Go-Live Checkliste

- [ ] Alle Pflicht-API-Keys in `.env.local` eintragen
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` mit echter Nummer ersetzen
- [ ] `CHE-XXX.XXX.XXX MWST` im Footer durch echte UID ersetzen
- [ ] `NEXT_PUBLIC_GOOGLE_PLACE_ID` für Live-Reviews eintragen
- [ ] Stripe Live-Keys hinterlegen (statt Test-Keys)
- [ ] Matelso Widget-ID im Dashboard einrichten
- [ ] next-intl Übersetzungen (FR / IT / EN) vollständig befüllen
- [ ] Domain auf Vercel verknüpfen

---

*Entwickelt März 2026 — cartrade24.ch*
