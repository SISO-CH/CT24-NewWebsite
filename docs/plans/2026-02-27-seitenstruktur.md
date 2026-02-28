# Seitenstruktur-Überarbeitung Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bestehende Navigation und Seitenstruktur bereinigen, `/informationen` auflösen, und 5 neue Konversionsseiten bauen (Finanzierung, Firmenkunden, Ankauf, Garantie, FAQ).

**Architecture:** Next.js 16 App Router, Server Components für statische Seiten, Client Components nur für Formulare und Accordion. Bestehende `/api/contact` Route wird wiederverwendet. Kein neues Backend nötig.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind v4, lucide-react, next/navigation

---

## Current State (read before touching anything)

```
components/layout/Header.tsx   — navLinks: Home, Autos, Informationen, News, Über uns, Kontakt
components/layout/Footer.tsx   — Col 2 "Fahrzeuge": tote # Links (Leasingrechner, Ankauf, B2B)
                                — Col 3 "Informationen": tote # Links (Garantie, FAQ)
app/informationen/page.tsx     — Seite mit 6 Cards, wird redirected
app/ueber-uns/page.tsx         — Hero, Stats, Story — fehlen: ASTRA + Qualitätsprozess
app/finanzierung/             — MISSING
app/firmenkunden/             — MISSING
app/ankauf/                   — MISSING
app/garantie/                 — MISSING
app/faq/                      — MISSING
components/ui/Accordion.tsx   — MISSING (wird von /garantie und /faq gebraucht)
next.config.ts                 — Hat nur images.remotePatterns, kein redirects-Array
```

## Design Tokens (überall verwenden)

```tsx
var(--ct-cyan)    = #00a0e3   → bg-ct-cyan / text-ct-cyan
var(--ct-magenta) = #e4007d   → bg-ct-magenta
var(--ct-dark)    = #1b1b1b
var(--ct-light)   = #f4f6f8   → bg-ct-light
var(--ct-green)   = #009640

// Section padding
className="py-16 md:py-24"

// Container
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

// Hero-Band pattern (oben auf jeder Seite)
<section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
       style={{ color: "var(--ct-cyan)" }}>LABEL</p>
    <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
        style={{ color: "var(--ct-dark)" }}>Titel</h1>
    <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">Subtitle</p>
  </div>
</section>

// fieldClass (alle Formularfelder)
const fieldClass =
  "w-full px-4 py-3 text-sm border border-[#e5e7eb] bg-white text-ct-text placeholder:text-[#9ca3af]" +
  " focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors rounded-sm";
```

---

## Task 1: Reusable Accordion Component

**Files:**
- Create: `components/ui/Accordion.tsx`

### Step 1: Create the component

```tsx
// components/ui/Accordion.tsx
"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  question: string;
  answer: string;
}

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[#f0f0f0] border border-[#f0f0f0] rounded-xl overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 bg-white hover:bg-ct-light transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-semibold text-sm" style={{ color: "var(--ct-dark)" }}>
              {item.question}
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
              style={{ color: "var(--ct-cyan)" }}
            />
          </button>
          <div className={`overflow-hidden transition-all duration-200 ${open === i ? "max-h-96" : "max-h-0"}`}>
            <p className="px-6 py-4 text-sm text-[#6b7280] leading-relaxed bg-white">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Step 2: Type-check

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

Expected: no errors.

---

## Task 2: Header Navigation aktualisieren

**Files:**
- Modify: `components/layout/Header.tsx`

### Step 1: navLinks Array ersetzen

Finde in `components/layout/Header.tsx` das `navLinks` Array und ersetze es:

```ts
// VORHER:
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/autos", label: "Autos" },
  { href: "/informationen", label: "Informationen" },
  { href: "/news", label: "News" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];

// NACHHER:
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/autos", label: "Autos" },
  { href: "/finanzierung", label: "Finanzierung" },
  { href: "/firmenkunden", label: "Firmenkunden" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];
```

Keine weiteren Änderungen an der Datei.

### Step 2: Type-check

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

### Step 3: Browser verify

`http://localhost:3000` → Header zeigt: Home | Autos | Finanzierung | Firmenkunden | Über uns | Kontakt

---

## Task 3: Footer Spalten aktualisieren

**Files:**
- Modify: `components/layout/Footer.tsx`

### Step 1: Spalte 2 ersetzen

Finde `{/* ── Col 2: Fahrzeuge ── */}` und ersetze den `<ul>` Inhalt:

```tsx
{/* ── Col 2: Fahrzeuge ── */}
<div>
  <ColLabel>Fahrzeuge</ColLabel>
  <ul className="space-y-2.5">
    <FooterLink href="/autos">Alle Fahrzeuge</FooterLink>
    <FooterLink href="/finanzierung">Leasing & Finanzierung</FooterLink>
    <FooterLink href="/ankauf">Fahrzeug verkaufen</FooterLink>
    <FooterLink href="/firmenkunden">Firmenkunden</FooterLink>
  </ul>
</div>
```

### Step 2: Spalte 3 ersetzen

Finde `{/* ── Col 3: Informationen ── */}` und ersetze den ganzen `<div>`:

