# Design: Phase 3 – Vertrauen, KI & Volldigitaler Kauf

> **Status:** Approved
> **Datum:** 2026-03-01
> **Nächster Schritt:** `superpowers:writing-plans` zur Erstellung des Implementierungsplans

---

## Ziel

12 Features in 4 Blöcken umsetzen, die das Fahrzeugvertrauen stärken, Kundenkommunikation automatisieren, den gesamten Kaufprozess digitalisieren und die Marktpositionierung schärfen.

---

## Tech-Stack (Ergänzungen zu Phase 2)

- `react-pannellum` — interaktiver 360°-Viewer (einzige neue npm-Abhängigkeit)
- Claude API (Anthropic) — KI-Chatbot + KI-SEO (lib/ai.ts existiert bereits)
- Eurotax API — Marktpreisvergleich (lib/eurotax.ts existiert bereits)
- Skribble API — E-Signatur (Swiss-konform, ZertES/eIDAS)
- Alle anderen Features via bestehende Infrastruktur (Resend, Vercel KV, AS24)

---

## Go-Live Checkliste (VOR Produktivschaltung)

- [ ] `SKRIBBLE_USERNAME` + `SKRIBBLE_API_KEY` im Skribble-Dashboard erstellen
- [ ] AS24-Feldnamen für `panorama`, `video`, `cardossierUrl` gegen echte API verifizieren (curl-Test)
- [ ] `EUROTAX_API_KEY` gesetzt (Marktpreisvergleich nutzt selben Key wie Trade-In)
- [ ] Chat-Widget mit realen Händlerinfos (Öffnungszeiten, Adresse, Services) füttern

---

## Block 1: Vertrauens-Features

Alle drei Features kommen automatisch über AS24 — der Händler lädt Inhalte in AutoScout24 hoch, sie erscheinen automatisch auf der Website.

### 1.1 Datenschicht (AS24 + Vehicle)

**Neue Felder in `AS24Listing` (lib/as24.ts):**
```ts
panorama?:      { uri: string };   // 360°-Equirectangular-Foto (TODO: Feldname gegen API verifizieren)
video?:         { uri: string };   // YouTube / Vimeo URL (TODO: Feldname gegen API verifizieren)
cardossierUrl?: string;            // cardossier.ch Report-Link (TODO: Feldname gegen API verifizieren)
```

**Neue Felder in `Vehicle` (lib/vehicles.ts):**
```ts
imageUrl360?:   string;
videoUrl?:      string;
cardossierUrl?: string;
```

**Erweiterung `mapAS24ToVehicle` (lib/as24.ts):**
```ts
imageUrl360:   listing.panorama?.uri,
videoUrl:      listing.video?.uri,
cardossierUrl: listing.cardossierUrl,
```

**Dummy-Daten (lib/vehicles.ts):** Ein Dummy-Fahrzeug erhält Beispielwerte für alle 3 Felder zum Testen.

### 1.2 360°-Ansichten

**Dateien:**
- Create: `components/vehicles/View360.tsx`

**Komponente:**
```tsx
// Lazy-loaded — kein Performance-Impact beim Seitenaufruf
import ReactPannellum from "react-pannellum";

export default function View360({ src }: { src: string }) {
  return (
    <ReactPannellum
      id="view360"
      sceneId="scene1"
      imageSource={src}
      style={{ height: 400, borderRadius: 12 }}
      config={{ autoLoad: true, showControls: true }}
    />
  );
}
```

**VDP-Integration (`app/[locale]/autos/[id]/page.tsx`):**
- Neuer Tab "360°" neben dem Foto-Slider, nur sichtbar wenn `vehicle.imageUrl360` gesetzt
- Tab-Logik als Client-Component

### 1.3 Video-Walkarounds

**Dateien:**
- Create: `components/vehicles/VideoWalkaround.tsx`

**Komponente:**
```tsx
// YouTube und Vimeo automatisch erkennen
function getEmbedUrl(url: string): string {
  // youtube.com/watch?v=ID → youtube-nocookie.com/embed/ID
  // youtu.be/ID → youtube-nocookie.com/embed/ID
  // vimeo.com/ID → player.vimeo.com/video/ID
}

export default function VideoWalkaround({ url }: { url: string }) {
  return (
    <div className="aspect-video rounded-xl overflow-hidden">
      <iframe src={getEmbedUrl(url)} className="w-full h-full" allowFullScreen />
    </div>
  );
}
```

**VDP-Integration:** Unter der Foto-Galerie, nur sichtbar wenn `vehicle.videoUrl` gesetzt.

### 1.4 Cardossier-Integration

**Kein eigenes Component** — direkt in der VDP Preis-Card:

```tsx
{vehicle.cardossierUrl && (
  <a
    href={vehicle.cardossierUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 text-sm text-ct-cyan hover:underline"
  >
    <FileText size={14} /> Cardossier ansehen
  </a>
)}
```

---

## Block 2: KI & Automatisierung

### 2.1 KI-Chatbot

