# Car Trade24 — Projektübersicht
**Wohlen, Schweiz | cartrade24.ch**
*Stand: März 2026*

---

## Was wurde gebaut?

Eine vollständige, moderne Automobil-Website auf Basis von **Next.js 16** (React 19, TypeScript, Tailwind CSS). Die Seite ist mehrsprachig (DE / FR / IT / EN), mobiloptimiert und vollständig mit dem AutoScout24-Händlerportal verbunden.

---

## Funktionen im Überblick

### Fahrzeugbörse
- **Fahrzeugliste** mit Echtzeit-Filterung nach Marke, Preis, Baujahr, Kilometerstand, Treibstoff, Getriebe, Antrieb, Farbe und Leasingrate
- **Fahrzeugdetailseite (VDP)** mit Bildergalerie, vollständigen Fahrzeugdaten, Energieeffizienzklasse und Ausstattungsübersicht
- **Fahrzeugvergleich** bis zu 3 Fahrzeuge gleichzeitig (tabellarisch, via URL-Parameter)
- **Zuletzt angesehene Fahrzeuge** — werden lokal gespeichert und auf der Startseite angezeigt
- **Ähnliche Fahrzeuge** — automatische Empfehlungen auf der Detailseite
- **Marktpreisvergleich** — zeigt an, ob der Preis unter, im oder über dem Marktdurchschnitt liegt (via Eurotax)
- **360°-Ansicht** — für Fahrzeuge mit Panoramaaufnahmen (via AutoScout24-Feed)
- **Video-Walkarounds** — einbettbar pro Fahrzeug (via AutoScout24-Feed)

### KI-Features (Claude AI)
- **Automatische Verkäufertexte** — jedes Fahrzeug erhält einen individuellen, persönlichen Beschreibungstext (3–4 Sätze, Deutsch)
- **SEO-Metadaten** — automatisch generierte Meta-Description und Keywords pro Fahrzeug
- **KI-Chat-Assistent** — schwebender Chat-Button auf jeder Seite; kennt den aktuellen Fahrzeugbestand; antwortet auf Kundenanfragen auf Deutsch in Echtzeit

### Digitale Services
- **Fahrzeug-Reservierung** — Online-Anzahlung CHF 200 via Kreditkarte; Fahrzeug wird für 48 h reserviert; automatische Bestätigungs-E-Mail an Kunde und Händler
- **Inzahlungnahme-Assistent** — Kunde gibt Kontrollschild und Kilometerstand ein → sofortige Marktwertschätzung → optionale Gebühr CHF 20 für verbindliche Bewertung via Stripe
- **Probefahrt-Buchung** — Terminbuchung direkt aus der Fahrzeugdetailseite (Matelso-Widget)
- **Preisalarm** — Kunde hinterlegt E-Mail-Adresse und Suchkriterien; automatische Benachrichtigung bei Preissenkungen (täglich via Cron-Job)
- **Kontaktformular** — allgemeines Anfrage-Formular mit E-Mail-Weiterleitung an den Händler
- **E-Signatur** (vorbereitet) — Kaufverträge können digital unterzeichnet werden (Skribble)

### Zusatzseiten
| Seite | Inhalt |
|-------|--------|
| Startseite | Fahrzeugsuche, Services-Überblick, KI-Chat |
| Finanzierung | Interaktiver Leasingrechner |
| Ankauf | Fahrzeug-Ankaufsformular |
| Fahrzeug-Sourcing | Wir finden Ihr Wunschauto |
| Home Delivery | Lieferung bis zur Haustür (30–50 km) |
| Zulassungsservice | Kompletter Anmeldeservice |
| Firmenkunden | Flottenlösungen |
| Garantie | Garantieleistungen |
| Über uns / Kontakt / FAQ | Standardseiten |
| Datenschutz / AGB | Rechtliche Seiten |
| Sitemap / robots.txt | SEO-Infrastruktur |

### Technische Features
- **Mehrsprachigkeit** — Deutsch, Französisch, Italienisch, Englisch (URL-Präfix `/fr/`, `/it/`, `/en/`)
- **SEO-optimiert** — strukturierte Daten (JSON-LD), automatische Sitemaps, individuelle Meta-Tags pro Fahrzeug
- **Cookie-Banner** — DSGVO-konform
- **Google Tag Manager** — für Analytics und Conversion-Tracking
- **Matelso-Integration** — Telefontracking und Terminbuchung
- **Mobil-optimiert** — Sticky CTA-Leiste (Anrufen / WhatsApp / Probefahrt) auf mobilen Geräten