```tsx
{/* ── Col 3: Unternehmen ── */}
<div>
  <ColLabel>Unternehmen</ColLabel>
  <ul className="space-y-2.5">
    <FooterLink href="/ueber-uns">Über uns</FooterLink>
    <FooterLink href="/garantie">Garantie</FooterLink>
    <FooterLink href="/faq">FAQ</FooterLink>
    <FooterLink href="/news">News</FooterLink>
    <FooterLink href="/agb">AGB</FooterLink>
    <FooterLink href="/datenschutz">Datenschutz</FooterLink>
  </ul>
</div>
```

### Step 3: Type-check + Browser verify

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

Footer Col 2 & 3: alle Links auf echte URLs (keine `#` mehr).

---

## Task 4: /informationen → Redirect nach /ueber-uns

**Files:**
- Modify: `next.config.ts`
- Modify: `app/informationen/page.tsx`

### Step 1: next.config.ts — redirects Array hinzufügen

Öffne `next.config.ts` und ersetze den Inhalt komplett:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.autoscout24.ch",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/informationen",
        destination: "/ueber-uns",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### Step 2: app/informationen/page.tsx — Re-Export als Fallback

Ersetze den Inhalt von `app/informationen/page.tsx` mit:

```tsx
// app/informationen/page.tsx
// Redirect is handled by next.config.ts. This is a fallback re-export.
export { default } from "@/app/ueber-uns/page";
export { metadata } from "@/app/ueber-uns/page";
```

### Step 3: Type-check + Browser verify

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

`http://localhost:3000/informationen` → Browser-URL wechselt zu `/ueber-uns`.

---

## Task 5: /ueber-uns erweitern

**Files:**
- Modify: `app/ueber-uns/page.tsx`

### Step 1: Zwei neue Sections VOR dem schliessenden `</>` einfügen

Öffne `app/ueber-uns/page.tsx`. Füge nach dem letzten `</section>` (Schlussteil der Story-Section) folgende zwei Sections ein:

```tsx
      {/* ASTRA-Zulassung */}
      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Zertifizierung</p>
              <h2 className="text-3xl font-extrabold mb-5" style={{ color: "var(--ct-dark)" }}>
                ASTRA-Grossimporteur
              </h2>
              <div className="space-y-4 text-[#4b5563] leading-relaxed text-sm">
                <p>
                  Car Trade24 ist vom Bundesamt für Strassen (ASTRA) als Grossimporteur zugelassen.
                  Diese Zulassung erfordert strenge Qualitätsstandards bei Fahrzeugherkunft,
                  Zustandsbeschreibung und Kundenkommunikation.
                </p>
                <p>
                  Regelmässige Kontrollen stellen sicher, dass unsere Prozesse den gesetzlichen
                  Anforderungen entsprechen. Für Sie: vollständige Transparenz bei jedem Fahrzeug.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "100%", label: "Transparente Herkunft" },
                  { value: "ASTRA", label: "Staatlich zugelassen" },
                  { value: "Jährlich", label: "Kontrolliert" },
                  { value: "CH", label: "Schweizer Recht" },
                ].map((item) => (
                  <div key={item.label}
                       className="p-5 rounded-xl bg-white border border-[#e5e7eb] text-center
                                  shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-2xl font-black mb-1" style={{ color: "var(--ct-cyan)" }}>
                      {item.value}
                    </p>
                    <p className="text-xs text-[#6b7280]">{item.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Qualitätsprozess */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Unser Versprechen</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                Jedes Fahrzeug geprüft
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Technische Prüfung",
                desc: "Motor, Getriebe, Elektronik, Bremsen und Fahrwerk werden vollständig geprüft und dokumentiert.",
              },
              {
                step: "02",
                title: "Aufbereitung",
                desc: "Innenraum und Karosserie werden professionell aufbereitet. Mängel werden behoben bevor das Fahrzeug auf den Hof kommt.",
              },
              {
                step: "03",
                title: "Zertifizierung",
                desc: "Jedes Fahrzeug erhält einen vollständigen Prüfbericht. Sie wissen vor dem Kauf exakt, was Sie erhalten.",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 100}>
                <div className="p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                  <p className="text-4xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {item.step}
                  </p>
                  <h3 className="font-bold text-base mb-2" style={{ color: "var(--ct-dark)" }}>
                    {item.title}
                  </h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
```

### Step 2: Type-check + Browser verify

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

`http://localhost:3000/ueber-uns` → scrolle nach unten: ASTRA-Section + Qualitätsprozess-Section sichtbar.

---

## Task 6: /finanzierung page

**Files:**
- Create: `app/finanzierung/page.tsx`

### Step 1: Erstelle die Seite

