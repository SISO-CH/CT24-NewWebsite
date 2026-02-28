# Complete Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Close every gap in the cartrade24 Next.js site — wire up HeroSearch, add the missing Karosserie filter, build the 5 missing pages, deliver a real contact-form backend, and remove dead code.

**Architecture:** Next.js 16 App Router, TypeScript, Tailwind v4. Server Components for static pages, Client Components only where interactivity is needed. Contact form uses a Next.js API Route (`app/api/contact/route.ts`) + Nodemailer for SMTP. No new dependencies except `nodemailer` and `@types/nodemailer`.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind v4, Nodemailer (new), `lucide-react` (already installed)

---

## Current State (read before touching anything)

```
lib/vehicles.ts        — Vehicle interface + 4 hardcoded entries, NO `body` field
components/vehicles/
  VehicleFilter.tsx    — FilterState has no `body` key; MAKES list hardcoded
  AutosContent.tsx     — Never reads URL search params (?make=, ?body=)
components/home/
  HeroSearch.tsx       — Pushes ?make=&body= to /autos, silently ignored on arrival
hooks/useInView.ts     — Exports useInView() — NEVER imported anywhere (dead)
components/ui/FadeIn.tsx — Duplicates useInView logic inline instead of using the hook
app/
  informationen/       — MISSING (404)
  news/                — MISSING (404)
  ueber-uns/           — MISSING (404)
  agb/                 — MISSING (404)
  datenschutz/         — MISSING (404)
  api/                 — MISSING (no API routes at all)
```

---

## Design Tokens (use everywhere)

```tsx
// Colors — already in globals.css as CSS vars, also as Tailwind utilities
--ct-cyan:    #00a0e3   → bg-ct-cyan / text-ct-cyan
--ct-magenta: #e4007d   → bg-ct-magenta
--ct-dark:    #1b1b1b
--ct-light:   #f4f6f8   → bg-ct-light
--ct-green:   #009640

// Section padding (use on every new section)
className="py-16 md:py-24"

// Container (use on every new section's inner div)
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

// Page hero band (used in /autos and /kontakt — copy this pattern)
<section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
       style={{ color: "var(--ct-cyan)" }}>LABEL</p>
    <h1 className="text-4xl font-extrabold" style={{ color: "var(--ct-dark)" }}>Title</h1>
  </div>
</section>
```

---

## Task 1: Add `body` field to Vehicle interface and data

**Files:**
- Modify: `lib/vehicles.ts`

### Step 1: Add `body` to the Vehicle interface

Open `lib/vehicles.ts`. Add `body?` as an optional field to the `Vehicle` interface:

```ts
export type VehicleBody =
  | "Limousine"
  | "SUV"
  | "Kombi"
  | "Cabriolet"
  | "Van"
  | "Coupé";

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  variant: string;
  year: number;
  mileage: number;
  power: number;
  transmission: string;
  leasingPrice: number;
  price: number;
  badge?: string;
  fuel?: string;
  image: string;
  energyLabel?: EnergyLabel;
  body?: VehicleBody;       // ← NEW
}
```

### Step 2: Add `body` to each vehicle entry

```ts
export const vehicles: Vehicle[] = [
  { id: 1, /* existing fields... */ body: "Kombi" },
  { id: 2, /* existing fields... */ body: "SUV"   },
  { id: 3, /* existing fields... */ body: "SUV"   },
  { id: 4, /* existing fields... */ body: "SUV"   },
];
```

### Step 3: Type-check

```bash
cd /root/cartrade24
npx tsc --noEmit
```

Expected: **no errors**. If errors appear, they are in files that destructure `Vehicle` — fix them.

### Step 4: Commit

```bash
git add lib/vehicles.ts
git commit -m "feat: add body/Karosserie field to Vehicle interface and sample data"
```

---

## Task 2: Add Karosserie filter to VehicleFilter + AutosContent

**Files:**
- Modify: `components/vehicles/VehicleFilter.tsx`
- Modify: `components/vehicles/AutosContent.tsx`

### Step 1: Extend FilterState in AutosContent

Open `components/vehicles/AutosContent.tsx`. Find the `FilterState` type and add `body`:

