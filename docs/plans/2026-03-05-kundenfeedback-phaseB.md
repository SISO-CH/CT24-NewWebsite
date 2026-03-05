# Kundenfeedback Phase B Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 10 Features mittlerer Komplexität umsetzen: Wishlist, Inzahlungnahme, Team, Social Proof, PDF, Sprachen, Animationen, Verknappung, Mobile, B2B-Händlerseite.

**Architecture:** Primär Frontend-Erweiterungen an bestehenden Komponenten. Neue API-Routes für View-Counter und Inzahlungnahme-Schätzung. Vercel KV für View-Zähler. jsPDF für clientseitige PDF-Generierung. next-intl Erweiterung um 5 Sprachen.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind v4, lucide-react, @vercel/kv, jsPDF, next-intl

---

### Task 1: Wishlist — localStorage Store + Hook

**Files:**
- Create: `lib/wishlist.ts`
- Create: `hooks/useWishlist.ts`

**Step 1: Wishlist Store erstellen**

```tsx
// lib/wishlist.ts
const KEY = "ct24_wishlist";
const MAX = 20;

export interface WishlistVehicle {
  id: number;
  make: string;
  model: string;
  price: number;
  image: string;
}

export function getWishlist(): WishlistVehicle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WishlistVehicle[]) : [];
  } catch { return []; }
}

export function addToWishlist(vehicle: WishlistVehicle): void {
  if (typeof window === "undefined") return;
  const items = getWishlist();
  if (items.some((v) => v.id === vehicle.id)) return;
  const next = [vehicle, ...items].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("ct24_wishlist_changed"));
}

export function removeFromWishlist(id: number): void {
  if (typeof window === "undefined") return;
  const items = getWishlist().filter((v) => v.id !== id);
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("ct24_wishlist_changed"));
}

export function isInWishlist(id: number): boolean {
  return getWishlist().some((v) => v.id === id);
}
```

**Step 2: React Hook erstellen**

```tsx
// hooks/useWishlist.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { getWishlist, addToWishlist, removeFromWishlist, isInWishlist, type WishlistVehicle } from "@/lib/wishlist";

export function useWishlist() {
  const [items, setItems] = useState<WishlistVehicle[]>([]);

  useEffect(() => {
    setItems(getWishlist());
    const handler = () => setItems(getWishlist());
    window.addEventListener("ct24_wishlist_changed", handler);
    return () => window.removeEventListener("ct24_wishlist_changed", handler);
  }, []);

  const toggle = useCallback((vehicle: WishlistVehicle) => {
    if (isInWishlist(vehicle.id)) {
      removeFromWishlist(vehicle.id);
    } else {
      addToWishlist(vehicle);
    }
  }, []);

  return { items, toggle, isInWishlist };
}
```

**Step 3: Committen**

```bash
git add lib/wishlist.ts hooks/useWishlist.ts
git commit -m "feat: Wishlist localStorage store + useWishlist hook"
```

---

### Task 2: Wishlist — Heart-Icon auf VehicleCard + VDP

**Files:**
- Create: `components/vehicles/WishlistHeart.tsx`
- Modify: `components/vehicles/VehicleCard.tsx` (Heart einfügen)
- Modify: `app/[locale]/autos/[id]/page.tsx` (Heart auf VDP)

**Step 1: WishlistHeart Component erstellen**

```tsx
// components/vehicles/WishlistHeart.tsx
"use client";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import type { WishlistVehicle } from "@/lib/wishlist";

interface Props {
  vehicle: WishlistVehicle;
  size?: number;
  className?: string;
}

export default function WishlistHeart({ vehicle, size = 18, className = "" }: Props) {
  const { toggle, isInWishlist } = useWishlist();
  const active = isInWishlist(vehicle.id);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(vehicle); }}
      className={`p-2 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
        active ? "bg-white/90 text-[var(--ct-magenta)]" : "bg-black/30 text-white hover:bg-black/50"
      } ${className}`}
      aria-label={active ? "Von Merkliste entfernen" : "Zur Merkliste hinzufügen"}
    >
      <Heart size={size} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
```

**Step 2: In VehicleCard einfügen**

