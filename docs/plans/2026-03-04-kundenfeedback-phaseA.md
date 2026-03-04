# Kundenfeedback Phase A — Quick Wins Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 9 Quick-Win-Verbesserungen basierend auf Kundenfeedback umsetzen — VDP-Optimierungen, Homepage-Layout, Filter-UX und Sourcing-Weiterleitung.

**Architecture:** Reine Frontend-Änderungen an bestehenden Komponenten. Kein neues Backend, keine neuen API-Routes (ausser Erweiterung von `/api/contact` Subjects). Alle Datenquellen (AS24 API, localStorage) sind bereits vorhanden.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind v4, lucide-react

---

### Task 1: VDP Bilder auf 4:3

**Files:**
- Modify: `components/vehicles/VehicleGallery.tsx` (Bild-Container aspect-ratio)
- Modify: `components/vehicles/VehicleCard.tsx` (Listenansicht-Thumbnails)

**Step 1: VehicleGallery — Aspect-Ratio auf 4/3 setzen**

In `VehicleGallery.tsx`, den Bild-Container finden und `aspect-[4/3]` setzen. Das Hauptbild soll `object-contain` auf hellem Hintergrund nutzen, damit nichts abgeschnitten wird:

```tsx
// Hauptbild-Container: aspect-ratio 4:3, object-contain statt cover
<div className="relative aspect-[4/3] bg-[#f8f8f8] rounded-xl overflow-hidden">
  <Image
    src={images[current]}
    alt={alt}
    fill
    className="object-contain"
    sizes="(max-width: 768px) 100vw, 60vw"
    priority
  />
</div>
```

Thumbnail-Reihe ebenfalls auf 4:3:
```tsx
<div className="aspect-[4/3] relative rounded-lg overflow-hidden">
```

**Step 2: VehicleCard — Thumbnail auf 4:3**

In `VehicleCard.tsx`, das Bild-Container von der aktuellen Ratio auf `aspect-[4/3]` umstellen:

```tsx
<div className="relative aspect-[4/3] bg-[#f8f8f8] overflow-hidden">
  <Image
    src={vehicle.images[0] || "/images/placeholder.webp"}
    alt={`${vehicle.make} ${vehicle.model}`}
    fill
    className="object-cover"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
</div>
```

**Step 3: Mobile Querformat prüfen**

Auf Mobile soll das Bild die volle Breite nutzen. Sicherstellen dass keine `max-height` oder feste Höhen das 4:3-Verhältnis auf kleinen Screens brechen.

**Step 4: Visuell testen und committen**

Run: `npx next dev` → VDP öffnen → Bilder prüfen (Desktop + Mobile)

```bash
git add components/vehicles/VehicleGallery.tsx components/vehicles/VehicleCard.tsx
git commit -m "fix: VDP + Listenansicht Bilder auf 4:3 Seitenverhältnis"
```

---

### Task 2: VDP Getriebe als 5. Spec-Box

**Files:**
- Modify: `app/[locale]/autos/[id]/page.tsx:200-238`

**Step 1: Getriebe-Box zum Array hinzufügen**

In `page.tsx` bei Zeile ~200, das Spec-Array erweitern. `Cog` Icon importieren und 5. Eintrag hinzufügen:

```tsx
import { CalendarDays, Gauge, Zap, GitMerge, Cog } from "lucide-react";

// Im Spec-Array (Zeile ~202):
{[
  { icon: CalendarDays, label: "Baujahr",        value: String(vehicle.year) },
  { icon: Gauge,        label: "Kilometerstand", value: `${formatCHF(vehicle.mileage)} km` },
  { icon: Zap,          label: "Leistung",       value: `${vehicle.power} PS` },
  { icon: GitMerge,     label: "Antrieb",        value: vehicle.drivetrain ?? "–" },
  { icon: Cog,          label: "Getriebe",       value: vehicle.transmission },
].map((s) => (
```

**Step 2: Grid auf 5 Spalten anpassen**

```tsx
// Zeile ~201: Grid anpassen
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
```

Mobile: 2 Spalten (2+2+1), Tablet: 3 Spalten (3+2), Desktop: 5 Spalten.

**Step 3: Committen**

```bash
git add app/[locale]/autos/[id]/page.tsx
git commit -m "feat: VDP Getriebe als 5. Spec-Box hinzufügen"
```