```ts
type FilterState = {
  search:   string;
  make:     string;
  priceMax: string;
  body:     string;   // ← NEW (empty string = "Alle Karosserien")
};
```

Update the initial state:
```ts
const [filters, setFilters] = useState<FilterState>({
  search:   "",
  make:     "Alle Marken",
  priceMax: "",
  body:     "",         // ← NEW
});
```

Update the `useMemo` filter logic — add a body condition after the existing ones:

```ts
const filtered = useMemo(() => {
  return vehicles.filter((v) => {
    // existing conditions...
    if (filters.body && v.body !== filters.body) return false;  // ← NEW
    return true;
  });
}, [filters]);
```

Pass `body` + `onBodyChange` down to `<VehicleFilter>`:

```tsx
<VehicleFilter
  filters={filters}
  onChange={setFilters}
/>
```

*(The component already receives the full `filters` object and `onChange` — no prop interface change needed if VehicleFilter accepts `filters: FilterState`.)*

### Step 2: Add Karosserie dropdown to VehicleFilter

Open `components/vehicles/VehicleFilter.tsx`. Import `VehicleBody` from `lib/vehicles`:

```ts
import type { VehicleBody } from "@/lib/vehicles";
```

Add the `BODIES` constant (same list as HeroSearch):

```ts
const BODIES: VehicleBody[] = [
  "Cabriolet", "Coupé", "Kombi", "Limousine", "SUV", "Van",
];
```

Add the `body` select **right after** the Marke select, inside the filter bar:

```tsx
<select
  value={filters.body}
  onChange={(e) => onChange({ ...filters, body: e.target.value })}
  className="px-3 py-2 rounded-lg border border-[#e5e7eb] text-sm bg-white
             text-[#374151] focus:outline-none focus:border-[#00a0e3] cursor-pointer"
>
  <option value="">Alle Karosserien</option>
  {BODIES.map((b) => (
    <option key={b} value={b}>{b}</option>
  ))}
</select>
```

Also update the reset button to clear `body`:

```tsx
onClick={() => onChange({ search: "", make: "Alle Marken", priceMax: "", body: "" })}
```

### Step 3: Type-check

```bash
npx tsc --noEmit
```

Expected: **no errors**.

### Step 4: Browser verify

Open `http://localhost:3000/autos`. The filter bar should now show four controls: Textsuche, Marke, Karosserie, Preis. Selecting "SUV" should show only the Range Rover, Kona, and T-Roc. Selecting "Kombi" should show only the Golf Variant.

### Step 5: Commit

```bash
git add components/vehicles/VehicleFilter.tsx components/vehicles/AutosContent.tsx
git commit -m "feat: add Karosserie/body filter to vehicle list"
```

---

## Task 3: Wire HeroSearch URL params into AutosContent

**Files:**
- Modify: `app/autos/page.tsx`
- Modify: `components/vehicles/AutosContent.tsx`

### Step 1: Read searchParams in the autos page

Open `app/autos/page.tsx`. It's a Server Component. Add `searchParams` prop:

```tsx
// app/autos/page.tsx
export default async function AutosPage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; body?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {/* existing hero band... */}
      <AutosContent initialMake={params.make ?? ""} initialBody={params.body ?? ""} />
    </>
  );
}
```

### Step 2: Accept initial values as props in AutosContent

Open `components/vehicles/AutosContent.tsx`. The component is a Client Component (`"use client"`). Add props:

```tsx
interface AutosContentProps {
  initialMake?: string;
  initialBody?: string;
}

export default function AutosContent({
  initialMake = "",
  initialBody = "",
}: AutosContentProps) {

  const [filters, setFilters] = useState<FilterState>({
    search:   "",
    make:     initialMake || "Alle Marken",
    priceMax: "",
    body:     initialBody,
  });
  // rest unchanged
}
```

### Step 3: Type-check

```bash
npx tsc --noEmit
```

Expected: **no errors**.

### Step 4: Browser verify — end-to-end flow

1. Go to `http://localhost:3000`
2. In the HeroSearch, choose **Marke: VW**, click **Fahrzeuge suchen**
3. You should land on `/autos?make=VW`
4. The Marke dropdown should be pre-selected to **VW** and only VW vehicles visible