In `VehicleCard.tsx`, nach dem Fuel-Badge (Zeile ~51) und vor CompareToggle (Zeile ~54), das Heart-Icon einfügen:

```tsx
import WishlistHeart from "@/components/vehicles/WishlistHeart";

// Im Bild-Container, absolute positioniert:
<div className="absolute top-2 right-2 z-10">
  <WishlistHeart vehicle={{ id: vehicle.id, make: vehicle.make, model: vehicle.model, price: vehicle.price, image: vehicle.images?.[0] ?? "" }} size={16} />
</div>
```

**Step 3: Auf VDP einfügen**

In `page.tsx`, neben dem Fahrzeugtitel oder in der CTA-Sidebar ein Heart-Icon hinzufügen (als Client Component Wrapper).

**Step 4: Committen**

```bash
git add components/vehicles/WishlistHeart.tsx components/vehicles/VehicleCard.tsx app/[locale]/autos/[id]/page.tsx
git commit -m "feat: Wishlist Heart-Icon auf VehicleCard + VDP"
```

---

### Task 3: Wishlist — Header-Flyout + Merkliste-Seite

**Files:**
- Create: `components/layout/WishlistFlyout.tsx`
- Create: `app/[locale]/merkliste/page.tsx`
- Modify: `components/layout/Header.tsx` (Flyout einfügen)

**Step 1: WishlistFlyout erstellen**

Gleicher Pattern wie `RecentlyViewedFlyout.tsx`, aber mit Heart-Icon statt Clock. Zeigt gespeicherte Fahrzeuge. Link "Alle anzeigen" → `/merkliste`.

**Step 2: Merkliste-Seite erstellen**

```tsx
// app/[locale]/merkliste/page.tsx
import type { Metadata } from "next";
import MerklisteContent from "@/components/vehicles/MerklisteContent";

export const metadata: Metadata = {
  title: "Merkliste",
  description: "Ihre gemerkten Fahrzeuge bei Car Trade24.",
};

export default function MerklistePage() {
  return (
    <section className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ct-dark mb-8">Ihre Merkliste</h1>
        <MerklisteContent />
      </div>
    </section>
  );
}
```

`MerklisteContent` ist ein Client Component das `useWishlist()` nutzt und VehicleCards rendert. Wenn leer: "Noch keine Fahrzeuge gemerkt" + Link zu `/autos`.

**Step 3: In Header einfügen**

Neben `RecentlyViewedFlyout`, das `WishlistFlyout` einfügen.

**Step 4: Committen**

```bash
git add components/layout/WishlistFlyout.tsx app/[locale]/merkliste/page.tsx components/layout/Header.tsx
git commit -m "feat: Wishlist Flyout im Header + Merkliste-Seite"
```

---

### Task 4: Social Proof — View-Counter API + Anzeige

**Files:**
- Create: `app/api/vehicle-views/route.ts`
- Create: `components/vehicles/ViewCounter.tsx`
- Modify: `components/vehicles/TrackVehicleView.tsx` (View zählen)
- Modify: `components/vehicles/VehicleCard.tsx` (Counter anzeigen)

**Step 1: API-Route für View-Counter**

```tsx
// app/api/vehicle-views/route.ts
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { vehicleId } = await req.json();
  if (!vehicleId) return NextResponse.json({ error: "missing vehicleId" }, { status: 400 });
  const key = `views:${vehicleId}`;
  const count = await kv.incr(key);
  if (count === 1) await kv.expire(key, 86400); // 24h TTL
  return NextResponse.json({ count });
}

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) return NextResponse.json({});
  const keys = ids.split(",").map((id) => `views:${id}`);
  const counts = await kv.mget<(number | null)[]>(...keys);
  const result: Record<string, number> = {};
  ids.split(",").forEach((id, i) => { result[id] = counts[i] ?? 0; });
  return NextResponse.json(result);
}
```

**Step 2: TrackVehicleView erweitern**

In `TrackVehicleView.tsx`, beim `vehicle_view` Event auch den Counter inkrementieren:

```tsx
fetch("/api/vehicle-views", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ vehicleId: id }),
}).catch(() => {});
```

**Step 3: ViewCounter Component**