---

### Task 3: VDP Leasingrechner ausgeklappt + Restwert

**Files:**
- Modify: `app/[locale]/autos/[id]/page.tsx:373-379` (details → open)
- Modify: `components/ui/LeasingCalculator.tsx` (Restwert-Slider + Berechnung)
- Modify: `lib/utils.ts:16-25` (calcMonthlyRate erweitern)

**Step 1: Details-Element auf `open` setzen**

In `page.tsx` Zeile ~373:

```tsx
<details open className="group border-t border-[#f0f0f0] pt-4 mb-4">
```

**Step 2: calcMonthlyRate um Restwert erweitern**

In `lib/utils.ts`, die Funktion anpassen:

```tsx
export function calcMonthlyRate(
  price: number,
  downPct = 0,
  months = LEASING_DEFAULT_MONTHS,
  residualPct = 0,
): number {
  const financed = price * (1 - downPct / 100) - price * (residualPct / 100);
  const r = LEASING_ANNUAL_RATE / 12;
  if (r === 0) return financed / months;
  return financed * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}
```

**Step 3: Restwert-Slider in LeasingCalculator hinzufügen**

In `LeasingCalculator.tsx`, neuen State + Slider zwischen Anzahlung und Laufzeit einfügen:

```tsx
const [residual, setResidual] = useState(30); // Default 30%

// Nach dem Down-Payment-Slider, vor den Term-Toggles:
<div>
  <div className="flex justify-between text-xs text-[#6b7280] mb-1.5">
    <span>Restwert</span>
    <span className="font-semibold text-ct-dark">
      {residual}% ({formatCHF(Math.round(price * residual / 100))} CHF)
    </span>
  </div>
  <input
    type="range"
    min={10}
    max={60}
    step={5}
    value={residual}
    onChange={(e) => setResidual(Number(e.target.value))}
    className="w-full accent-[var(--ct-cyan)]"
  />
</div>
```

**Step 4: Berechnung anpassen**

Den `calcMonthlyRate`-Aufruf im Component aktualisieren:

```tsx
const rate = calcMonthlyRate(price, down, months, residual);
```

**Step 5: Restwert in der Fussnote anzeigen**

Unter dem Ergebnis:

```tsx
<p className="text-[11px] text-[#9ca3af] mt-2 leading-relaxed">
  Bsp.-Rechnung: {down}% Anzahlung, {months} Mt., {formatCHF(km)}&nbsp;km/Jahr,
  {residual}% Restwert ({formatCHF(Math.round(price * residual / 100))} CHF),
  3.9% p.a., inkl. MwSt.
</p>
```

**Step 6: Committen**

```bash
git add lib/utils.ts components/ui/LeasingCalculator.tsx app/[locale]/autos/[id]/page.tsx
git commit -m "feat: VDP Leasingrechner ausgeklappt + Restwert-Slider"
```

---

### Task 4: VDP "Jetzt Anfragen" als Modal

**Files:**
- Create: `components/vehicles/InquiryModal.tsx`
- Modify: `app/[locale]/autos/[id]/page.tsx:313-321` (Link → Modal-Trigger)

**Step 1: InquiryModal erstellen**

Gleicher Pattern wie `TestDriveModal.tsx` — Backdrop + zentriertes Modal mit `VDPContactForm`:

```tsx
"use client";

import { X, MessageCircle } from "lucide-react";
import VDPContactForm from "@/components/vehicles/VDPContactForm";

interface InquiryModalProps {
  vehicleLabel: string;
  vehiclePrice?: number;
  onClose: () => void;
}

export default function InquiryModal({ vehicleLabel, vehiclePrice, onClose }: InquiryModalProps) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto
                   bg-white rounded-2xl shadow-2xl z-50 p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Fahrzeug anfragen"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle size={16} style={{ color: "var(--ct-cyan)" }} />
              <p className="text-[0.65rem] font-bold uppercase tracking-wider"
                 style={{ color: "var(--ct-cyan)" }}>
                Jetzt anfragen
              </p>
            </div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--ct-dark)" }}>
              {vehicleLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-ct-light transition-colors text-[#9ca3af]"
            aria-label="Schliessen"
          >
            <X size={18} />
          </button>
        </div>
        <VDPContactForm vehicleLabel={vehicleLabel} vehiclePrice={vehiclePrice} />
      </div>
    </>
  );
}
```