Also test with body:
1. Go to `http://localhost:3000/autos?body=SUV` directly
2. Karosserie dropdown should show **SUV** pre-selected, only SUV vehicles visible

### Step 5: Commit

```bash
git add app/autos/page.tsx components/vehicles/AutosContent.tsx
git commit -m "feat: wire HeroSearch URL params into autos page filter"
```

---

## Task 4: Build /ueber-uns page

**Files:**
- Create: `app/ueber-uns/page.tsx`

### Step 1: Create the page file

```tsx
// app/ueber-uns/page.tsx
import type { Metadata } from "next";
import { Award, Users, MapPin, CalendarCheck } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Car Trade24 GmbH – Ihr vertrauenswürdiger Autohandel in Wohlen (Aargau) seit über 26 Jahren.",
};

const stats = [
  { icon: CalendarCheck, value: "26+",    label: "Jahre Erfahrung"      },
  { icon: Users,         value: "5000+",  label: "Zufriedene Kunden"    },
  { icon: Award,         value: "7",      label: "Jahre Garantie"        },
  { icon: MapPin,        value: "50–80",  label: "Fahrzeuge an Lager"   },
];

const values = [
  {
    title: "Transparenz",
    desc:  "Ehrliche Preise, keine versteckten Kosten. Was Sie sehen, ist was Sie zahlen.",
  },
  {
    title: "Qualität",
    desc:  "Jedes Fahrzeug wird von unseren Experten gründlich geprüft bevor es den Hof verlässt.",
  },
  {
    title: "Nähe",
    desc:  "Persönliche Beratung in Wohlen oder schweizweite Lieferung direkt zu Ihnen.",
  },
];

export default function UeberUnsPage() {
  return (
    <>
      {/* Hero band */}
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>
            Wer wir sind
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>
            Über uns
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Car Trade24 GmbH – Ihr fairer Autohandel in Wohlen (Aargau) seit über 26 Jahren.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white py-12 border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <FadeIn key={s.label}>
                <div className="text-center">
                  <s.icon size={28} className="mx-auto mb-3" style={{ color: "var(--ct-cyan)" }} />
                  <p className="text-3xl font-black" style={{ color: "var(--ct-dark)" }}>{s.value}</p>
                  <p className="text-sm text-[#6b7280] mt-1">{s.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Unsere Geschichte</p>
              <h2 className="text-3xl font-extrabold mb-5" style={{ color: "var(--ct-dark)" }}>
                Seit 1998 in Wohlen
              </h2>
              <div className="space-y-4 text-[#4b5563] leading-relaxed text-sm">
                <p>
                  Car Trade24 GmbH wurde mit einer klaren Vision gegründet: Fahrzeugkauf soll fair,
                  transparent und ohne Druck ablaufen. Aus einem kleinen Betrieb in Wohlen ist über
                  die Jahre einer der verlässlichsten Occasionshändler im Aargau entstanden.
                </p>
                <p>
                  Heute bieten wir 50 bis 80 geprüfte Fahrzeuge – Occasionen und Neuwagen – aus
                  allen Segmenten. Jedes Auto wird von unserem Team eingehend geprüft, aufbereitet
                  und mit bis zu 7 Jahren Garantie ausgeliefert.
                </p>
                <p>
                  Wir liefern schweizweit – bis zu 50 km kostenlos – und nehmen Ihr Altfahrzeug
                  zu fairen Konditionen in Zahlung.
                </p>
              </div>
              <Link
                href="/kontakt"
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white
                           text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                Kontakt aufnehmen <ArrowRight size={15} />
              </Link>
            </FadeIn>

            {/* Values */}
            <FadeIn delay={150}>
              <div className="space-y-5">
                {values.map((v) => (
                  <div key={v.title}
                       className="flex gap-4 p-5 rounded-xl border border-[#f0f0f0]
                                  shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <div className="w-2 rounded-full flex-shrink-0"
                         style={{ backgroundColor: "var(--ct-cyan)" }} />
                    <div>
                      <h3 className="font-bold text-sm mb-1" style={{ color: "var(--ct-dark)" }}>
                        {v.title}
                      </h3>
                      <p className="text-[#6b7280] text-sm leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
```

