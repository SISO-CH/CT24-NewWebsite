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
| @sentry/nextjs | 10.42 | Fehler-Tracking & Monitoring |
| @anthropic-ai/sdk | 0.78 | Claude AI Integration |
| Stripe | 20.4 | Zahlungsabwicklung |
| @vercel/kv | 3.0 | Datenspeicherung (Reservierungen, Preisalarme) |
| Resend | 6.9 | Transaktions-E-Mails |
| next-mdx-remote | 6.0 | Blog (MDX-Content) |
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
- **Probefahrt-Buchung** — Modal mit Anfrage-Formular + Matelso-Kalender
- **Home Delivery** — Lieferanfrage bis 50 km
- **Zulassungsservice** — kompletter Anmeldeservice
- **Fahrzeug-Sourcing** — «Wir finden Ihr Wunschauto»
- **Preisalarm** — E-Mail-Benachrichtigung bei Preissenkungen (täglich via Cron-Job)
- **E-Signatur** (vorbereitet) — Kaufverträge digital unterzeichnen via Skribble

### Blog
- **MDX-basierter Blog** — Kategorien: Ratgeber, Angebote, Firmenkunden, News, Events
- **KI-gestützte Blogerstellung** — automatische Generierung via Claude AI
- **Lese-Tracking** — Scroll-basiertes Tracking (50%-Schwelle)
- **SEO-optimiert** — strukturierte Daten, automatische Sitemaps, Kategorie-Tags

### Tracking & Analytics
- **Google Tag Manager (GTM)** — zentrale Tag-Verwaltung, consent-gesteuert
- **Sentry** — automatisches Fehler-Tracking mit Consent-Gating
- **Microsoft Clarity** — Heatmaps & Session-Recordings
- **Matelso** — Dynamic Number Insertion + Terminbuchungs-Widget
- **Typensichere Events** — `vehicle_view`, `lead_form_submit`, `phone_click`, `whatsapp_click`, `test_drive_request`, `cta_click`, `blog_read`, `vehicle_list_filter`, `share_click`
- **Dynamische Conversion-Werte** — 1% des Fahrzeugpreises (Fallback CHF 50)
- **Granularer Cookie-Banner** — 3 Kategorien: Analyse, Marketing, Fehler-Tracking

### Technische Features
- Mehrsprachigkeit: DE / FR / IT / EN (URL-Präfix `/fr/`, `/it/`, `/en/`)
- SEO: strukturierte Daten (JSON-LD), automatische Sitemaps, individuelle Meta-Tags
- DSGVO-konformer Cookie-Banner mit granularer Consent-Verwaltung
- Sticky Mobile CTA-Leiste (Anrufen / WhatsApp / Probefahrt)
- MWST-konforme Preisanzeige

---

## Projektstruktur

