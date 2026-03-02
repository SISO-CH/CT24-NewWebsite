# UX-Strukturoptimierung — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sektionsreihenfolge und -struktur aller Seiten nach Verkaufsfunnel-Logik optimieren — ohne Redesign.

**Architecture:** Reine JSX-Struktur-Änderungen in Page-Komponenten und einer Client-Komponente (VehicleMediaTabs). Kein neues Routing, keine neuen APIs, keine neuen Komponenten ausser einfachen Inline-Sektionen. Jeder Task ist eine in sich geschlossene Dateiänderung.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4, lucide-react

**Design-Referenz:** `docs/plans/2026-03-02-ux-strukturoptimierung-design.md`

---

## Verifikation

Da es sich um JSX-Struktur-Änderungen handelt, ist die Verifikation nach jedem Task:

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
```

Erwartet: `✓ Compiled successfully` — kein TypeScript- oder Build-Fehler.

Kein separates Unit-Test-Setup nötig. Visuelle Kontrolle über den laufenden Dev-Server (`http://localhost:3000`).

---

## Task 1: Homepage — Sektionen neu ordnen

**Ziel:** Services nach «So geht's», Inzahlungnahme vor Reviews verschieben.

**Datei:**
- Modify: `app/[locale]/page.tsx`

**Aktuelle Reihenfolge (relevant):**
1. Hero
2. USP-Bar
3. Fahrzeug-Highlights
4. So geht's (3 Schritte)
5. Google Reviews  ← falsch
6. Trust-Badges
7. Kontakt/Standort (dunkel)
8. Inzahlungnahme-Teaser (dunkel)  ← falsch
9. Services-Teaser  ← falsch
10. RecentlyViewed

**Neue Reihenfolge:**
1. Hero
2. USP-Bar
3. Fahrzeug-Highlights
4. So geht's
5. **Services-Teaser**  ← von 9 nach 5
6. **Inzahlungnahme-Teaser**  ← von 8 nach 6
7. **Google Reviews**  ← von 5 nach 7
8. Trust-Badges
9. Kontakt/Standort
10. RecentlyViewed

**Step 1: Sektionen in page.tsx umordnen**

Öffne `app/[locale]/page.tsx`. Die JSX-Blöcke sind durch Kommentarblöcke klar getrennt (`{/* ═══ ... ═══ */}`).

Schneide die gesamten Blöcke aus und füge sie in der neuen Reihenfolge ein:
- `{/* Services-Teaser */}` → direkt nach `{/* HOW IT WORKS */}`
- `{/* ── Inzahlungnahme Teaser ── */}` → direkt nach Services-Teaser
- `{/* Google Reviews */}` → direkt nach Inzahlungnahme-Teaser
- Rest bleibt (Trust, Contact, RecentlyViewed)

**Step 2: Build prüfen**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
```

Erwartet: `✓ Compiled successfully`

**Step 3: Commit**

```bash
cd /root/cartrade24 && git add app/[locale]/page.tsx && git commit -m "ux: reorder homepage sections per funnel (services, trade-in, reviews)"
```

---

## Task 2: VDP — Quick-Specs auf Baujahr/km/PS/Antrieb ändern

**Ziel:** Duplikate mit der Technischen-Daten-Tabelle eliminieren.

**Datei:**
- Modify: `app/[locale]/autos/[id]/page.tsx`

**Aktuelle Quick-Specs (Zeilen ~196–231):**
```tsx
{ icon: Gauge,    label: "Kilometerstand", value: `${vehicle.mileage.toLocaleString("de-CH")} km` },
{ icon: Zap,      label: "Leistung",       value: `${vehicle.power} PS` },
{ icon: Settings2,label: "Getriebe",       value: vehicle.transmission },
{ icon: Fuel,     label: "Kraftstoff",     value: vehicle.fuel ?? "–" },
```

**Neue Quick-Specs:**
```tsx
{ icon: CalendarDays, label: "Baujahr",        value: String(vehicle.year) },
{ icon: Gauge,        label: "Kilometerstand", value: `${vehicle.mileage.toLocaleString("de-CH")} km` },
{ icon: Zap,          label: "Leistung",        value: `${vehicle.power} PS` },
{ icon: GitMerge,     label: "Antrieb",         value: vehicle.drivetrain ?? "–" },
```

**Step 1: Import anpassen**

Am Anfang der Datei den lucide-react-Import ergänzen:
- `Settings2` und `Fuel` entfernen (werden nur in Quick-Specs genutzt — prüfen ob sonst noch verwendet)
- `CalendarDays` und `GitMerge` hinzufügen

Prüfen: `Fuel` und `Settings2` werden in der Datei ausschliesslich in den Quick-Specs verwendet (Suche mit Grep). Falls ja, aus dem Import entfernen.

**Step 2: Quick-Specs-Array ersetzen**

Die 4 Objekte im Array bei `{/* Quick specs */}` ersetzen wie oben gezeigt.

**Step 3: Build prüfen**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
```