### Step 2: Type-check

```bash
npx tsc --noEmit
```

Expected: **no errors**.

### Step 3: Browser verify

Navigate to `http://localhost:3000/ueber-uns`. Expect: hero band, 4 stats, 2-column story/values section. No 404, no console errors.

### Step 4: Commit

```bash
git add app/ueber-uns/page.tsx
git commit -m "feat: add /ueber-uns page"
```

---

## Task 5: Build /informationen page

**Files:**
- Create: `app/informationen/page.tsx`

### Step 1: Create the page file

```tsx
// app/informationen/page.tsx
import type { Metadata } from "next";
import { Shield, Truck, Handshake, CreditCard, Wrench, FileCheck } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Informationen",
  description:
    "Alles was Sie über Garantie, Lieferung, Finanzierung und Fahrzeugankauf bei Car Trade24 wissen müssen.",
};

const topics = [
  {
    icon: Shield,
    title: "Bis zu 7 Jahre Garantie",
    body: "Jedes Fahrzeug ab unserem Hof wird mit einer flexiblen Garantie geliefert. Die Laufzeit wählen Sie selbst – von 1 bis zu 7 Jahren. Die Garantie deckt Motor, Getriebe, Antrieb und Elektronik ab.",
  },
  {
    icon: Truck,
    title: "Schweizweite Heimlieferung",
    body: "Kein Zeitaufwand für die Abholung: Wir liefern Ihr neues Fahrzeug direkt vor die Haustür. Bis 50 km Entfernung ist die Lieferung kostenlos. Darüber hinaus vereinbaren wir eine faire Pauschale.",
  },
  {
    icon: Handshake,
    title: "Fairer Fahrzeugeintausch",
    body: "Haben Sie ein Fahrzeug in Zahlung zu geben? Wir bewerten Ihr Auto transparent und ohne Druck. Sie erhalten ein schriftliches Angebot – unverbindlich und kostenfrei.",
  },
  {
    icon: CreditCard,
    title: "Finanzierung & Leasing",
    body: "Wir vermitteln attraktive Finanzierungs- und Leasinglösungen für alle Fahrzeuge. Auf Wunsch berechnen wir Ihre monatliche Rate direkt bei der Besichtigung.",
  },
  {
    icon: Wrench,
    title: "ASTRA-Grossimporteur",
    body: "Car Trade24 ist vom ASTRA als Grossimporteur zugelassen. Das bedeutet: strenge Qualitätsstandards, regelmässige Kontrollen und volle Transparenz bei Herkunft und Zustand der Fahrzeuge.",
  },
  {
    icon: FileCheck,
    title: "Geprüfte Fahrzeuge",
    body: "Jedes Occasionsfahrzeug durchläuft vor dem Verkauf eine umfassende Prüfung durch unser qualifiziertes Team. Technische Mängel werden behoben, der Innenraum professionell aufbereitet.",
  },
];

export default function InformationenPage() {
  return (
    <>
      {/* Hero band */}
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>
            Alles was Sie wissen müssen
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>
            Informationen
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Garantie, Lieferung, Finanzierung, Eintausch – hier finden Sie alle Antworten.
          </p>
        </div>
      </section>

      {/* Topic cards */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((t, i) => (
              <FadeIn key={t.title} delay={i * 80}>
                <div className="h-full flex flex-col p-6 rounded-xl border border-[#f0f0f0]
                                shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <t.icon size={28} className="mb-4" style={{ color: "var(--ct-cyan)" }} />
                  <h2 className="font-bold text-base mb-2" style={{ color: "var(--ct-dark)" }}>
                    {t.title}
                  </h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed flex-1">{t.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

### Step 2: Type-check + browser verify

```bash
npx tsc --noEmit
```

Navigate to `http://localhost:3000/informationen`. Expect: hero band, 6 info cards in 3-col grid.

### Step 3: Commit

```bash
git add app/informationen/page.tsx
git commit -m "feat: add /informationen page"
```

---