**Dateien:**
- Create: `app/api/chat/route.ts`
- Create: `components/ui/ChatWidget.tsx`
- Modify: `app/[locale]/layout.tsx` — ChatWidget global einbinden

**Backend (`app/api/chat/route.ts`):**
```ts
// POST: { messages: { role, content }[], vehicleId?: number }
// Streamt Antwort via Claude API
// System-Prompt enthält: Händlerinfos, aktueller Fahrzeugbestand (kompakt), Öffnungszeiten
// Modell: claude-haiku-4-5 (günstig, schnell für Chat)
```

**Frontend (`components/ui/ChatWidget.tsx`):**
- Floating Button unten rechts (oberhalb CompareBar wenn aktiv)
- Chat-Panel öffnet sich bei Klick
- Streaming-Antworten mit Cursor-Animation
- Auf VDP: Vehicle-Kontext automatisch im System-Prompt

**Kontext für den Chat:**
```
Du bist Kundenberater für Car Trade24 GmbH in [Ort].
Fahrzeugbestand (kompakt): [make, model, price, id] für alle Fahrzeuge.
Öffnungszeiten: ...
Services: Probefahrt, Reservierung, Inzahlungnahme, Home Delivery, Zulassungsservice.
Antworte auf Deutsch, kurz und hilfreich.
```

### 2.2 KI-SEO

**Dateien:**
- Modify: `lib/ai.ts` — neue Funktion `generateVehicleMeta(vehicle)`
- Modify: `app/[locale]/autos/[id]/page.tsx` — JSON-LD + verbesserte Meta-Description

**Neue Funktion:**
```ts
export async function generateVehicleMeta(vehicle: Vehicle): Promise<{
  description: string;
  keywords: string[];
}> {
  // Generiert SEO-optimierte Meta-Description (max 155 Zeichen)
  // und relevante Keywords aus Fahrzeugdaten
}
```

**JSON-LD Schema (`app/[locale]/autos/[id]/page.tsx`):**
```tsx
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `${vehicle.make} ${vehicle.model}`,
  "description": vehicle.salespitch,
  "offers": {
    "@type": "Offer",
    "price": vehicle.price,
    "priceCurrency": "CHF",
    "availability": isReserved ? "SoldOut" : "InStock",
  },
  "image": vehicle.images,
})}</script>
```

JSON-LD wird server-seitig gerendert — kein API-Call zur Laufzeit.

### 2.3 Personalisierung

**Dateien:**
- Create: `components/vehicles/RecentlyViewed.tsx`
- Create: `components/vehicles/SimilarVehicles.tsx`
- Create: `lib/recently-viewed.ts`
- Modify: `app/[locale]/page.tsx` — RecentlyViewed-Block
- Modify: `app/[locale]/autos/[id]/page.tsx` — SimilarVehicles-Block

**lib/recently-viewed.ts:**
```ts
const KEY = "ct24_recently_viewed";
const MAX = 5;

export function addRecentlyViewed(id: number): void { /* localStorage */ }
export function getRecentlyViewed(): number[] { /* localStorage */ }
```

**SimilarVehicles-Logik:**
```ts
// Gleiche Karosserie (body) ODER gleicher Treibstoff,
// Preis ±30%, max 3 Fahrzeuge, exkl. aktuelles Fahrzeug
```

**RecentlyViewed:** Client-Component, rendert max. 5 VehicleCards aus `getRecentlyViewed()`-IDs.

---

## Block 3: Service & Logistik (MVP)

Alle 4 Features folgen demselben Muster: Info-Seite + Kontaktformular → bestehende `/api/contact`-Route mit `subject`-Feld.

### Dateien

| Route | Page-File | Subject |
|-------|-----------|---------|
| `/probefahrt` | `app/[locale]/probefahrt/page.tsx` | `"Probefahrtanfrage"` |
| `/zulassungsservice` | `app/[locale]/zulassungsservice/page.tsx` | `"Zulassungsservice"` |
| `/home-delivery` | `app/[locale]/home-delivery/page.tsx` | `"Home Delivery"` |
| `/fahrzeug-sourcing` | `app/[locale]/fahrzeug-sourcing/page.tsx` | `"Fahrzeug-Sourcing"` |

### Gemeinsames Seiten-Muster

```tsx
// Struktur jeder Service-Seite:
// 1. Hero: Icon + Titel + 1-Satz-Beschreibung
// 2. Vorteile: 3 Bullet-Points mit Icons
// 3. Kontaktformular: Name, E-Mail, Telefon, Nachricht, [Fahrzeug optional]
// 4. Submit → POST /api/contact mit subject
```

### Navigation

- `components/layout/Footer.tsx` — neue Sektion "Services" mit Links zu allen 4 Seiten
- `app/[locale]/page.tsx` — Teaser-Block "Unsere Services" (analog zum Inzahlungnahme-Teaser)

---

## Block 4: Marktpositionierung

### 4.1 Marktpreisvergleich