---

## Benötigte APIs und Dienste

### Pflicht (Grundbetrieb)

| Dienst | Zweck | Anbieter |
|--------|-------|----------|
| **AutoScout24 Dealer API** | Fahrzeugbestand (Live-Daten) | AutoScout24 |
| **Anthropic Claude API** | KI-Texte + Chat-Assistent | Anthropic |
| **Stripe** | Online-Zahlungen (Reservierung + Inzahlungnahme) | Stripe |
| **Resend** | Transaktions-E-Mails (Bestätigungen, Preisalarme) | Resend |
| **Vercel KV** | Speicherung von Reservierungen + Preisalarmen | Vercel |
| **SMTP-Server** | Backup für Kontaktformular-E-Mails | eigener Mailserver |

### Optional (bei Bedarf aktivierbar)

| Dienst | Zweck | Anbieter |
|--------|-------|----------|
| **Eurotax** | Verbindliche Fahrzeugbewertung (Inzahlungnahme) | Eurotax Switzerland |
| **Matelso** | Telefontracking + Terminbuchungs-Widget | Matelso |
| **Google Tag Manager** | Website-Analytics und Tracking | Google |
| **Skribble** | Digitale Unterschrift auf Kaufverträgen | Skribble (CH) |

---

## Konfiguration vor Go-Live

Folgende Angaben müssen vor der Produktivschaltung eingetragen werden:

### Pflichtangaben

| Was | Wo |
|-----|----|
| AutoScout24 API-Key + Händler-ID | `.env.local` → `AS24_API_KEY`, `AS24_DEALER_ID` |
| Anthropic API-Key | `.env.local` → `ANTHROPIC_API_KEY` |
| Stripe Live-Keys (Public + Secret) | `.env.local` → `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Stripe Webhook-Secret | `.env.local` → `STRIPE_WEBHOOK_SECRET` |
| Resend API-Key | `.env.local` → `RESEND_API_KEY` |
| Händler-E-Mail | `.env.local` → `DEALER_EMAIL` |
| SMTP-Zugangsdaten | `.env.local` → `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| Vercel KV-Zugangsdaten | `.env.local` → `KV_REST_API_URL`, `KV_REST_API_TOKEN` |
| WhatsApp-Nummer | `.env.local` → `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| MWST-UID (UID-Nummer) | `components/layout/Footer.tsx` → `CHE-XXX.XXX.XXX MWST` ersetzen |
| Produktions-URL | `.env.local` → `NEXT_PUBLIC_BASE_URL` |

### Optionale Angaben

| Was | Wo |
|-----|----|
| Google Tag Manager ID | `.env.local` → `NEXT_PUBLIC_GTM_ID` |
| Google Place ID (für Live-Bewertungen) | `.env.local` → `NEXT_PUBLIC_GOOGLE_PLACE_ID` |
| Matelso Widget-ID + Booking-URL | `.env.local` → `NEXT_PUBLIC_MATELSO_ID`, `NEXT_PUBLIC_MATELSO_BOOKING_URL` |
| Eurotax API-Key + URL | `.env.local` → `EUROTAX_API_KEY`, `EUROTAX_API_URL` |
| Skribble Benutzername + API-Key | `.env.local` → `SKRIBBLE_USERNAME`, `SKRIBBLE_API_KEY` |
| Cron-Job Secret | `.env.local` → `CRON_SECRET` |

---

## Technischer Stack (Kurzübersicht)

| Technologie | Version | Zweck |
|-------------|---------|-------|
| Next.js | 16.1.6 | Framework (App Router, SSR/ISR) |
| React | 19.2 | UI-Bibliothek |
| TypeScript | 5 | Typsicherheit |
| Tailwind CSS | 4 | Styling |
| next-intl | 4.8 | Mehrsprachigkeit |
| @anthropic-ai/sdk | 0.78 | Claude AI Integration |
| stripe | 20.4 | Zahlungsabwicklung |
| @vercel/kv | 3.0 | Datenspeicherung |
| resend | 6.9 | E-Mail-Versand |
| react-pannellum | 0.2 | 360°-Panoramaansicht |
| lucide-react | 0.575 | Icons |

---

*Dokument erstellt März 2026 — Alle Features wurden entwickelt und getestet. Echte API-Keys und Produktionskonfiguration sind vor Go-Live einzutragen.*