## Task 6: Build /news page

**Files:**
- Create: `app/news/page.tsx`

### Step 1: Create the page file

```tsx
// app/news/page.tsx
import type { Metadata } from "next";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "News",
  description: "Aktuelle News, neue Fahrzeuge und Angebote von Car Trade24 GmbH.",
};

const articles = [
  {
    date: "Februar 2026",
    category: "Neuzugang",
    title: "Hyundai Kona EV – frisch eingetroffen",
    excerpt:
      "Unser neuster Elektro-Zugang: der Hyundai Kona EV mit 65.4 kWh Batterie und über 450 km WLTP-Reichweite. Energieeffizienz A, nur 11'500 km, Toppreis.",
  },
  {
    date: "Januar 2026",
    category: "Angebot",
    title: "Winter-Aktion: 30% Rabatt auf den Range Rover Evoque",
    excerpt:
      "Nur für kurze Zeit: Der Land Rover Range Rover Evoque zum Sonderpreis von CHF 38'900. Gepflegt, Automatik, Benzin, Energieeffizienz E.",
  },
  {
    date: "Dezember 2025",
    category: "Unternehmen",
    title: "Car Trade24 feiert 26 Jahre – Danke für Ihr Vertrauen",
    excerpt:
      "Seit 1998 sind wir Ihr verlässlicher Partner für Occasionen in der Schweiz. Wir bedanken uns herzlich bei all unseren Kundinnen und Kunden.",
  },
];

export default function NewsPage() {
  return (
    <>
      {/* Hero band */}
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>
            Aktuelles
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>
            News & Angebote
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Neue Fahrzeuge, Aktionen und Neuigkeiten aus dem Car Trade24 Betrieb.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-8">
            {articles.map((a, i) => (
              <FadeIn key={a.title} delay={i * 80}>
                <article className="border border-[#f0f0f0] rounded-xl p-6
                                    shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-0.5 text-[0.7rem] font-semibold rounded
                                     uppercase tracking-wide text-white"
                          style={{ backgroundColor: "var(--ct-cyan)" }}>
                      {a.category}
                    </span>
                    <span className="text-[#9ca3af] text-xs">{a.date}</span>
                  </div>
                  <h2 className="font-bold text-lg mb-2" style={{ color: "var(--ct-dark)" }}>
                    {a.title}
                  </h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{a.excerpt}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

### Step 2: Type-check + browser verify

```bash
npx tsc --noEmit
```

Navigate to `http://localhost:3000/news`. Expect: hero band, 3 article cards.

### Step 3: Commit

```bash
git add app/news/page.tsx
git commit -m "feat: add /news page with placeholder articles"
```

---

## Task 7: Build /agb and /datenschutz pages

**Files:**
- Create: `app/agb/page.tsx`
- Create: `app/datenschutz/page.tsx`

These are static legal pages. Both follow the same structure: hero band + prose content.

### Step 1: Create /agb

```tsx
// app/agb/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen der Car Trade24 GmbH.",
};

export default function AgbPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Rechtliches</p>
          <h1 className="text-4xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
            Allgemeine Geschäftsbedingungen
          </h1>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-sm max-w-none">
          <p className="text-[#6b7280] text-sm mb-8">
            Stand: Januar 2026 · Car Trade24 GmbH, Ringstrasse 26, 5610 Wohlen
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            1. Geltungsbereich
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
            Car Trade24 GmbH (nachfolgend „Verkäufer") und dem Käufer über den Kauf von
            Gebraucht- und Neufahrzeugen sowie damit zusammenhängende Dienstleistungen.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            2. Vertragsschluss
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Kaufangebote des Verkäufers sind freibleibend. Ein bindender Vertrag kommt erst
            mit der schriftlichen Auftragsbestätigung oder der Übergabe des Fahrzeugs zustande.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            3. Preise und Zahlung
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Alle Preisangaben sind in CHF inkl. MWST. Die vollständige Kaufsumme ist vor
            Fahrzeugübergabe zu begleichen – bar, per Banküberweisung oder Finanzierung.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            4. Garantie
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Gewährleistungsrechte richten sich nach dem schweizerischen Obligationenrecht (OR).
            Zusätzliche Garantieleistungen werden im Kaufvertrag schriftlich vereinbart.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            5. Gerichtsstand
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed">
            Gerichtsstand ist Wohlen (AG). Es gilt ausschliesslich schweizerisches Recht.
          </p>
        </div>
      </section>
    </>
  );
}
```