```tsx
// app/finanzierung/page.tsx
import type { Metadata } from "next";
import { CreditCard, TrendingUp, Banknote, ArrowRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leasing & Finanzierung",
  description:
    "Flexible Leasing- und Finanzierungslösungen für Ihre Occasion bei Car Trade24 in Wohlen. Günstige Konditionen, schnelle Abwicklung.",
};

const options = [
  {
    icon: Banknote,
    title: "Barkauf",
    tag: "Einfach",
    highlight: false,
    pros: ["Kein Zins, kein Aufwand", "Sofortige Eigentumsübertragung", "Maximaler Verhandlungsspielraum"],
    cons: ["Kapital gebunden"],
  },
  {
    icon: CreditCard,
    title: "Leasing",
    tag: "Beliebt",
    highlight: true,
    pros: ["Tiefe Monatsraten", "Fahrzeugwechsel nach Laufzeit", "Steuerlich absetzbar (Firma)"],
    cons: ["Kilometerabhängig", "Fahrzeug bleibt Leasingbank"],
  },
  {
    icon: TrendingUp,
    title: "Kredit",
    tag: "Flexibel",
    highlight: false,
    pros: ["Sofort Eigentümer", "Feste Monatsrate", "Laufzeit wählbar"],
    cons: ["Zinsen", "Bonitätsprüfung nötig"],
  },
];

const leasingExamples = [
  { model: "VW Golf Variant",       price: "CHF 29'500", rate: "CHF 299", duration: "48 Mt.", km: "15'000 km/J." },
  { model: "Hyundai Kona EV",       price: "CHF 37'900", rate: "CHF 399", duration: "48 Mt.", km: "15'000 km/J." },
  { model: "Land Rover Evoque",     price: "CHF 44'900", rate: "CHF 489", duration: "48 Mt.", km: "10'000 km/J." },
];

export default function FinanzierungPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Leasing & Finanzierung</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>
            Flexibel finanzieren.<br />Sofort fahren.
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Attraktive Leasing- und Finanzierungslösungen mit direktem Bankzugang —
            schnell, transparent, auf Sie zugeschnitten.
          </p>
        </div>
      </section>

      {/* 3 Optionen */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Ihre Optionen</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                3 Wege zum Traumauto
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((opt, i) => (
              <FadeIn key={opt.title} delay={i * 80}>
                <div className={`h-full flex flex-col p-6 rounded-xl border ${
                  opt.highlight
                    ? "border-[var(--ct-cyan)] shadow-[0_4px_24px_rgba(0,160,227,0.15)]"
                    : "border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <opt.icon size={24} style={{ color: "var(--ct-cyan)" }} />
                    <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      opt.highlight ? "text-white bg-ct-cyan" : "text-[#6b7280] bg-ct-light"
                    }`}>{opt.tag}</span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-4" style={{ color: "var(--ct-dark)" }}>
                    {opt.title}
                  </h3>
                  <ul className="space-y-1.5 flex-1">
                    {opt.pros.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-[#4b5563]">
                        <span className="mt-0.5" style={{ color: "var(--ct-green)" }}>✓</span> {p}
                      </li>
                    ))}
                    {opt.cons.map((c) => (
                      <li key={c} className="flex items-start gap-2 text-sm text-[#9ca3af]">
                        <span className="mt-0.5">–</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Leasing-Tabelle */}
      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Beispielrechnungen</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                Leasing im Detail
              </h2>
              <p className="text-[#6b7280] text-sm mt-2">
                Unverbindliche Richtwerte — individuelle Offerte auf Anfrage.
              </p>
            </div>
          </FadeIn>
          <div className="overflow-x-auto rounded-xl border border-[#e5e7eb] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f0] text-[10px] uppercase tracking-wider text-[#9ca3af]">
                  <th className="text-left px-6 py-3 font-semibold">Fahrzeug</th>
                  <th className="text-left px-6 py-3 font-semibold">Kaufpreis</th>
                  <th className="text-left px-6 py-3 font-semibold">Laufzeit</th>
                  <th className="text-left px-6 py-3 font-semibold">Kilometer</th>
                  <th className="text-left px-6 py-3 font-semibold">Rate/Mt.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {leasingExamples.map((ex) => (
                  <tr key={ex.model} className="hover:bg-ct-light transition-colors">
                    <td className="px-6 py-4 font-semibold" style={{ color: "var(--ct-dark)" }}>{ex.model}</td>
                    <td className="px-6 py-4 text-[#6b7280]">{ex.price}</td>
                    <td className="px-6 py-4 text-[#6b7280]">{ex.duration}</td>
                    <td className="px-6 py-4 text-[#6b7280]">{ex.km}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: "var(--ct-magenta)" }}>{ex.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[#9ca3af] text-xs mt-3">
            * Alle Angaben inkl. MwSt., vorbehaltlich Bonitätsprüfung durch die Leasingbank.
          </p>
        </div>
      </section>

      {/* B2B-Teaser */}
      <FadeIn>
        <section className="py-12 md:py-16" style={{ backgroundColor: "var(--ct-dark)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                   style={{ color: "var(--ct-cyan)" }}>Firmenkunden</p>
                <h2 className="text-2xl font-extrabold text-white">
                  Spezialkonditionen für Unternehmen
                </h2>
                <p className="text-[#9ca3af] text-sm mt-2 max-w-lg">
                  Flottenrabatte, MwSt-Rückerstattung und direkter Ansprechpartner.
                </p>
              </div>
              <Link
                href="/firmenkunden"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-lg
                           text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--ct-cyan)" }}
              >
                Mehr erfahren <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="text-2xl font-extrabold mb-3" style={{ color: "var(--ct-dark)" }}>
              Persönliche Offerte anfragen
            </h2>
            <p className="text-[#6b7280] text-sm mb-6 max-w-md mx-auto">
              Wir berechnen Ihre individuelle Rate — kostenlos und unverbindlich.
            </p>
            <Link href="/kontakt"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white
                         font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ct-cyan)" }}>
              Jetzt anfragen <ArrowRight size={15} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
```