```tsx
// components/vehicles/ViewCounter.tsx
"use client";
import { Eye } from "lucide-react";

export default function ViewCounter({ count }: { count: number }) {
  if (count <= 3) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-[#6b7280]">
      <Eye size={12} />
      <span>{count}× angesehen heute</span>
    </div>
  );
}
```

**Step 4: In VehicleCard + VDP integrieren**

View-Counts batch-laden auf der Fahrzeugliste (ein GET-Request mit allen IDs) und als Prop durchreichen.

**Step 5: Committen**

```bash
git add app/api/vehicle-views/route.ts components/vehicles/ViewCounter.tsx components/vehicles/TrackVehicleView.tsx components/vehicles/VehicleCard.tsx
git commit -m "feat: Social Proof View-Counter mit Vercel KV"
```

---

### Task 5: Verknappung — Badges auf VehicleCard

**Files:**
- Modify: `components/vehicles/VehicleCard.tsx`
- Modify: `lib/vehicles.ts` oder `lib/as24.ts` (createdAt / previousPrice prüfen)

**Step 1: Badge-Logik implementieren**

In `VehicleCard.tsx`, Badges basierend auf echten Daten:

```tsx
// "Neu eingetroffen" — < 7 Tage alt
const isNew = vehicle.createdAt && (Date.now() - new Date(vehicle.createdAt).getTime()) < 7 * 86400000;

// "Preisreduziert" — previousPrice vorhanden und höher als aktueller Preis
const isReduced = vehicle.previousPrice && vehicle.previousPrice > vehicle.price;

// "Beliebt" — viewCount > 10
const isPopular = (viewCount ?? 0) > 10;
```

Badges als Overlay oben-links auf dem Bild (unter dem Condition-Badge):

```tsx
<div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
  {/* Bestehender Condition Badge */}
  {isNew && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[var(--ct-green)]">Neu eingetroffen</span>}
  {isReduced && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[var(--ct-magenta)]">Preisreduziert</span>}
  {isPopular && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[var(--ct-cyan)]">Beliebt</span>}
</div>
```

**Step 2: Preis-Anzeige bei Reduzierung**

Wenn `previousPrice` vorhanden, alter Preis durchgestrichen + Differenz anzeigen:

```tsx
{isReduced && (
  <span className="text-xs text-[#9ca3af] line-through mr-2">
    CHF {vehicle.previousPrice!.toLocaleString("de-CH")}
  </span>
)}
<span className="text-lg font-black text-ct-dark">
  CHF {vehicle.price.toLocaleString("de-CH")}
</span>
{isReduced && (
  <span className="text-xs font-semibold text-[var(--ct-green)] ml-1">
    −{((vehicle.previousPrice! - vehicle.price) / vehicle.previousPrice! * 100).toFixed(0)}%
  </span>
)}
```

**Step 3: Vehicle-Typ erweitern**

In `lib/vehicles.ts`, `createdAt` und `previousPrice` zum Vehicle-Interface hinzufügen (falls nicht vorhanden). In `lib/as24.ts` prüfen ob AS24 diese Felder liefert und mappen.

**Step 4: "Nur noch X verfügbar" — Modell-Zählung**

Auf der Fahrzeugliste zählen wie viele Fahrzeuge desselben Modells vorhanden sind. Wenn ≤ 2:

```tsx
{modelCount <= 2 && <span className="text-[10px] text-[var(--ct-magenta)] font-semibold">Nur noch {modelCount}×</span>}
```

**Step 5: Committen**

```bash
git add components/vehicles/VehicleCard.tsx lib/vehicles.ts lib/as24.ts
git commit -m "feat: Verknappungs-Badges (Neu, Preisreduziert, Beliebt, Nur noch X)"
```

---

### Task 6: Inzahlungnahme überarbeiten

**Files:**
- Create: `components/vehicles/TradeInModal.tsx`
- Create: `components/vehicles/TradeInTrigger.tsx`
- Create: `app/api/trade-in/estimate/route.ts`
- Modify: `app/[locale]/autos/[id]/page.tsx` (Button hinzufügen)
- Modify: `lib/tracking.ts` (form_type erweitern)

**Step 1: Schätzungs-API erstellen**