### Step 2: Create /datenschutz

```tsx
// app/datenschutz/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung der Car Trade24 GmbH gemäss revDSG.",
};

export default function DatenschutzPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Rechtliches</p>
          <h1 className="text-4xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
            Datenschutzerklärung
          </h1>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#6b7280] text-sm mb-8">
            Stand: Januar 2026 · Gemäss revDSG (Schweiz)
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            1. Verantwortliche Stelle
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Car Trade24 GmbH, Ringstrasse 26, 5610 Wohlen · info@cartrade24.ch
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            2. Erhobene Daten
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Beim Ausfüllen des Kontaktformulars erheben wir: Name, E-Mail-Adresse, Telefonnummer
            (freiwillig) und den Nachrichtentext. Diese Daten werden ausschliesslich zur
            Bearbeitung Ihrer Anfrage verwendet.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            3. Datenweitergabe
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Ihre Daten werden nicht an Dritte weitergegeben. Es findet kein Verkauf von
            Personendaten statt.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            4. Aufbewahrung
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed mb-4">
            Kontaktanfragen werden nach vollständiger Bearbeitung gelöscht, spätestens
            nach 12 Monaten.
          </p>

          <h2 className="text-lg font-bold mt-8 mb-3" style={{ color: "var(--ct-dark)" }}>
            5. Ihre Rechte
          </h2>
          <p className="text-[#4b5563] text-sm leading-relaxed">
            Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten.
            Anfragen richten Sie bitte an info@cartrade24.ch.
          </p>
        </div>
      </section>
    </>
  );
}
```

### Step 3: Type-check + browser verify

```bash
npx tsc --noEmit
```

Visit `http://localhost:3000/agb` and `http://localhost:3000/datenschutz`. Both must render without 404.

### Step 4: Commit

```bash
git add app/agb/page.tsx app/datenschutz/page.tsx
git commit -m "feat: add /agb and /datenschutz static legal pages"
```

---

## Task 8: Real contact-form backend (API route + Nodemailer)

**Files:**
- Create: `.env.local` (config, never committed)
- Create: `.env.example` (committed, no secrets)
- Modify: `.gitignore` (ensure `.env.local` is ignored)
- Create: `app/api/contact/route.ts`
- Modify: `components/contact/ContactContent.tsx`

### Step 1: Install Nodemailer

```bash
cd /root/cartrade24
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Step 2: Create .env.example

Create the file at the project root:

```bash
# .env.example — copy to .env.local and fill in your SMTP credentials
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
CONTACT_TO=info@cartrade24.ch
```

### Step 3: Create .env.local (local dev only)

```bash
# .env.local — fill with real values or use Mailtrap for testing
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=<your-mailtrap-user>
SMTP_PASS=<your-mailtrap-pass>
CONTACT_TO=info@cartrade24.ch
```

> **Tip for testing without a real SMTP:** Create a free [Mailtrap](https://mailtrap.io) account. It catches all outgoing emails safely — nothing reaches a real inbox.

### Step 4: Verify .gitignore already ignores .env.local

Open `.gitignore`. It should contain `.env*.local` or `.env.local`. The default Next.js `.gitignore` already has this. If not, add:
```
.env.local
```

### Step 5: Create the API route

```ts
// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, subject, message } = body;

  // Basic validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, E-Mail und Nachricht sind Pflichtfelder." },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from:    `"Car Trade24 Website" <${process.env.SMTP_USER}>`,
    to:      process.env.CONTACT_TO,
    replyTo: email,
    subject: `Kontaktanfrage: ${subject ?? "Allgemein"} – ${name}`,
    text: [
      `Name:    ${name}`,
      `E-Mail:  ${email}`,
      `Telefon: ${phone || "–"}`,
      `Betreff: ${subject || "–"}`,
      "",
      message,
    ].join("\n"),
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>E-Mail:</strong> ${email}</p>
      <p><strong>Telefon:</strong> ${phone || "–"}</p>
      <p><strong>Betreff:</strong> ${subject || "–"}</p>
      <hr/>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