### Step 2: Type-check

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

### Step 3: Browser verify

`http://localhost:3000/finanzierung` → Hero, 3 Options-Cards, Leasing-Tabelle, B2B-Teaser, CTA.

---

## Task 7: /firmenkunden page

**Files:**
- Create: `components/firmenkunden/FirmenkundenForm.tsx`
- Create: `app/firmenkunden/page.tsx`

### Step 1: Erstelle das Formular-Component

Das Formular sendet an `/api/contact`. Firmendaten werden im `message`-Feld mitgeschickt.

```tsx
// components/firmenkunden/FirmenkundenForm.tsx
"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const fieldClass =
  "w-full px-4 py-3 text-sm border border-[#e5e7eb] bg-white text-ct-text placeholder:text-[#9ca3af]" +
  " focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors rounded-sm";

export default function FirmenkundenForm() {
  const [form, setForm] = useState({
    firma: "", name: "", email: "", phone: "", anzahl: "", nachricht: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const message = [
        `Firma: ${form.firma}`,
        `Anzahl Fahrzeuge: ${form.anzahl || "–"}`,
        "",
        form.nachricht,
      ].join("\n");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: "Firmenkundenanfrage",
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Unbekannter Fehler");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Senden.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 size={48} className="mb-4" style={{ color: "var(--ct-cyan)" }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--ct-dark)" }}>
          Anfrage gesendet!
        </h3>
        <p className="text-[#6b7280] text-sm max-w-sm">
          Vielen Dank. Wir melden uns innerhalb von 24 Stunden.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
            Firmenname *
          </label>
          <input type="text" required value={form.firma}
            onChange={(e) => setForm({ ...form, firma: e.target.value })}
            placeholder="Muster AG" className={fieldClass} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
            Anzahl Fahrzeuge
          </label>
          <input type="number" min="1" value={form.anzahl}
            onChange={(e) => setForm({ ...form, anzahl: e.target.value })}
            placeholder="z.B. 3" className={fieldClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
            Ansprechpartner *
          </label>
          <input type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Max Mustermann" className={fieldClass} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
            Telefon
          </label>
          <input type="tel" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+41 79 000 00 00" className={fieldClass} />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
          E-Mail *
        </label>
        <input type="email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="anfrage@firma.ch" className={fieldClass} />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
          Nachricht / Anforderungen
        </label>
        <textarea rows={4} value={form.nachricht}
          onChange={(e) => setForm({ ...form, nachricht: e.target.value })}
          placeholder="Welche Fahrzeugtypen suchen Sie?"
          className={`${fieldClass} resize-none`} />
      </div>
      <button type="submit" disabled={loading}
        className="flex items-center gap-2 text-sm font-semibold text-white px-8 py-3 rounded-sm
                   disabled:opacity-60 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--ct-cyan)" }}>
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Wird gesendet…</>
        ) : (
          <><Send size={15} />Anfrage senden</>
        )}
      </button>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </form>
  );
}
```

### Step 2: Erstelle die Page