**Step 4: Commit**

```bash
cd /root/cartrade24 && git add "app/[locale]/autos/[id]/page.tsx" && git commit -m "ux: vdp quick-specs show year/km/power/drivetrain (no table duplicates)"
```

---

## Task 3: VDP — Video als dritten Tab in VehicleMediaTabs

**Ziel:** `VideoWalkaround` nicht mehr als separate Sektion, sondern als Tab neben Fotos und 360°.

**Dateien:**
- Modify: `components/vehicles/VehicleMediaTabs.tsx`
- Modify: `app/[locale]/autos/[id]/page.tsx`

**Step 1: VehicleMediaTabs Props erweitern**

In `components/vehicles/VehicleMediaTabs.tsx`:

```tsx
interface Props {
  images:       string[];
  imageUrl360?: string;
  videoUrl?:    string;   // neu
  alt:          string;
}
```

Tab-Typ erweitern:
```tsx
const [tab, setTab] = useState<"gallery" | "360" | "video">("gallery");
```

Tab-Buttons: Video-Tab nur anzeigen wenn `videoUrl` vorhanden:
```tsx
const tabs = [
  { key: "gallery" as const, label: "Fotos",        Icon: Images    },
  ...(imageUrl360 ? [{ key: "360" as const,   label: "360°-Ansicht", Icon: RotateCcw }] : []),
  ...(videoUrl    ? [{ key: "video" as const, label: "Video",        Icon: Play      }] : []),
];
```

`Play` von lucide-react importieren.

Tab-Content für Video:
```tsx
{tab === "video" && videoUrl && <VideoWalkaround url={videoUrl} />}
```

`VideoWalkaround` importieren:
```tsx
import VideoWalkaround from "@/components/vehicles/VideoWalkaround";
```

useEffect für Tab-Reset erweitern:
```tsx
useEffect(() => {
  if (!imageUrl360 && tab === "360") setTab("gallery");
  if (!videoUrl    && tab === "video") setTab("gallery");
}, [imageUrl360, videoUrl]);
```

**Step 2: VDP-Seite anpassen**

In `app/[locale]/autos/[id]/page.tsx`:

`VehicleMediaTabs` das neue `videoUrl`-Prop übergeben:
```tsx
<VehicleMediaTabs
  images={allImages}
  imageUrl360={vehicle.imageUrl360}
  videoUrl={vehicle.videoUrl}
  alt={`${vehicle.make} ${vehicle.model}`}
/>
```

Den separaten `VideoWalkaround`-Block entfernen:
```tsx
// ENTFERNEN:
{vehicle.videoUrl && (
  <FadeIn delay={30}>
    <VideoWalkaround url={vehicle.videoUrl} />
  </FadeIn>
)}
```

`VideoWalkaround` bleibt im Import von `page.tsx` nicht mehr nötig — entfernen falls unused.