**Dateien:**
- Create: `components/vehicles/PriceComparison.tsx`
- Modify: `app/[locale]/autos/[id]/page.tsx` — PriceComparison einbinden

**Datenquelle:** Eurotax `getValuation()` (lib/eurotax.ts) bereits vorhanden.

**Logik:**
```ts
// Auf VDP: getValuation(vehicle.vin ?? "", vehicle.mileage, "Gut")
// → { min, max, currency }
// Parallel zu fetchVehicles() via Promise.all
```

**Komponente:**
```tsx
// Horizontaler Balken:
// Markt: CHF 28'000 ─────[●]────────── CHF 36'000
//                         ↑
//                  Unser Preis: CHF 33'900
//
// "X % unter Marktdurchschnitt" oder "Im Marktbereich"
```

Demo-Fallback wenn kein `EUROTAX_API_KEY` gesetzt (gleiche Strategie wie Trade-In).

### 4.2 E-Signatur (Skribble)

**Dateien:**
- Create: `lib/skribble.ts`
- Create: `app/api/signature/route.ts`
- Modify: `.env.local` — neue Keys

**Neue Env-Variablen:**
```bash
SKRIBBLE_USERNAME=user@cartrade24.ch
SKRIBBLE_API_KEY=...
```

**lib/skribble.ts:**
```ts
const BASE = "https://api.skribble.com/v1";

export async function createSignatureRequest(params: {
  title: string;
  pdfBase64: string;
  signerEmail: string;
  signerName: string;
}): Promise<{ signingUrl: string; documentId: string }> {
  // POST /signature-requests
  // Auth: Basic base64(username:api_key)
}
```

**`/api/signature/route.ts` (POST):**
```ts
// Body: { vehicleId, pdfBase64, customerEmail, customerName }
// Auth: nur vom Dealer aufrufbar (CRON_SECRET Header oder Admin-Key)
// 1. createSignatureRequest() aufrufen
// 2. Resend: E-Mail an Kunden mit signingUrl
// 3. Resend: Bestätigungs-E-Mail an Händler
// Antwort: { documentId, signingUrl }
```

**Dealer-Workflow:**
1. Reservierung bestätigt (Stripe Webhook)
2. Händler erstellt Kaufvertrag als PDF
3. POST `/api/signature` mit PDF (base64) + Kunden-E-Mail
4. Kunde erhält Skribble-E-Mail zum Unterzeichnen
5. Skribble Webhook (optional Phase 4): Benachrichtigung bei Unterzeichnung

---

## Dateienübersicht

### Neue Dateien
```
lib/skribble.ts
lib/recently-viewed.ts
app/api/chat/route.ts
app/api/signature/route.ts
app/[locale]/probefahrt/page.tsx
app/[locale]/zulassungsservice/page.tsx
app/[locale]/home-delivery/page.tsx
app/[locale]/fahrzeug-sourcing/page.tsx
components/vehicles/View360.tsx
components/vehicles/VideoWalkaround.tsx
components/vehicles/SimilarVehicles.tsx
components/vehicles/RecentlyViewed.tsx
components/vehicles/PriceComparison.tsx
components/ui/ChatWidget.tsx
```

### Modifizierte Dateien
```
lib/as24.ts              — AS24Listing + mapAS24ToVehicle (3 neue Felder)
lib/vehicles.ts          — Vehicle interface (3 neue Felder + Dummy-Daten)
lib/ai.ts                — generateVehicleMeta() hinzufügen
app/[locale]/autos/[id]/page.tsx — 360°, Video, Cardossier, PriceComparison, SimilarVehicles, JSON-LD
app/[locale]/layout.tsx  — ChatWidget global
app/[locale]/page.tsx    — RecentlyViewed + Services-Teaser
components/layout/Footer.tsx — Services-Links
.env.local               — SKRIBBLE_USERNAME, SKRIBBLE_API_KEY
```

---

## Erwartete Business-Wirkung (Phase 3)

| Feature | Erwartete Wirkung |
|---------|-------------------|
| 360°-Ansichten | Vertrauen ↑, Rückfragen ↓, Online-Conversion ↑ |
| Video-Walkarounds | Verweildauer ↑, emotionale Bindung ↑ |
| Cardossier | Vertrauen ↑, Einwände vor Besuch ↓ |
| KI-Chatbot | 24/7 Erreichbarkeit, Leadqualität ↑ |
| KI-SEO | Organischer Traffic ↑, bessere SERP-Position |
| Personalisierung | Wiederkehrerrate ↑, Seitentiefe ↑ |
| Self-Service-Probefahrt | Mehr Probefahrt-Leads |
| Zulassungsservice | Zusatzservice-Umsatz |
| Home Delivery | Reichweite über Region hinaus |
| Fahrzeug-Sourcing | Neue Lead-Kategorie (Nachfrage vor Angebot) |
| Marktpreisvergleich | Preisvertrauen ↑, Verhandlungsdruck ↓ |
| E-Signatur | Kaufabschluss ohne physischen Besuch möglich |