```tsx
// app/firmenkunden/page.tsx
import type { Metadata } from "next";
import { Building2, Users, Receipt, UserCheck } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import FirmenkundenForm from "@/components/firmenkunden/FirmenkundenForm";

export const metadata: Metadata = {
  title: "Firmenkunden & Flottenservice",
  description:
    "Flottenfahrzeuge, Leasing und Finanzierung für Unternehmen. Car Trade24 bietet Spezialkonditionen für Firmenkunden in der ganzen Schweiz.",
};

const vorteile = [
  {
    icon: Building2,
    title: "Flottenrabatte",
    desc: "Ab dem ersten Fahrzeug erhalten Firmenkunden Sonderkonditionen — je grösser die Flotte, desto attraktiver der Preis.",
  },
  {
    icon: Receipt,
    title: "MwSt-Rückerstattung",
    desc: "Als vorsteuerabzugsberechtigtes Unternehmen können Sie die Mehrwertsteuer vollständig zurückfordern.",
  },
  {
    icon: UserCheck,
    title: "Persönlicher Ansprechpartner",
    desc: "Sie erhalten einen dedizierten Ansprechpartner — keine Warteschlangen, kein Callcenter.",
  },
  {
    icon: Users,
    title: "Direktabrechnung",
    desc: "Wir rechnen direkt mit Ihrer Buchhaltung ab. Auf Wunsch auch per Sammelrechnung.",
  },
];

const steps = [
  { step: "01", title: "Anfrage stellen", desc: "Füllen Sie das Formular aus. Wir melden uns innerhalb von 24 Stunden." },
  { step: "02", title: "Offerte erhalten", desc: "Persönliche Konditionen, abgestimmt auf Ihre Flottengrösse." },
  { step: "03", title: "Fahrzeug übernehmen", desc: "Abholung in Wohlen oder Lieferung schweizweit." },
];

export default function FirmenkundenPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Firmenkunden & Flottenservice</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>
            Mobilität für<br />Ihr Unternehmen.
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Spezialkonditionen für Flotten, transparente Abrechnung und ein
            persönlicher Ansprechpartner — für Unternehmen jeder Grösse.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Warum Car Trade24</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                Ihre Vorteile als Firmenkunde
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vorteile.map((v, i) => (
              <FadeIn key={v.title} delay={i * 80}>
                <div className="flex gap-5 p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="w-11 h-11 flex items-center justify-center rounded-lg shrink-0"
                       style={{ backgroundColor: "var(--ct-light)" }}>
                    <v.icon size={20} style={{ color: "var(--ct-cyan)" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: "var(--ct-dark)" }}>{v.title}</h3>
                    <p className="text-[#6b7280] text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>So einfach geht's</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>
                In 3 Schritten zum Flottenfahrzeug
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <FadeIn key={s.step} delay={i * 100}>
                <div className="text-center p-6 rounded-xl bg-white border border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-5xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {s.step}
                  </p>
                  <h3 className="font-bold text-base mb-2" style={{ color: "var(--ct-dark)" }}>{s.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
               style={{ color: "var(--ct-cyan)" }}>Unternehmensanfrage</p>
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "var(--ct-dark)" }}>
              Jetzt Offerte anfragen
            </h2>
            <p className="text-[#6b7280] text-sm mb-8">
              Wir antworten innerhalb von 24 Stunden mit Ihrer persönlichen Firmenofferte.
            </p>
          </FadeIn>
          <FirmenkundenForm />
        </div>
      </section>
    </>
  );
}
```

### Step 3: Type-check + Browser verify

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

`http://localhost:3000/firmenkunden` → Hero, 4 Vorteils-Cards, 3-Schritt-Ablauf, Formular.

---

## Task 8: /ankauf page

**Files:**
- Create: `components/ankauf/AnkaufForm.tsx`
- Create: `app/ankauf/page.tsx`

### Step 1: Erstelle das Formular

```tsx
// components/ankauf/AnkaufForm.tsx
"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const fieldClass =
  "w-full px-4 py-3 text-sm border border-[#e5e7eb] bg-white text-ct-text placeholder:text-[#9ca3af]" +
  " focus:outline-none focus:border-ct-cyan focus:ring-1 focus:ring-[var(--ct-cyan)]/20 transition-colors rounded-sm";

const MAKES = ["Audi","BMW","Citroën","Dacia","Fiat","Ford","Honda","Hyundai",
  "Kia","Mazda","Mercedes-Benz","Nissan","Opel","Peugeot","Renault",
  "Seat","Skoda","Suzuki","Tesla","Toyota","Volkswagen","Volvo","Andere"];

export default function AnkaufForm() {
  const [form, setForm] = useState({
    marke: "", modell: "", jahr: "", kilometer: "",
    name: "", email: "", phone: "", bemerkung: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const message = [
        `Fahrzeug: ${form.marke} ${form.modell}`,
        `Jahrgang: ${form.jahr || "–"}`,
        `Kilometerstand: ${form.kilometer ? form.kilometer + " km" : "–"}`,
        form.bemerkung ? `\nBemerkungen: ${form.bemerkung}` : "",
      ].filter(Boolean).join("\n");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: "Fahrzeugankauf",
          message,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Unbekannter Fehler");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Senden.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 size={48} className="mb-4" style={{ color: "var(--ct-cyan)" }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--ct-dark)" }}>
          Bewertungsanfrage gesendet!
        </h3>
        <p className="text-[#6b7280] text-sm max-w-sm">
          Wir melden uns innerhalb von 24 Stunden mit einer Bewertung Ihres Fahrzeugs.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Marke *</label>
          <select required value={form.marke}
            onChange={(e) => setForm({ ...form, marke: e.target.value })}
            className={fieldClass}>
            <option value="">Marke wählen</option>
            {MAKES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Modell *</label>
          <input type="text" required value={form.modell}
            onChange={(e) => setForm({ ...form, modell: e.target.value })}
            placeholder="z.B. Golf, Corolla" className={fieldClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Jahrgang</label>
          <input type="number" min="1990" max="2026" value={form.jahr}
            onChange={(e) => setForm({ ...form, jahr: e.target.value })}
            placeholder="z.B. 2019" className={fieldClass} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Kilometerstand</label>
          <input type="number" min="0" value={form.kilometer}
            onChange={(e) => setForm({ ...form, kilometer: e.target.value })}
            placeholder="z.B. 85000" className={fieldClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Ihr Name *</label>
          <input type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Max Mustermann" className={fieldClass} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Telefon</label>
          <input type="tel" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+41 79 000 00 00" className={fieldClass} />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">E-Mail *</label>
        <input type="email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="max@beispiel.ch" className={fieldClass} />
      </div>
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">Bemerkungen (optional)</label>
        <textarea rows={3} value={form.bemerkung}
          onChange={(e) => setForm({ ...form, bemerkung: e.target.value })}
          placeholder="Unfallhistorie, Ausstattung, bekannte Mängel…"
          className={`${fieldClass} resize-none`} />
      </div>
      <button type="submit" disabled={loading}
        className="flex items-center gap-2 text-sm font-semibold text-white px-8 py-3 rounded-sm
                   disabled:opacity-60 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--ct-cyan)" }}>
        {loading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Wird gesendet…</>
        ) : (
          <><Send size={15} />Bewertung anfragen</>
        )}
      </button>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </form>
  );
}
```