**Step 2: VDP-Page — Link durch Modal-Trigger ersetzen**

In `page.tsx`, State hinzufügen und den Link (Zeile ~313-321) durch einen Button ersetzen:

```tsx
const [inquiryOpen, setInquiryOpen] = useState(false);

// Statt <Link href="/kontakt?...">:
<button
  type="button"
  onClick={() => {
    trackEvent({ event: "cta_click", cta_type: "inquiry", source_page: pathname });
    setInquiryOpen(true);
  }}
  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
             text-white font-semibold text-sm hover:opacity-90 transition-opacity bg-ct-cyan"
>
  Jetzt anfragen <ArrowRight size={15} />
</button>

// Am Ende des Components, vor dem schliessenden Fragment:
{inquiryOpen && (
  <InquiryModal
    vehicleLabel={`${vehicle.make} ${vehicle.model}`}
    vehiclePrice={vehicle.price}
    onClose={() => setInquiryOpen(false)}
  />
)}
```

**Hinweis:** Die VDP-Page ist aktuell ein Server Component. Der Modal-State braucht Client-Side-Interaktivität. Lösung: Den CTA-Button + Modal in ein kleines Client-Component `VDPInquiryTrigger` extrahieren (gleicher Pattern wie `TestDriveTrigger`).

**Step 3: Tracking-Event erweitern**

In `lib/tracking.ts`, `cta_type` um `"inquiry"` erweitern:

```tsx
interface CTAClickEvent {
  event: "cta_click";
  cta_type: "phone" | "whatsapp" | "test_drive" | "appointment" | "inquiry" | "other";
  source_page: string;
}
```

**Step 4: Committen**

```bash
git add components/vehicles/InquiryModal.tsx app/[locale]/autos/[id]/page.tsx lib/tracking.ts
git commit -m "feat: VDP 'Jetzt Anfragen' als Modal statt Link"
```

---

### Task 5: Filter-Darstellung verbessern

**Files:**
- Modify: `components/vehicles/VehicleFilter.tsx`

**Step 1: Labels über den Dropdowns hinzufügen**

Jeder Select bekommt ein `<label>` darüber:

```tsx
<div className="flex flex-col min-w-[140px]">
  <label className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-wider mb-1">
    Marke
  </label>
  <select ...>
```

**Step 2: Grössere Inputs**

Select-Klasse von `h-9` auf `h-10` ändern, Schrift von `text-sm` auf `text-sm` beibehalten, aber `font-medium` hinzufügen:

```tsx
const selectClass = `h-10 px-3 text-sm font-medium border border-[#d1d5db] bg-white text-[#1f2937]
  rounded-lg focus:outline-none focus:border-ct-cyan focus:ring-2 focus:ring-[var(--ct-cyan)]/20
  transition-colors cursor-pointer appearance-none pr-8`;
```

**Step 3: Desktop — Erweiterte Filter standardmässig sichtbar**

```tsx
// showAdvanced State Default auf true setzen (Desktop):
const [showAdvanced, setShowAdvanced] = useState(true);
```

**Step 4: Stärkere aktive Filter-Badges**

Aktive Filter-Badges prominenter stylen:

```tsx
<span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full
                 bg-ct-cyan text-white text-xs font-semibold">
```

**Step 5: Mobile — Filter-Layout optimieren**

Auf Mobile die Filter als 2-spaltiges Grid statt Flex-Wrap:

```tsx
<div className="flex flex-wrap gap-2.5 items-end p-4
                sm:flex-nowrap
                max-sm:grid max-sm:grid-cols-2 max-sm:gap-3">
```

**Step 6: Committen**

```bash
git add components/vehicles/VehicleFilter.tsx
git commit -m "feat: Filter-Darstellung prominenter und führender gestalten"
```

---

### Task 6: Header "Zuletzt angesehen" als Icon + Flyout

**Files:**
- Create: `components/layout/RecentlyViewedFlyout.tsx`
- Modify: `components/layout/Header.tsx`
- Modify: `app/[locale]/page.tsx:659` (RecentlyViewed entfernen)

**Step 1: RecentlyViewedFlyout erstellen**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getRecentlyViewed } from "@/lib/recently-viewed";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  price: number;
  images: string[];
}