```tsx
// app/api/trade-in/estimate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchVehicles } from "@/lib/as24";

const CONDITION_FACTOR: Record<string, number> = {
  "Sehr gut": 0.80,
  "Gut": 0.75,
  "Befriedigend": 0.65,
  "Beschädigt": 0.50,
};

export async function POST(req: NextRequest) {
  const { make, model, year, mileage, condition } = await req.json();

  // AS24 Marktdaten: ähnliche Fahrzeuge suchen
  const allVehicles = await fetchVehicles();
  const similar = allVehicles.filter((v) =>
    v.make.toLowerCase() === make.toLowerCase() &&
    v.model.toLowerCase().includes(model.toLowerCase()) &&
    Math.abs(v.year - year) <= 2 &&
    Math.abs(v.mileage - mileage) < 30000
  );

  let estimate: number;
  let method: "market" | "ai";

  if (similar.length >= 2) {
    const avgPrice = similar.reduce((s, v) => s + v.price, 0) / similar.length;
    estimate = Math.round(avgPrice * (CONDITION_FACTOR[condition] ?? 0.70));
    method = "market";
  } else {
    // Fallback: Claude AI Schätzung
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{ role: "user", content:
        `Schätze den Inzahlungnahme-Wert in CHF für: ${make} ${model}, Jahrgang ${year}, ${mileage} km, Zustand: ${condition}. Antworte NUR mit einer Zahl (CHF Betrag, ohne Text).`
      }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "0";
    estimate = parseInt(text.replace(/\D/g, ""), 10) || 0;
    method = "ai";
  }

  return NextResponse.json({ estimate, method, similarCount: similar.length });
}
```

**Step 2: TradeInModal erstellen**

Modal mit 5-Feld-Formular (Marke, Modell, Jahrgang, km, Zustand). Submit → fetch `/api/trade-in/estimate` → Ergebnis anzeigen: "Geschätzter Wert: CHF XX'XXX". Button "Jetzt Anfrage senden" → POST `/api/contact` mit Fahrzeugdaten (Kauf + Inzahlungnahme).

Das Ziel-Fahrzeug (vom VDP) wird als Prop mitgegeben und im Formular angezeigt: "Sie interessieren sich für: [Marke Modell] — CHF XX'XXX".

**Step 3: TradeInTrigger + VDP-Integration**

Client Component mit Button "Inzahlungnahme" → öffnet TradeInModal. Auf VDP platzieren nach ReserveButton.

**Step 4: form_type erweitern**

In `lib/tracking.ts`: `"trade_in_estimate"` zu `form_type` hinzufügen.

**Step 5: Committen**

```bash
git add components/vehicles/TradeInModal.tsx components/vehicles/TradeInTrigger.tsx app/api/trade-in/estimate/route.ts app/[locale]/autos/[id]/page.tsx lib/tracking.ts
git commit -m "feat: Inzahlungnahme überarbeitet mit AS24-Marktdaten + KI-Schätzung"
```

---

### Task 7: Angebot als PDF

**Files:**
- Create: `components/vehicles/OfferPDFButton.tsx`
- Modify: `app/[locale]/autos/[id]/page.tsx` (Button hinzufügen)
- Modify: `package.json` (jspdf + html2canvas Dependencies)

**Step 1: Dependencies installieren**

```bash
npm install jspdf html2canvas-pro qrcode --legacy-peer-deps
npm install -D @types/qrcode --legacy-peer-deps
```

**Step 2: OfferPDFButton erstellen**