### Step 2: Erstelle die Page

```tsx
// app/ankauf/page.tsx
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import AnkaufForm from "@/components/ankauf/AnkaufForm";

export const metadata: Metadata = {
  title: "Fahrzeug verkaufen – Ankauf & Eintausch",
  description:
    "Verkaufen Sie Ihr Auto fair und unkompliziert. Car Trade24 bewertet Ihr Fahrzeug kostenlos und unverbindlich — schweizweit.",
};

const steps = [
  { step: "01", title: "Formular ausfüllen", desc: "Marke, Modell, Kilometer, Kontakt — dauert 2 Minuten." },
  { step: "02", title: "Bewertung erhalten", desc: "Wir melden uns innert 24 Stunden mit einem schriftlichen Angebot." },
  { step: "03", title: "Auszahlung erhalten", desc: "Fahrzeug abgeben, Geld erhalten — direkt, fair, ohne Umweg." },
];

const trusts = ["Kostenlose Bewertung","Kein Verkaufsrisiko","Sofortige Auszahlung","Schweizweit möglich"];

export default function AnkaufPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Fahrzeug verkaufen</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>Ihr Auto fair bewertet.</h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Wir kaufen Ihr Fahrzeug direkt an — transparent, ohne Kommission und ohne Wartezeit.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {trusts.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-sm text-[#4b5563]">
                <CheckCircle2 size={14} style={{ color: "var(--ct-green)" }} />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <FadeIn key={s.step} delay={i * 80}>
                <div className="text-center p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-5xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {s.step}
                  </p>
                  <h3 className="font-bold text-base mb-2" style={{ color: "var(--ct-dark)" }}>{s.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-ct-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
               style={{ color: "var(--ct-cyan)" }}>Kostenlose Bewertung</p>
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "var(--ct-dark)" }}>
              Fahrzeug zur Bewertung anmelden
            </h2>
            <p className="text-[#6b7280] text-sm mb-8">
              Unverbindlich und kostenlos — wir melden uns innert 24 Stunden.
            </p>
          </FadeIn>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <AnkaufForm />
          </div>
        </div>
      </section>
    </>
  );
}
```

### Step 3: Type-check + Browser verify

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

`http://localhost:3000/ankauf` → Hero mit Trust-Badges, 3 Schritte, Formular.

---

## Task 9: /garantie page

**Files:**
- Create: `app/garantie/page.tsx`

Nutzt Accordion aus Task 1.

### Step 1: Erstelle die Seite