```

### Step 6: Update ContactContent to call the real API

Open `components/contact/ContactContent.tsx`. Find `handleSubmit`. Replace the fake timeout:

```ts
// BEFORE (fake):
await new Promise((r) => setTimeout(r, 900));
setSubmitted(true);

// AFTER (real):
const res = await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, phone, subject, message }),
});
if (!res.ok) {
  const data = await res.json();
  throw new Error(data.error ?? "Unbekannter Fehler");
}
setSubmitted(true);
```

Also add error state display. Find where `setLoading(false)` is called after an error, and show the error message to the user:

```ts
// In the catch block, add:
setError(err instanceof Error ? err.message : "Fehler beim Senden.");
```

Add `error` state + display. In the `useState` block at the top of `ContactContent`:
```ts
const [error, setError] = useState("");
```

In the JSX, after the form `<button>` add:
```tsx
{error && (
  <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
)}
```

### Step 7: Type-check

```bash
npx tsc --noEmit
```

Expected: **no errors**.

### Step 8: Manual test with curl

With the dev server running:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hallo"}'
```

Expected: `{"ok":true}` (or an SMTP error if `.env.local` is not configured — that's fine, it means the route is wired up and just needs valid SMTP credentials).

### Step 9: Browser test

1. Go to `http://localhost:3000/kontakt`
2. Fill all required fields
3. Click "Senden"
4. Expect: success message shown, no JS console errors

### Step 10: Commit

```bash
git add app/api/contact/route.ts components/contact/ContactContent.tsx \
        .env.example package.json package-lock.json
git commit -m "feat: real contact form API route with Nodemailer SMTP"
```

---

## Task 9: Clean up — make FadeIn use useInView hook

**Files:**
- Modify: `components/ui/FadeIn.tsx`

The `hooks/useInView.ts` exports an `IntersectionObserver` hook that is never used. `FadeIn.tsx` contains the exact same logic inline. Fix this by having `FadeIn` use the hook.

### Step 1: Update FadeIn.tsx

```tsx
// components/ui/FadeIn.tsx
"use client";
import { useInView } from "@/hooks/useInView";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "none";
}

export default function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: FadeInProps) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform:
          direction === "up"
            ? inView ? "translateY(0)" : "translateY(24px)"
            : "none",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
```

> Note: `useInView` in `hooks/useInView.ts` uses `useRef<HTMLDivElement>`. Make sure it returns `{ ref, inView }` where `ref` is typed as `RefObject<HTMLDivElement>`. The current implementation in `hooks/useInView.ts` already does this.

### Step 2: Type-check

```bash
npx tsc --noEmit
```

Expected: **no errors**.

### Step 3: Browser verify

Open any page with scroll animations (`http://localhost:3000`). Scroll down — sections should still fade in correctly.

### Step 4: Commit

```bash
git add components/ui/FadeIn.tsx
git commit -m "refactor: FadeIn uses useInView hook instead of duplicating IO logic"
```

---

## Completion Checklist

After all tasks are done, verify:

- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `http://localhost:3000/ueber-uns` → renders, no 404
- [ ] `http://localhost:3000/informationen` → renders, no 404
- [ ] `http://localhost:3000/news` → renders, no 404
- [ ] `http://localhost:3000/agb` → renders, no 404
- [ ] `http://localhost:3000/datenschutz` → renders, no 404
- [ ] `http://localhost:3000/autos?make=VW` → VW filter pre-selected
- [ ] `http://localhost:3000/autos?body=SUV` → Karosserie filter pre-selected
- [ ] HeroSearch → Marke VW → "Fahrzeuge suchen" → `/autos` shows only VW
- [ ] Autos page Karosserie dropdown filters correctly
- [ ] Kontaktformular: `POST /api/contact` returns `{"ok":true}`
- [ ] All header nav links work (no 404)
- [ ] All footer links work (no 404)
- [ ] Scroll animations still work on homepage