**Step 3: Build prüfen**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
```

**Step 4: Commit**

```bash
cd /root/cartrade24 && git add components/vehicles/VehicleMediaTabs.tsx "app/[locale]/autos/[id]/page.tsx" && git commit -m "ux: vdp video as third media tab, remove standalone video section"
```

---

## Task 4: VDP — Sidebar restrukturieren

**Ziel:** 8 Kontaktoptionen auf klare Hierarchie reduzieren. VDPContactForm und Matelso-Widget entfernen.

**Datei:**
- Modify: `app/[locale]/autos/[id]/page.tsx`

**Step 1: Imports bereinigen**

Nach den Änderungen werden `PhoneCall` (Matelso-Block) und `VDPContactForm` nicht mehr verwendet.
Prüfen und aus dem Import entfernen.

**Step 2: Sidebar-Inhalt neu aufbauen**

Den Bereich innerhalb von `<div className="space-y-4">` (rechte Spalte) wie folgt restrukturieren:

```tsx
<div className="rounded-2xl border border-[#e5e7eb] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">

  {/* Leasingpreis */}
  {vehicle.leasingPrice > 0 && (
    <div className="mb-5 pb-5 border-b border-[#f0f0f0]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#9ca3af] mb-1">Leasing ab</p>
      <p className="text-4xl font-black leading-none text-ct-magenta">
        CHF {formatCHF(vehicle.leasingPrice)}
        <span className="text-base font-normal text-[#9ca3af]">/Mt.</span>
      </p>
      <p className="text-xs text-[#9ca3af] mt-1">inkl. MwSt., vorbehaltlich Bonitätsprüfung</p>
    </div>
  )}

  {/* Kaufpreis */}
  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#9ca3af] mb-1">Kaufpreis</p>
  <div className="mb-4">
    <p className="text-2xl font-extrabold text-ct-dark">CHF {formatCHF(vehicle.price)}</p>
    <p className="text-[10px] text-[#9ca3af] mt-0.5">
      inkl. 8.1% MwSt.
      {vehicle.condition === "Occasion" && <> · Margenbesteuerung (fikt. Vorsteuerabzug)</>}
    </p>
  </div>

  {/* Marktpreisvergleich */}
  <div className="mb-5 pb-5 border-b border-[#f0f0f0]">
    <PriceComparison vehicle={vehicle} />
  </div>

  {/* USPs VOR den CTAs */}
  <div className="space-y-2 mb-5">
    {["Kostenlose Probefahrt möglich", "Bis zu 7 Jahre Garantie", "Schweizweite Lieferung"].map((t) => (
      <p key={t} className="flex items-center gap-2 text-sm text-[#4b5563]">
        <CheckCircle2 size={14} className="shrink-0 text-ct-green" />
        {t}
      </p>
    ))}
  </div>

  {/* CTAs */}
  <div className="space-y-2.5 mb-5">
    {/* Primär */}
    <Link
      href={`/kontakt?betreff=Fahrzeuganfrage&modell=${encodeURIComponent(`${vehicle.make} ${vehicle.model}`)}`}
      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity bg-ct-cyan"
    >
      Jetzt anfragen <ArrowRight size={15} />
    </Link>

    {/* Sekundär: Probefahrt + WhatsApp nebeneinander */}
    <div className="grid grid-cols-2 gap-2">
      <TestDriveTrigger vehicleLabel={vehicleLabel} />
      <a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "41791234567"}?text=${encodeURIComponent(`Guten Tag, ich interessiere mich für den ${vehicleLabel} (CHF ${formatCHF(vehicle.price)}).`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "#25D366" }}
      >
        <MessageCircle size={14} /> WhatsApp
      </a>
    </div>

    {/* Reservieren */}
    {isReserved ? (
      <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#f3f4f6] text-[#9ca3af] text-sm font-semibold">
        <Lock size={14} /> Aktuell reserviert
      </div>
    ) : (
      <ReserveButton vehicleId={vehicle.id} vehicleLabel={vehicleLabel} locale={locale} />
    )}

    {/* Anrufen als Textlink */}
    <a
      href="tel:+41566185544"
      className="flex items-center justify-center gap-1.5 w-full py-2 text-sm text-[#9ca3af] hover:text-ct-cyan transition-colors"
    >
      <Phone size={13} /> +41 56 618 55 44
    </a>
  </div>

  {/* Leasingrechner ausklappbar */}
  <details className="group border-t border-[#f0f0f0] pt-4 mb-4">
    <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-semibold text-[#6b7280] hover:text-ct-cyan transition-colors mb-3">
      Monatsrate berechnen
      <span className="text-[10px] group-open:rotate-180 transition-transform">▾</span>
    </summary>
    <LeasingCalculator fixedPrice={vehicle.price} showLink={true} />
  </details>

  {/* Cardossier */}
  {vehicle.cardossierUrl && (
    <a
      href={vehicle.cardossierUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#e5e7eb] text-sm font-semibold text-ct-dark hover:border-ct-cyan hover:text-ct-cyan transition-colors"
    >
      <ExternalLink size={14} /> Cardossier ansehen
    </a>
  )}
</div>

{/* CarVertical — nur Occasionen */}
{vehicle.condition !== "Neuwagen" && (
  <div className="rounded-xl border border-[#e5e7eb] p-5">
    {/* ...unveränderter CarVertical-Block... */}
  </div>
)}

{/* Preisalarm */}
<PriceAlertForm filtersJson={JSON.stringify({ make: vehicle.make })} />
```

**Entfernt:**
- Ganzer `<details>` Block mit `VDPContactForm`
- Ganzer Matelso-Rückruf-Block (`<div className="rounded-xl overflow-hidden border...">`)
- Standalone WhatsApp-Button (jetzt im 2er-Grid mit Probefahrt)

**Step 3: Unused imports entfernen**

Nach den Änderungen prüfen ob noch verwendet:
- `PhoneCall` → entfernen (war nur Matelso-Widget)
- `VDPContactForm` → entfernen

**Step 4: Build prüfen**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
```

**Step 5: Commit**

```bash
cd /root/cartrade24 && git add "app/[locale]/autos/[id]/page.tsx" && git commit -m "ux: vdp sidebar hierarchy — usps first, 3 ctas, leasing collapsible, remove inline form + matelso widget"
```

---

## Task 5: Inzahlungnahme — USPs vor Wizard verschieben

**Datei:**
- Modify: `app/[locale]/inzahlungnahme/page.tsx`

**Step 1: Sektionen neu ordnen**

Aktuelle Reihenfolge: Header → Wizard → USPs
Neue Reihenfolge: Header → USPs → Wizard

Den gesamten `{/* USPs */}`-Block (Sektion mit `py-12 bg-ct-light`) ausschneiden und zwischen Header-Sektion und Wizard-Sektion einfügen.

Die USP-Sektion erhält keinen `border-t` mehr (da sie nun in der Mitte liegt):
```tsx
// border-t border-[#e5e7eb] entfernen, da nicht mehr letztes Element
<section className="py-12 bg-ct-light">
```

**Step 2: Build prüfen**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
```

**Step 3: Commit**

```bash
cd /root/cartrade24 && git add "app/[locale]/inzahlungnahme/page.tsx" && git commit -m "ux: inzahlungnahme — usps before wizard (persuade then act)"
```

---

## Task 6: Kontakt — Probefahrt-Sektion entfernen

**Datei:**
- Modify: `app/[locale]/kontakt/page.tsx`

**Step 1: Probefahrt-Sektion entfernen**

Den gesamten `{/* Probefahrt buchen */}` Block entfernen:
```tsx
// ENTFERNEN (ca. Zeilen 31–50):
<section className="py-12 bg-[var(--ct-light)]">
  ...
  {isMatelsoConfigured ? <MatelsoBookingWidget ... /> : <p>...</p>}
</section>
```

**Step 2: Unused imports entfernen**

`MatelsoBookingWidget` und `isMatelsoConfigured` werden nicht mehr verwendet → aus dem Import entfernen.

**Step 3: Build prüfen**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
```

**Step 4: Commit**

```bash
cd /root/cartrade24 && git add "app/[locale]/kontakt/page.tsx" && git commit -m "ux: remove test-drive section from contact page (dedicated /probefahrt page exists)"
```

---

## Task 7: Probefahrt — Page-Header + USPs + Prozessschritte ergänzen

**Datei:**
- Modify: `app/[locale]/probefahrt/page.tsx`

**Step 1: Seite vollständig ersetzen**

```tsx
import type { Metadata } from "next";
import { Car, CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

export const metadata: Metadata = {
  title: "Probefahrt buchen — Car Trade24",
  description: "Buchen Sie online eine kostenlose Probefahrt bei Car Trade24 in Wohlen. Unverbindlich, kein Kaufzwang.",
};

const usps = [
  "Kostenlos und unverbindlich",
  "Kein Kaufzwang",
  "Wunschfahrzeug wählbar",
];

const steps = [
  { num: "01", title: "Fahrzeug angeben", desc: "Teilen Sie uns mit, welches Fahrzeug Sie probefahren möchten." },
  { num: "02", title: "Termin bestätigen", desc: "Wir melden uns innert 24h und bestätigen Ihren Wunschtermin." },
  { num: "03", title: "Probefahrt geniessen", desc: "Einfach vorbeikommen — Ringstrasse 26, 5610 Wohlen." },
];

export default function ProbefahrtPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
            Kostenlos &amp; unverbindlich
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-ct-dark">
            Probefahrt buchen.
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Erleben Sie Ihr Wunschfahrzeug auf der Strasse — kostenlos, ohne Druck, direkt bei uns in Wohlen.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {usps.map((u) => (
              <span key={u} className="flex items-center gap-1.5 text-sm text-[#4b5563]">
                <CheckCircle2 size={14} className="text-ct-green shrink-0" />{u}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Prozessschritte */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">So einfach geht's</p>
              <h2 className="text-2xl font-extrabold text-ct-dark">In 3 Schritten zur Probefahrt</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 100}>
                <div className="text-center p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-5xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {s.num}
                  </p>
                  <h3 className="font-bold text-base mb-2 text-ct-dark">{s.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Formular */}
      <section className="py-14 bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">Anfrage</p>
            <h2 className="text-3xl font-extrabold mb-2 text-ct-dark">Jetzt Termin anfragen</h2>
            <p className="text-[#6b7280] text-sm mb-8">Wir antworten innert 24 Stunden.</p>
          </FadeIn>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <ServiceContactForm subject="Probefahrtanfrage" fields={["Gewünschtes Fahrzeug"]} />
          </div>
        </div>
      </section>
    </>
  );
}
```

**Step 2: Build prüfen**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
```

**Step 3: Commit**

```bash
cd /root/cartrade24 && git add "app/[locale]/probefahrt/page.tsx" && git commit -m "ux: probefahrt page — add header, usps, process steps"
```

---

## Task 8: Home Delivery — Page-Header + USPs + Prozessschritte ergänzen

**Datei:**
- Modify: `app/[locale]/home-delivery/page.tsx`

**Step 1: Seite vollständig ersetzen**

Gleiche Struktur wie Task 7, inhaltlich angepasst:

```tsx
import type { Metadata } from "next";
import { Truck, CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

export const metadata: Metadata = {
  title: "Home Delivery — Car Trade24",
  description: "Ihr neues Auto wird direkt zu Ihnen geliefert. Bis 50 km kostenlos — schweizweit möglich.",
};

const usps = [
  "Bis 50 km ab Wohlen kostenlos",
  "Terminwahl nach Ihren Wünschen",
  "Vollversichertes Fahrzeug bei Lieferung",
];

const steps = [
  { num: "01", title: "Fahrzeug wählen",       desc: "Wählen Sie Ihr Traumauto aus unserem Bestand aus." },
  { num: "02", title: "Termin vereinbaren",    desc: "Wir stimmen Lieferdatum und -ort mit Ihnen ab." },
  { num: "03", title: "Lieferung entgegennehmen", desc: "Wir bringen das Fahrzeug direkt vor Ihre Haustür." },
];

export default function HomeDeliveryPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
            Home Delivery
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-ct-dark">
            Ihr neues Auto.<br />Direkt zu Ihnen.
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Wir liefern Ihr Fahrzeug direkt an Ihre Adresse — bis 50 km kostenlos, schweizweit möglich.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {usps.map((u) => (
              <span key={u} className="flex items-center gap-1.5 text-sm text-[#4b5563]">
                <CheckCircle2 size={14} className="text-ct-green shrink-0" />{u}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">So läuft's ab</p>
              <h2 className="text-2xl font-extrabold text-ct-dark">In 3 Schritten zu Ihrer Lieferung</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 100}>
                <div className="text-center p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-5xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {s.num}
                  </p>
                  <h3 className="font-bold text-base mb-2 text-ct-dark">{s.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">Lieferanfrage</p>
            <h2 className="text-3xl font-extrabold mb-2 text-ct-dark">Lieferung anfragen</h2>
            <p className="text-[#6b7280] text-sm mb-8">Wir antworten innert 24 Stunden mit einem Liefertermin.</p>
          </FadeIn>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <ServiceContactForm subject="Home-Delivery-Anfrage" fields={["Fahrzeug / Inserat-Nr.", "Lieferadresse"]} />
          </div>
        </div>
      </section>
    </>
  );
}
```

**Step 2: Build prüfen + Commit**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
git add "app/[locale]/home-delivery/page.tsx" && git commit -m "ux: home-delivery page — add header, usps, process steps"
```

---

## Task 9: Zulassungsservice — Page-Header + USPs + Prozessschritte

**Datei:**
- Modify: `app/[locale]/zulassungsservice/page.tsx`

**Step 1: Seite vollständig ersetzen**

```tsx
import type { Metadata } from "next";
import { FileText, CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

export const metadata: Metadata = {
  title: "Zulassungsservice — Car Trade24",
  description: "Wir erledigen die Fahrzeugzulassung vollständig für Sie. Kein Behördengang, schnell und schweizweit.",
};

const usps = [
  "Kein Behördengang nötig",
  "Schnell und unkompliziert",
  "Schweizweit möglich",
];

const steps = [
  { num: "01", title: "Daten übermitteln",    desc: "Senden Sie uns Ihre Fahrzeug- und Personendaten via Formular." },
  { num: "02", title: "Wir erledigen alles",  desc: "Wir kümmern uns um alle Formalitäten mit dem Strassenverkehrsamt." },
  { num: "03", title: "Fahrzeug ist zugelassen", desc: "Sie erhalten Ihre Schilder und Dokumente direkt zugestellt." },
];

export default function ZulassungsservicePage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
            Zulassungsservice
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-ct-dark">
            Zulassung?<br />Erledigen wir für Sie.
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Kein Strassenverkehrsamt, kein Papierkram — wir übernehmen die komplette Zulassung Ihres Fahrzeugs.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {usps.map((u) => (
              <span key={u} className="flex items-center gap-1.5 text-sm text-[#4b5563]">
                <CheckCircle2 size={14} className="text-ct-green shrink-0" />{u}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">Ablauf</p>
              <h2 className="text-2xl font-extrabold text-ct-dark">In 3 Schritten zugelassen</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 100}>
                <div className="text-center p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-5xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {s.num}
                  </p>
                  <h3 className="font-bold text-base mb-2 text-ct-dark">{s.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">Anfrage</p>
            <h2 className="text-3xl font-extrabold mb-2 text-ct-dark">Zulassung beauftragen</h2>
            <p className="text-[#6b7280] text-sm mb-8">Wir antworten innert 24 Stunden.</p>
          </FadeIn>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <ServiceContactForm subject="Zulassungsservice-Anfrage" fields={["Fahrzeug / Inserat-Nr.", "Kanton"]} />
          </div>
        </div>
      </section>
    </>
  );
}
```

**Step 2: Build prüfen + Commit**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
git add "app/[locale]/zulassungsservice/page.tsx" && git commit -m "ux: zulassungsservice page — add header, usps, process steps"
```

---

## Task 10: Fahrzeug-Sourcing — Page-Header + USPs + Prozessschritte

**Datei:**
- Modify: `app/[locale]/fahrzeug-sourcing/page.tsx`

**Step 1: Seite vollständig ersetzen**

```tsx
import type { Metadata } from "next";
import { Search, CheckCircle2 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import ServiceContactForm from "@/components/ui/ServiceContactForm";

export const metadata: Metadata = {
  title: "Fahrzeug-Sourcing — Car Trade24",
  description: "Wir beschaffen Ihr Wunschauto — alle Marken, Schweiz und Import, ohne Aufpreis.",
};

const usps = [
  "Alle Marken und Modelle",
  "Schweiz und Import",
  "Kein Aufpreis auf Sourcing",
];

const steps = [
  { num: "01", title: "Wunsch definieren",    desc: "Teilen Sie uns Marke, Modell, Budget und Ausstattungswünsche mit." },
  { num: "02", title: "Wir suchen für Sie",   desc: "Wir durchsuchen unser Netzwerk und finden passende Fahrzeuge." },
  { num: "03", title: "Fahrzeug präsentieren", desc: "Wir stellen Ihnen Optionen vor — Sie entscheiden ohne Druck." },
];

export default function FahrzeugSourcingPage() {
  return (
    <>
      <section className="pt-24 pb-10 bg-ct-light border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">
            Fahrzeug-Sourcing
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-ct-dark">
            Wir finden<br />Ihr Wunschauto.
          </h1>
          <p className="text-[#6b7280] max-w-xl text-lg leading-relaxed">
            Nicht das Richtige im Bestand? Kein Problem — wir beschaffen Ihr Wunschfahrzeug aus unserem Netzwerk.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {usps.map((u) => (
              <span key={u} className="flex items-center gap-1.5 text-sm text-[#4b5563]">
                <CheckCircle2 size={14} className="text-ct-green shrink-0" />{u}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">Ablauf</p>
              <h2 className="text-2xl font-extrabold text-ct-dark">In 3 Schritten zum Wunschauto</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 100}>
                <div className="text-center p-6 rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  <p className="text-5xl font-black mb-3"
                     style={{ color: "var(--ct-light)", WebkitTextStroke: "2px var(--ct-cyan)" }}>
                    {s.num}
                  </p>
                  <h3 className="font-bold text-base mb-2 text-ct-dark">{s.title}</h3>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-ct-light border-t border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] mb-2 text-ct-cyan">Wunschauto anfragen</p>
            <h2 className="text-3xl font-extrabold mb-2 text-ct-dark">Jetzt Wunsch mitteilen</h2>
            <p className="text-[#6b7280] text-sm mb-8">Wir antworten innert 24 Stunden.</p>
          </FadeIn>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <ServiceContactForm subject="Fahrzeug-Sourcing-Anfrage" fields={["Marke & Modell", "Budget (CHF)", "Wichtigste Ausstattung"]} />
          </div>
        </div>
      </section>
    </>
  );
}
```

**Step 2: Build prüfen + Commit**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
git add "app/[locale]/fahrzeug-sourcing/page.tsx" && git commit -m "ux: fahrzeug-sourcing page — add header, usps, process steps"
```

---

## Task 11: Über uns — CTA am Ende ergänzen

**Datei:**
- Modify: `app/[locale]/ueber-uns/page.tsx`

**Step 1: CTA-Sektion nach dem Qualitätsprozess-Block anhängen**

```tsx
{/* CTA */}
<section className="py-12 bg-ct-light border-t border-[#e5e7eb]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <FadeIn>
      <h2 className="text-2xl font-extrabold mb-3 text-ct-dark">
        Überzeugt? Schauen Sie sich unsere Fahrzeuge an.
      </h2>
      <p className="text-[#6b7280] text-sm mb-6 max-w-md mx-auto">
        50–80 geprüfte Occasionen und Neuwagen — direkt ab Hof in Wohlen.
      </p>
      <Link
        href="/autos"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "var(--ct-cyan)" }}
      >
        Alle Fahrzeuge ansehen <ArrowRight size={15} />
      </Link>
    </FadeIn>
  </div>
</section>
```

`ArrowRight` ist bereits importiert. `Link` auch. Kein neuer Import nötig.

**Step 2: Build prüfen + Commit**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
git add "app/[locale]/ueber-uns/page.tsx" && git commit -m "ux: ueber-uns — add cta to vehicle listing at end"
```

---

## Task 12: FAQ — CTA am Ende ergänzen

**Datei:**
- Modify: `app/[locale]/faq/page.tsx`

**Step 1: CTA-Sektion nach dem letzten `<section>` (FAQ-Kategorien) anhängen**

```tsx
{/* CTA */}
<section className="py-12 bg-ct-light border-t border-[#e5e7eb]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <FadeIn>
      <h2 className="text-2xl font-extrabold mb-3 text-ct-dark">
        Noch eine Frage?
      </h2>
      <p className="text-[#6b7280] text-sm mb-6 max-w-md mx-auto">
        Wir helfen Ihnen gerne persönlich weiter — telefonisch, per Mail oder direkt vor Ort.
      </p>
      <Link
        href="/kontakt"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "var(--ct-cyan)" }}
      >
        Kontakt aufnehmen <ArrowRight size={15} />
      </Link>
    </FadeIn>
  </div>
</section>
```

`Link` und `ArrowRight` importieren (noch nicht in faq/page.tsx):
```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
```

**Step 2: Build prüfen + Commit**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
git add "app/[locale]/faq/page.tsx" && git commit -m "ux: faq — add cta to contact at end"
```

---

## Task 13: Finanzierung — Standalone CTA-Sektion entfernen

**Datei:**
- Modify: `app/[locale]/finanzierung/page.tsx`

**Step 1: Letzten CTA-Block entfernen**

Den letzten `<section>` Block entfernen (ca. Zeilen 211–228):
```tsx
// ENTFERNEN:
<section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <FadeIn>
      <h2>Persönliche Offerte anfragen</h2>
      ...
      <Link href="/kontakt">Jetzt anfragen</Link>
    </FadeIn>
  </div>
</section>
```

Die Seite endet dann mit dem B2B-Teaser (dunkel), was einen guten Abschluss bildet.

**Step 2: Build prüfen + Commit**

```bash
cd /root/cartrade24 && npm run build 2>&1 | grep -E "error|Error|✓ Compiled"
git add "app/[locale]/finanzierung/page.tsx" && git commit -m "ux: finanzierung — remove redundant standalone cta section"
```

---

## Task 14: Finaler Build-Check

**Step 1: Vollständigen Build durchführen**

```bash
cd /root/cartrade24 && npm run build 2>&1 | tail -20
```

Erwartet: `✓ Compiled successfully`, alle Routes gelistet, keine Fehler.

**Step 2: Dev-Server neu starten falls nötig**

```bash
kill $(lsof -t -i:3000) 2>/dev/null; npm run dev > /tmp/nextdev.log 2>&1 &
sleep 8 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

Erwartet: `200`

**Step 3: Abschliessender Commit**

```bash
cd /root/cartrade24 && git log --oneline -15
```

Sicherstellen dass alle 13 Task-Commits vorhanden sind.