```
app/
├── [locale]/              # Alle Seiten (mehrsprachig)
│   ├── page.tsx           # Startseite
│   ├── autos/             # Fahrzeugliste + Detailseite (VDP)
│   ├── finanzierung/      # Interaktiver Leasingrechner
│   ├── blog/              # Blog (Übersicht + Artikel)
│   ├── vergleich/         # Fahrzeugvergleich
│   ├── reservierung/      # Fahrzeug-Reservierung (Stripe)
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
│   ├── faq/               # FAQ
│   ├── datenschutz/       # Datenschutzerklärung
│   └── agb/               # AGB
├── api/
│   ├── chat/              # KI-Chat-Assistent
│   ├── contact/           # Kontaktformular
│   ├── reserve/           # Fahrzeug-Reservierung
│   ├── price-alert/       # Preisalarm-Anmeldung
│   ├── cron/price-check/  # Preisalarm-Cron
│   ├── trade-in/          # Inzahlungnahme (valuate + checkout)
│   ├── signature/         # E-Signatur (Skribble)
│   └── webhooks/stripe/   # Stripe Webhooks
components/
├── layout/                # Header, Footer, Navigation
├── vehicles/              # Fahrzeug-Komponenten (VDP, Filter, Galerie, Vergleich)
├── blog/                  # Blog-Komponenten (BlogCard, BlogGrid, TrackBlogRead)
├── analytics/             # GTMScript, ClarityScript, MatelsoScript
├── contact/               # Kontaktformulare
└── ui/                    # Allgemeine UI (CookieBanner, MobileCTABar, Leasingrechner)
content/
└── blog/                  # MDX Blog-Artikel
lib/
├── as24.ts                # AutoScout24 Dealer API
├── ai.ts                  # Claude AI Integration
├── tracking.ts            # Typensicheres Event-Tracking (GTM dataLayer)
├── consent.ts             # Granulare Cookie-Consent-Verwaltung
├── useConsentGate.ts      # React Hook für consent-gesteuertes Script-Loading
├── blog.ts                # Blog-Utilities (MDX Parsing, Frontmatter)
├── blog-shared.ts         # Blog-Typen + Kategorien (client-safe)
├── vehicles.ts            # Fallback-Daten (Demo)
├── eurotax.ts             # Eurotax Fahrzeugbewertung
├── stripe.ts              # Stripe Integration
├── resend.ts              # E-Mail-Versand
├── skribble.ts            # E-Signatur
├── compare-store.ts       # Fahrzeugvergleich (State)
└── recently-viewed.ts     # Zuletzt angesehene Fahrzeuge
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
npm install --legacy-peer-deps
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

# E-Mail (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CONTACT_TO=

# Vercel KV (Reservierungen, Preisalarme)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Allgemein
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_BASE_URL=https://cartrade24.ch
```

Optionale Angaben:

```env
# Tracking & Analytics
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_CLARITY_ID=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Matelso (Telefontracking + Terminbuchung)
NEXT_PUBLIC_MATELSO_ID=
NEXT_PUBLIC_MATELSO_BOOKING_URL=

# Google Reviews
NEXT_PUBLIC_GOOGLE_PLACE_ID=

# Eurotax (Fahrzeugbewertung)
EUROTAX_API_KEY=
EUROTAX_API_URL=

# E-Signatur
SKRIBBLE_USERNAME=
SKRIBBLE_API_KEY=

# Cron-Jobs
CRON_SECRET=

# E-Mail (Resend, alternativ zu SMTP)
RESEND_API_KEY=
DEALER_EMAIL=
```

---

## Benötigte externe Dienste

| Dienst | Zweck | Pflicht |
|--------|-------|---------|
| AutoScout24 Dealer API | Fahrzeugbestand (Live-Daten) | Ja |
| Anthropic Claude API | KI-Texte + Chat | Ja |
| Stripe | Online-Zahlungen | Ja |
| Vercel KV | Datenspeicherung | Ja |
| SMTP-Server | E-Mail-Versand (Kontaktformulare) | Ja |
| Sentry | Fehler-Tracking & Monitoring | Optional |
| Microsoft Clarity | Heatmaps & Session-Recordings | Optional |
| Matelso | Telefontracking + Terminbuchung | Optional |
| Google Tag Manager | Analytics + Tag-Verwaltung | Optional |
| Eurotax | Verbindliche Fahrzeugbewertung | Optional |
| Resend | Transaktions-E-Mails (alternativ zu SMTP) | Optional |
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
- [ ] `NEXT_PUBLIC_GTM_ID` eintragen
- [ ] `NEXT_PUBLIC_CLARITY_ID` eintragen
- [ ] `NEXT_PUBLIC_SENTRY_DSN` + Sentry Auth Token eintragen
- [ ] next-intl Übersetzungen (FR / IT / EN) vollständig befüllen
- [ ] Blog: Sample-Posts durch echte Inhalte ersetzen
- [ ] Domain auf Vercel verknüpfen

---

*Entwickelt März 2026 — cartrade24.ch*