```tsx
// app/garantie/page.tsx
import type { Metadata } from "next";
import { Shield, CheckCircle2, ArrowRight } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import Accordion from "@/components/ui/Accordion";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Garantie",
  description:
    "Bis zu 7 Jahre Garantie auf alle Occasionen bei Car Trade24. Motor, Getriebe, Elektronik und mehr — transparent und fair.",
};

const coverage = [
  { category: "Antrieb",    items: ["Motor", "Getriebe", "Differential", "Antriebswellen"] },
  { category: "Elektronik", items: ["Steuergeräte", "Sensoren", "Bordcomputer"] },
  { category: "Fahrwerk",   items: ["Lenkung", "Federung", "Stossdämpfer"] },
  { category: "Klima",      items: ["Kompressor", "Kondensator", "Klimaanlage"] },
];

const durations = [
  { years: "1 Jahr",  desc: "Basisschutz", color: "#9ca3af" },
  { years: "2 Jahre", desc: "Standard",    color: "#00a0e3" },
  { years: "3 Jahre", desc: "Komfort",     color: "#00a0e3" },
  { years: "5 Jahre", desc: "Premium",     color: "#e4007d" },
  { years: "7 Jahre", desc: "Maximal",     color: "#e4007d" },
];

const faqItems = [
  {
    question: "Was ist im Garantiefall zu tun?",
    answer: "Melden Sie den Schaden telefonisch oder per E-Mail bei uns. Wir koordinieren die Reparatur mit einer unserer Partnerwerkstätten — schweizweit. Sie müssen nichts vorstrecken.",
  },
  {
    question: "Gilt die Garantie auch im Ausland?",
    answer: "Die Garantie gilt primär in der Schweiz. Für Pannen im europäischen Ausland empfehlen wir eine Pannenhilfe-Versicherung als Ergänzung.",
  },
  {
    question: "Kann ich die Garantie übertragen?",
    answer: "Ja. Beim Weiterverkauf kann die verbleibende Garantiedauer auf den neuen Eigentümer übertragen werden — das erhöht den Wiederverkaufswert.",
  },
  {
    question: "Was ist nicht abgedeckt?",
    answer: "Verschleissteile (Bremsbeläge, Reifen, Glühbirnen), Unfallschäden und Schäden durch unsachgemässen Betrieb sind ausgeschlossen.",
  },
  {
    question: "Wie lange gilt die gesetzliche Gewährleistung?",
    answer: "In der Schweiz beträgt die gesetzliche Gewährleistungspflicht nach OR 2 Jahre. Unsere optionale Garantie erweitert diese.",
  },
];

export default function GarantiePage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Garantie</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>Bis zu 7 Jahre Garantie.</h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Jede Occasion ab unserem Hof wird mit einer wählbaren Garantie geliefert — transparent, fair und schweizweit gültig.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Abdeckung</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>Was ist abgedeckt?</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coverage.map((cat, i) => (
              <FadeIn key={cat.category} delay={i * 60}>
                <div className="p-5 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={16} style={{ color: "var(--ct-cyan)" }} />
                    <h3 className="font-bold text-sm" style={{ color: "var(--ct-dark)" }}>{cat.category}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-[#6b7280]">
                        <CheckCircle2 size={12} style={{ color: "var(--ct-green)" }} className="shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-ct-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Laufzeiten</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>Sie wählen die Dauer</h2>
            </div>
          </FadeIn>
          <div className="flex flex-wrap gap-4">
            {durations.map((d, i) => (
              <FadeIn key={d.years} delay={i * 60}>
                <div className="flex flex-col items-center justify-center w-32 h-32 rounded-xl
                                bg-white border-2 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                     style={{ borderColor: d.color }}>
                  <p className="text-2xl font-black" style={{ color: d.color }}>{d.years}</p>
                  <p className="text-xs text-[#9ca3af] mt-1">{d.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-8">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
                 style={{ color: "var(--ct-cyan)" }}>Häufige Fragen</p>
              <h2 className="text-3xl font-extrabold" style={{ color: "var(--ct-dark)" }}>Garantie — FAQ</h2>
            </div>
          </FadeIn>
          <Accordion items={faqItems} />
        </div>
      </section>

      <section className="py-12 bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <p className="text-[#6b7280] text-sm mb-4">Fragen zur Garantie? Wir beraten Sie gerne persönlich.</p>
            <Link href="/kontakt"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white
                         font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ct-cyan)" }}>
              Kontakt aufnehmen <ArrowRight size={15} />
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
```

### Step 2: Type-check + Browser verify

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

`http://localhost:3000/garantie` → Hero, 4 Abdeckungs-Cards, 5 Laufzeit-Badges, Accordion-FAQ, CTA.

---

## Task 10: /faq page mit JSON-LD

**Files:**
- Create: `app/faq/page.tsx`

Nutzt Accordion aus Task 1. Beinhaltet Schema.org FAQPage Markup (JSON-LD) für SEO.

### Step 1: Erstelle die Seite

Für JSON-LD in Next.js App Router wird `next/script` mit der `id`-Prop und dem `type="application/ld+json"` verwendet.
Das Script-Tag benötigt `dangerouslySetInnerHTML` mit `{ __html: JSON.stringify(jsonLd) }`.
Da `jsonLd` vollständig statisch (keine User-Eingaben) ist, ist das sicher.