```tsx
// components/vehicles/OfferPDFButton.tsx
"use client";
import { useState } from "react";
import { FileDown } from "lucide-react";
import type { Vehicle } from "@/lib/vehicles";

interface Props {
  vehicle: Vehicle;
}

export default function OfferPDFButton({ vehicle }: Props) {
  const [loading, setLoading] = useState(false);

  async function generatePDF() {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const QRCode = await import("qrcode");

      const doc = new jsPDF("p", "mm", "a4");
      const w = doc.internal.pageSize.getWidth();

      // Logo + Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Car Trade24", 15, 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Bremgartenstrasse 67, 5610 Wohlen | +41 56 618 55 44 | info@cartrade24.ch", 15, 27);
      doc.setDrawColor(0, 160, 227); // ct-cyan
      doc.line(15, 30, w - 15, 30);

      // Titel
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${vehicle.make} ${vehicle.model}`, 15, 42);

      // Fahrzeugbild (wenn verfügbar)
      let yPos = 50;
      if (vehicle.images?.[0]) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = vehicle.images[0];
          await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
          if (img.complete && img.naturalWidth > 0) {
            const imgW = w - 30;
            const imgH = imgW * 0.75; // 4:3
            doc.addImage(img, "JPEG", 15, yPos, imgW, imgH);
            yPos += imgH + 8;
          }
        } catch { /* skip image */ }
      }

      // Technische Daten
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Technische Daten", 15, yPos);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      const specs = [
        ["Marke / Modell", `${vehicle.make} ${vehicle.model}`],
        ["Baujahr", String(vehicle.year)],
        ["Kilometerstand", `${vehicle.mileage.toLocaleString("de-CH")} km`],
        ["Leistung", `${vehicle.power} PS`],
        ["Getriebe", vehicle.transmission],
        ["Treibstoff", vehicle.fuel],
        ["Antrieb", vehicle.drivetrain ?? "–"],
        ["Farbe", vehicle.color ?? "–"],
      ];

      specs.forEach(([label, value]) => {
        doc.text(label, 15, yPos);
        doc.text(value, 80, yPos);
        yPos += 5;
      });

      // Preis
      yPos += 5;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`CHF ${vehicle.price.toLocaleString("de-CH")}`, 15, yPos);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("inkl. 8.1% MwSt.", 15, yPos + 5);

      // Gültigkeit
      yPos += 15;
      const validUntil = new Date(Date.now() + 14 * 86400000).toLocaleDateString("de-CH");
      doc.setFontSize(8);
      doc.text(`Angebot gültig bis: ${validUntil} | Unverbindliche Preisempfehlung, Änderungen vorbehalten.`, 15, yPos);

      // QR-Code
      const url = `https://cartrade24.ch/autos/${vehicle.id}`;
      const qrDataUrl = await QRCode.toDataURL(url, { width: 100, margin: 1 });
      doc.addImage(qrDataUrl, "PNG", w - 40, yPos - 20, 25, 25);

      // Save
      doc.save(`CarTrade24_Angebot_${vehicle.make}_${vehicle.model}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={generatePDF}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#e5e7eb]
                 text-sm font-semibold text-[#374151] hover:bg-ct-light transition-colors disabled:opacity-50"
    >
      <FileDown size={15} />
      {loading ? "PDF wird erstellt…" : "Als PDF speichern"}
    </button>
  );
}
```

**Step 3: Auf VDP einfügen**

In `page.tsx`, nach dem Leasingrechner:

```tsx
<OfferPDFButton vehicle={vehicle} />
```

**Step 4: Committen**

```bash
git add components/vehicles/OfferPDFButton.tsx app/[locale]/autos/[id]/page.tsx package.json package-lock.json
git commit -m "feat: VDP Angebot als PDF generieren"
```

---

### Task 8: Personal auf Homepage

**Files:**
- Modify: `lib/team.ts` (5 Personen)
- Modify: `app/[locale]/page.tsx` (Team-Sektion einfügen)

**Step 1: Team-Daten auf 5 Personen erweitern**

```tsx
// lib/team.ts
export interface TeamMember {
  name: string;
  initials: string;
  role: string;
  phone?: string;
  image?: string; // Platzhalter bis echte Fotos kommen
}

export const TEAM: TeamMember[] = [
  { name: "Besnik Rulani",    initials: "BR", role: "Geschäftsführer",  phone: "+41 56 618 55 44" },
  { name: "Ligia Apolinatio", initials: "LA", role: "Administration" },
  { name: "Patry Trybek",    initials: "PT", role: "Verkaufsberater" },
  { name: "Claire Dubler",   initials: "CD", role: "Administration" },
  { name: "Mitarbeiter 5",   initials: "M5", role: "Verkaufsberater" },
];
```

**Step 2: Team-Sektion auf Homepage**

Nach "How it works", vor "Services Teaser" einfügen:

```tsx
{/* Team */}
<section className="py-16 md:py-24 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <FadeIn>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2"
         style={{ color: "var(--ct-cyan)" }}>Unser Team</p>
      <h2 className="text-3xl font-extrabold mb-12" style={{ color: "var(--ct-dark)" }}>
        Ihre Ansprechpartner
      </h2>
    </FadeIn>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      {TEAM.map((m, i) => (
        <FadeIn key={m.name} delay={i * 80}>
          <div className="flex flex-col items-center">
            {m.image ? (
              <Image src={m.image} alt={m.name} width={96} height={96}
                     className="w-24 h-24 rounded-full object-cover mb-3" />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 text-xl font-bold text-white"
                   style={{ backgroundColor: "var(--ct-cyan)" }}>
                {m.initials}
              </div>
            )}
            <h3 className="font-bold text-sm text-ct-dark">{m.name}</h3>
            <p className="text-xs text-[#6b7280]">{m.role}</p>
            {m.phone && (
              <a href={`tel:${m.phone.replace(/\s/g, "")}`}
                 className="text-xs mt-1" style={{ color: "var(--ct-cyan)" }}>{m.phone}</a>
            )}
          </div>
        </FadeIn>
      ))}
    </div>
  </div>
</section>
```

**Step 3: Committen**

```bash
git add lib/team.ts app/[locale]/page.tsx
git commit -m "feat: Team-Sektion auf Homepage (5 Personen mit Platzhalter-Avataren)"
```

---

### Task 9: Animationen & Gamification

**Files:**
- Modify: `components/ui/FadeIn.tsx` (Varianten erweitern)
- Create: `components/ui/AnimatedCounter.tsx`
- Create: `components/ui/SuccessAnimation.tsx`
- Modify: `components/vehicles/VehicleCard.tsx` (Hover-Effekte)
- Modify: diverse Formulare (Success-Animation)

**Step 1: FadeIn erweitern**

```tsx
// Neue Directions hinzufügen:
direction?: "up" | "down" | "left" | "right" | "none" | "scale";

// Transform-Map:
const transforms: Record<string, string> = {
  up: "translateY(24px)",
  down: "translateY(-24px)",
  left: "translateX(-24px)",
  right: "translateX(24px)",
  scale: "scale(0.95)",
  none: "none",
};
```

**Step 2: AnimatedCounter erstellen**

```tsx
// components/ui/AnimatedCounter.tsx
"use client";
import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

interface Props {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({ target, duration = 1500, prefix = "", suffix = "", className = "" }: Props) {
  const { ref, inView } = useInView();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref} className={className}>{prefix}{count.toLocaleString("de-CH")}{suffix}</span>;
}
```

**Step 3: VehicleCard Hover-Effekte**

Zum bestehenden Card-Container hinzufügen:

```tsx
className="... transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
```

**Step 4: SuccessAnimation für Formulare**

Animierte Checkmark-SVG statt statischem `CheckCircle2`:

```tsx
// components/ui/SuccessAnimation.tsx
"use client";
export default function SuccessAnimation({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" className="animate-success">
      <circle cx="26" cy="26" r="24" fill="none" stroke="var(--ct-green)" strokeWidth="2"
              className="animate-[circle_0.6s_ease-in-out_forwards]" />
      <path fill="none" stroke="var(--ct-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            d="M14 27l7 7 16-16" className="animate-[check_0.3s_0.6s_ease-in-out_forwards]"
            style={{ strokeDasharray: 50, strokeDashoffset: 50 }} />
      <style>{`
        @keyframes circle { to { stroke-dashoffset: 0; } }
        @keyframes check { to { stroke-dashoffset: 0; } }
        .animate-success circle { stroke-dasharray: 166; stroke-dashoffset: 166; }
      `}</style>
    </svg>
  );
}
```

**Step 5: Committen**

```bash
git add components/ui/FadeIn.tsx components/ui/AnimatedCounter.tsx components/ui/SuccessAnimation.tsx components/vehicles/VehicleCard.tsx
git commit -m "feat: Animationen & Gamification (FadeIn-Varianten, Counter, Hover, Success)"
```

---

### Task 10: Sprachen erweitern (ES, PL, SK, PT, SQ)

**Files:**
- Modify: `i18n/routing.ts` (Locales erweitern)
- Create: `messages/es.json`, `messages/pl.json`, `messages/sk.json`, `messages/pt.json`, `messages/sq.json`
- Modify: `components/layout/LocaleSwitcher.tsx` (Dropdown statt Inline)

**Step 1: Routing erweitern**

```tsx
// i18n/routing.ts
locales: ["de", "fr", "it", "en", "es", "pl", "sk", "pt", "sq"],
```

**Step 2: Übersetzungen generieren**

Für jede neue Sprache: `messages/de.json` als Basis nehmen und alle Werte via Claude AI übersetzen. Struktur und Keys beibehalten.

**Step 3: LocaleSwitcher auf Dropdown umstellen**

9 Sprachen sind zu viel für Inline-Buttons. Dropdown mit Sprachnamen in Landessprache:

```tsx
const LOCALE_NAMES: Record<string, string> = {
  de: "Deutsch", fr: "Français", it: "Italiano", en: "English",
  es: "Español", pl: "Polski", sk: "Slovenčina", pt: "Português", sq: "Shqip",
};
```

**Step 4: Committen**

```bash
git add i18n/routing.ts messages/*.json components/layout/LocaleSwitcher.tsx
git commit -m "feat: 5 neue Sprachen (ES, PL, SK, PT, SQ) + Dropdown-LocaleSwitcher"
```

---

### Task 11: Händler-Seite (B2B)

**Files:**
- Create: `app/[locale]/haendler/page.tsx`
- Create: `components/haendler/HaendlerForm.tsx`
- Modify: `components/layout/Header.tsx` oder `Footer.tsx` (Link hinzufügen)
- Modify: `lib/tracking.ts` (form_type erweitern)

**Step 1: Händler-Seite erstellen**

Route `/haendler` mit Sektionen:
1. Hero: "Fahrzeuge für Ihren Bestand" + CTA
2. Vorteile: 4 Cards (Grosse Auswahl, Händlerpreise, Schnelle Abwicklung, Ansprechpartner)
3. So funktioniert's: 3 Schritte (Anfragen → Zugang → Bestellen)
4. Services: 3 Cards (Vermarktung, Digitalisierung, KI) — sekundär
5. Kontaktformular: HaendlerForm

Gleicher Seitenaufbau-Pattern wie `/firmenkunden` aber mit B2B-Händler-Fokus.

**Step 2: HaendlerForm erstellen**

Felder: Firma, Ansprechpartner, E-Mail, Telefon, Nachricht.
Submit → POST `/api/contact` mit Subject "Händler-Account-Anfrage".
Tracking: `lead_form_submit` mit `form_type: "b2b_haendler"`.

**Step 3: Navigation erweitern**

Link "Für Händler" im Footer hinzufügen (nicht im Hauptmenü — Zielgruppe ist B2B).

**Step 4: form_type erweitern**

In `lib/tracking.ts`: `"b2b_haendler"` hinzufügen.

**Step 5: Committen**

```bash
git add app/[locale]/haendler/page.tsx components/haendler/HaendlerForm.tsx components/layout/Footer.tsx lib/tracking.ts
git commit -m "feat: B2B Händler-Seite mit Account-Anfrage"
```

---

### Task 12: Mobile First Durchgang Phase B

**Files:**
- Modify: Alle in Tasks 1-11 geänderten Dateien

**Step 1: Wishlist**
- Heart-Icon: min 44px Touch-Target, nicht überlappend mit Badges
- Merkliste-Seite: Cards einspaltig auf Mobile
- WishlistFlyout: Fullscreen auf Mobile

**Step 2: Modals**
- TradeInModal: Fullscreen auf Mobile (wie InquiryModal)
- Formulare: Inputs min h-11 auf Mobile

**Step 3: Team-Sektion**
- Horizontal scrollbar auf Mobile (oder 2-spaltig)

**Step 4: Badges**
- Nicht überlappen mit Heart-Icon
- Text lesbar auf kleinen Screens

**Step 5: LocaleSwitcher**
- Touch-freundliches Dropdown
- Ausreichend grosse Tap-Targets

**Step 6: PDF-Button**
- Prominent platziert, Touch-freundlich

**Step 7: Build + Commit**

```bash
npx next build
git add -u
git commit -m "feat: Mobile First Optimierung Phase B"
```