interface Props {
  allVehicles: Vehicle[];
}

export default function RecentlyViewedFlyout({ allVehicles }: Props) {
  const [open, setOpen] = useState(false);
  const [ids, setIds] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIds(getRecentlyViewed());
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const vehicles = ids
    .map((id) => allVehicles.find((v) => v.id === id))
    .filter(Boolean) as Vehicle[];

  if (vehicles.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-ct-light transition-colors text-[#374151]"
        aria-label="Zuletzt angesehen"
      >
        <Clock size={18} />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-ct-cyan
                         text-white text-[9px] font-bold flex items-center justify-center">
          {vehicles.length}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl
                        shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#e5e7eb]
                        z-50 overflow-hidden">
          <p className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#9ca3af]
                        border-b border-[#f0f0f0]">
            Zuletzt angesehen
          </p>
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/autos/${v.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-ct-light transition-colors"
            >
              <div className="relative w-14 h-10 rounded-md overflow-hidden bg-[#f8f8f8] shrink-0">
                <Image
                  src={v.images[0] || "/images/placeholder.webp"}
                  alt={`${v.make} ${v.model}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ct-dark truncate">
                  {v.make} {v.model}
                </p>
                <p className="text-xs text-[#6b7280]">
                  CHF {v.price.toLocaleString("de-CH")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Hinweis:** Das Flyout braucht `allVehicles` als Prop, um IDs zu Fahrzeugdaten aufzulösen. Da der Header ein Client Component ist, muss das Fahrzeug-Array entweder über einen Context oder als Prop durchgereicht werden. Alternative: Fahrzeugdaten direkt im localStorage mitcachen (neben IDs). Dies wird bei der Implementierung entschieden — einfachste Variante wählen.

**Step 2: Header — Icon einfügen**

In `Header.tsx`, neben `LocaleSwitcher` (Zeile ~60) das Flyout einbauen:

```tsx
<div className="hidden lg:flex items-center gap-2">
  <RecentlyViewedFlyout allVehicles={[]} /> {/* Prop-Lösung bei Implementierung */}
  <LocaleSwitcher />
  <a href="tel:+41566185544" ...>
```

**Step 3: Homepage — RecentlyViewed-Sektion entfernen**

In `app/[locale]/page.tsx`, Zeile ~659 entfernen:

```tsx
// ENTFERNEN:
// <RecentlyViewed allVehicles={allVehicles} />
```

**Step 4: Committen**

```bash
git add components/layout/RecentlyViewedFlyout.tsx components/layout/Header.tsx app/[locale]/page.tsx
git commit -m "feat: Zuletzt angesehen als Icon+Flyout im Header, von Homepage entfernt"
```

---

### Task 7: Google Reviews weiter oben auf Homepage

**Files:**
- Modify: `app/[locale]/page.tsx`

**Step 1: Reviews-Sektion verschieben**

Die Google Reviews Sektion (Zeilen ~405-491) ausschneiden und direkt nach dem USP-Bar (Zeile ~209) einfügen. Neue Reihenfolge:

1. Hero
2. USP Bar
3. **Google Reviews** ← hierher verschoben
4. Featured Vehicles
5. How it works
6. Services Teaser
7. Inzahlungnahme Teaser
8. Brand Logos
9. Contact

**Step 2: Committen**

```bash
git add app/[locale]/page.tsx
git commit -m "feat: Google Reviews direkt nach Hero/USP platzieren"
```

---

### Task 8: "Kein Fahrzeug gefunden" → Sourcing-Weiterleitung

**Files:**
- Modify: `components/vehicles/AutosContent.tsx:97-138`
- Modify: `lib/tracking.ts` (form_type erweitern)

**Step 1: Sourcing-CTA nach Vorschlägen hinzufügen**

In `AutosContent.tsx`, nach dem `suggestions`-Block (Zeile ~137), einen Sourcing-Block einfügen:

```tsx
{/* Sourcing CTA */}
<div className="mt-10 max-w-lg mx-auto bg-ct-light rounded-2xl p-6 text-center">
  <h4 className="text-lg font-extrabold text-ct-dark mb-2">
    Wir finden Ihr Traumauto!
  </h4>
  <p className="text-sm text-[#6b7280] mb-4 leading-relaxed">
    Beschreiben Sie uns Ihr Wunschfahrzeug — wir suchen aktiv für Sie und melden uns,
    sobald wir einen Treffer haben.
  </p>
  <SourcingMiniForm />
</div>
```

**Step 2: SourcingMiniForm als inline Component**

Direkt in `AutosContent.tsx` oder als separate Komponente:

```tsx
function SourcingMiniForm() {
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          subject: "Fahrzeug-Sourcing-Anfrage",
          message: `Fahrzeugwunsch: ${desc}\nE-Mail: ${email}`,
        }),
      });
      if (res.ok) {
        trackEvent({ event: "lead_form_submit", form_type: "sourcing", value: 50 });
      }
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <CheckCircle2 size={28} style={{ color: "var(--ct-green)" }} />
        <p className="text-sm font-semibold text-ct-dark">Anfrage gesendet!</p>
        <p className="text-xs text-[#6b7280]">Wir melden uns bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <input
        required type="email" placeholder="Ihre E-Mail-Adresse *"
        value={email} onChange={(e) => setEmail(e.target.value)}
        className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1
                   focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <textarea
        required placeholder="Welches Fahrzeug suchen Sie? (Marke, Modell, Budget…) *"
        rows={3} value={desc} onChange={(e) => setDesc(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg resize-none
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1
                   focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <button type="submit" disabled={status === "loading"}
        className="w-full py-2.5 rounded-xl text-white text-sm font-semibold
                   hover:opacity-90 transition-opacity disabled:opacity-60 bg-ct-cyan">
        {status === "loading" ? "Wird gesendet…" : "Wunschfahrzeug anfragen"}
      </button>
      {status === "error" && (
        <p className="text-xs text-center" style={{ color: "var(--ct-magenta)" }}>
          Fehler. Bitte anrufen: +41 56 618 55 44
        </p>
      )}
    </form>
  );
}
```

**Step 3: form_type erweitern**

In `lib/tracking.ts`, `"sourcing"` zu `form_type` hinzufügen:

```tsx
form_type: "vdp_contact" | "test_drive" | "general_contact" | "service"
         | "firmenkunden" | "ankauf" | "price_alert" | "sourcing";
```

**Step 4: Committen**

```bash
git add components/vehicles/AutosContent.tsx lib/tracking.ts
git commit -m "feat: Sourcing-CTA bei 'Kein Fahrzeug gefunden'"
```

---

### Task 9: Mobile First Durchgang

**Files:**
- Modify: Alle in Tasks 1-8 geänderten Dateien
- Schwerpunkt: `VehicleFilter.tsx`, `VehicleGallery.tsx`, `InquiryModal.tsx`, `RecentlyViewedFlyout.tsx`

**Step 1: Modals — Fullscreen auf Mobile**

Für `InquiryModal` und `TestDriveModal`: Auf Mobile fullscreen statt zentriert:

```tsx
<div className="fixed inset-0 sm:inset-x-4 sm:inset-y-auto sm:top-1/2 sm:-translate-y-1/2
               max-w-md sm:mx-auto bg-white sm:rounded-2xl shadow-2xl z-50 p-6
               overflow-y-auto"
     role="dialog" aria-modal="true">
```

**Step 2: Touch-Targets prüfen**

Alle Buttons und Links: `min-h-[44px]` sicherstellen. Besonders:
- Filter-Dropdowns: `h-10` (40px) → `h-11` (44px) auf Mobile
- Toggle-Buttons im Leasingrechner
- Spec-Boxes: Touch-freundlich

**Step 3: Bilder-Swipe auf Mobile**

In `VehicleGallery.tsx`: Swipe-Navigation für Mobile prüfen. Falls Thumbnails auf Mobile zu klein, auf Dot-Navigation umstellen.

**Step 4: Filter auf Mobile als Bottom-Sheet**

Optional: Filter auf Mobile als ausklappbares Panel von unten statt als kompakte Zeile. Mindestens:
- "Filter"-Button prominent mit Badge (Anzahl aktive Filter)
- Tap öffnet expandiertes Filter-Panel

**Step 5: Visuell testen**

Run: Dev-Server → Chrome DevTools → Responsive Mode (iPhone 14, Galaxy S21)
Alle 8 Features auf Mobile durchgehen.

**Step 6: Committen**

```bash
git add -u
git commit -m "feat: Mobile First Optimierung für alle Phase-A Features"
```