```tsx
// app/faq/page.tsx
import type { Metadata } from "next";
import FadeIn from "@/components/ui/FadeIn";
import Accordion, { type AccordionItem } from "@/components/ui/Accordion";
import Script from "next/script";

export const metadata: Metadata = {
  title: "FAQ – Häufige Fragen",
  description:
    "Antworten auf die häufigsten Fragen zu Kauf, Leasing, Garantie, Lieferung und Fahrzeugankauf bei Car Trade24 GmbH.",
};

const categories: { title: string; items: AccordionItem[] }[] = [
  {
    title: "Kauf & Bezahlung",
    items: [
      {
        question: "Welche Zahlungsarten akzeptieren Sie?",
        answer: "Wir akzeptieren Barzahlung, Banküberweisung und Finanzierung über unsere Bankpartner. EC-Karte ist ebenfalls möglich.",
      },
      {
        question: "Kann ich ein Fahrzeug reservieren?",
        answer: "Ja, gegen eine Anzahlung von CHF 500 reservieren wir Ihr Wunschfahrzeug für bis zu 7 Tage. Die Anzahlung wird beim Kauf vollständig angerechnet.",
      },
      {
        question: "Ist eine Probefahrt möglich?",
        answer: "Selbstverständlich. Vereinbaren Sie einen Termin telefonisch oder per E-Mail. Bitte gültigen Führerschein mitbringen.",
      },
    ],
  },
  {
    title: "Lieferung & Abholung",
    items: [
      {
        question: "Liefern Sie Fahrzeuge schweizweit?",
        answer: "Ja, wir liefern in die ganze Schweiz. Bis 50 km Entfernung von Wohlen ist die Lieferung kostenlos.",
      },
      {
        question: "Wie lange dauert die Lieferung?",
        answer: "Nach Zahlungseingang organisieren wir die Lieferung innerhalb von 2–5 Werktagen.",
      },
    ],
  },
  {
    title: "Garantie & Service",
    items: [
      {
        question: "Wie lange gilt die Garantie?",
        answer: "Wir bieten optionale Garantielaufzeiten von 1 bis 7 Jahren. Die gesetzliche Gewährleistungspflicht nach OR beträgt 2 Jahre.",
      },
      {
        question: "Was muss ich im Garantiefall tun?",
        answer: "Kontaktieren Sie uns telefonisch oder per E-Mail. Wir koordinieren die Reparatur mit einer Partnerwerkstatt in Ihrer Nähe.",
      },
      {
        question: "Sind die Fahrzeuge MFK-geprüft?",
        answer: "Alle Fahrzeuge durchlaufen eine interne Prüfung. Viele besitzen zudem eine aktuelle MFK. Details im jeweiligen Inserat.",
      },
    ],
  },
  {
    title: "Finanzierung & Leasing",
    items: [
      {
        question: "Welche Voraussetzungen brauche ich für Leasing?",
        answer: "Gültiger Schweizer Wohnsitz, Führerschein und positive Bonitätsprüfung. Wir unterstützen Sie beim Prozess.",
      },
      {
        question: "Wie lange dauert die Leasingentscheidung?",
        answer: "In der Regel 24–48 Stunden. Wir reichen Ihren Antrag direkt ein und informieren Sie sofort.",
      },
    ],
  },
  {
    title: "Fahrzeugankauf",
    items: [
      {
        question: "Kaufen Sie auch Fahrzeuge mit hohem Kilometerstand?",
        answer: "Ja, wir bewerten jedes Fahrzeug individuell. Füllen Sie einfach das Formular auf unserer Ankauf-Seite aus.",
      },
      {
        question: "Wie schnell erhalte ich eine Bewertung?",
        answer: "Wir melden uns innerhalb von 24 Stunden mit einem schriftlichen Angebot. Gültig für 7 Tage, unverbindlich.",
      },
      {
        question: "Nehmen Sie Fahrzeuge in Zahlung?",
        answer: "Ja, Fahrzeugeintausch ist möglich. Der Eintauschwert wird fair bewertet und vom Kaufpreis Ihres neuen Fahrzeugs abgezogen.",
      },
    ],
  },
];

const allFaqItems = categories.flatMap((cat) => cat.items);

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      {/* JSON-LD für Schema.org FAQPage — statische Daten, kein User-Input */}
      <Script id="faq-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
             style={{ color: "var(--ct-cyan)" }}>Häufige Fragen</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4"
              style={{ color: "var(--ct-dark)" }}>FAQ</h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Die häufigsten Fragen zu Kauf, Leasing, Garantie, Lieferung und Fahrzeugankauf.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {categories.map((cat, i) => (
            <FadeIn key={cat.title} delay={i * 60}>
              <div>
                <h2 className="text-lg font-extrabold mb-5 pb-3 border-b border-[#f0f0f0]"
                    style={{ color: "var(--ct-dark)" }}>
                  {cat.title}
                </h2>
                <Accordion items={cat.items} />
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  );
}
```

### Step 2: Type-check

```bash
cd /root/cartrade24 && npx tsc --noEmit 2>&1
```

Expected: no errors.

### Step 3: Browser verify

`http://localhost:3000/faq` → Hero, 5 Kategorien, Accordions klappen auf/zu.
Im Browser-Quelltext (Strg+U) muss `<script type="application/ld+json">` sichtbar sein.

---

## Completion Checklist

- [ ] `npx tsc --noEmit` → 0 Fehler
- [ ] Header Nav: Home | Autos | Finanzierung | Firmenkunden | Über uns | Kontakt
- [ ] `http://localhost:3000/informationen` → redirected nach `/ueber-uns`
- [ ] `http://localhost:3000/ueber-uns` → ASTRA + Qualitätsprozess Sections sichtbar
- [ ] `http://localhost:3000/finanzierung` → rendert, 3 Options-Cards + Leasing-Tabelle
- [ ] `http://localhost:3000/firmenkunden` → rendert, Formular mit Firmenname-Feld
- [ ] `http://localhost:3000/ankauf` → rendert, Formular mit Marke/Modell-Feldern
- [ ] `http://localhost:3000/garantie` → rendert, Accordion-FAQ funktioniert
- [ ] `http://localhost:3000/faq` → rendert, alle 5 Kategorien, JSON-LD im Source
- [ ] Footer: alle Links auf echte URLs (keine `#` mehr)
- [ ] Footer "Leasing & Finanzierung" → `/finanzierung`
- [ ] Footer "Fahrzeug verkaufen" → `/ankauf`
- [ ] Footer "Firmenkunden" → `/firmenkunden`
- [ ] Footer "Garantie" → `/garantie`
- [ ] Footer "FAQ" → `/faq`
