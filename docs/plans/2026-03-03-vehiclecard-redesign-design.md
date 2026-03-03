# VehicleCard Redesign — Verkaufsfunnel-Optimierung

**Datum:** 2026-03-03
**Ziel:** VehicleCard auf der /autos-Übersicht für Mobile-first Conversion optimieren

## Kontext

- **Zielgruppe:** 70%+ Mobile-Nutzer
- **Conversion-Ziel:** Klick zur Detailseite
- **Sortiment:** Mix aus Neuwagen und Occasionen
- **Aktuell 82 aktive Inserate** aus AS24 Live-API

## Design: Ansatz B — Info-Rich Card

### Bild-Bereich (aspect 4:3)

- **Oben links:** Zustand-Badge
  - Neuwagen → ct-green (#009640)
  - Occasion → ct-cyan (#00a0e3)
  - Vorführfahrzeug → ct-dark (#1b1b1b)
  - Reserviert → grau (#6b7280) — hat Vorrang
- **Oben rechts:** Treibstoff-Badge (weisser Pill mit backdrop-blur, wie bisher)
- **Unten rechts:** CompareToggle (bleibt)
- **Gradient** am unteren Bildrand bleibt
- **Entfernt:** Body-Badge, EnergyLabel

### Info-Bereich

```
Cupra Leon ST              ← Make + Model, extrabold, ct-dark
2024 · 8'500 km · AT       ← Jahr · km · Getriebe-Kürzel, grau
231 PS · Allrad             ← PS + Antrieb (optional), grau

CHF 29'900                 ← Preis, extrabold, ct-dark, text-xl
inkl. MwSt.                ← Klein, grau
ab CHF 389/Mt.             ← Leasing ct-magenta (nur wenn > 0)
```

### Strukturelle Änderungen

- **Ganze Karte** wird ein `<Link>` (kein separater Button)
- **Entfernt:** "Fahrzeug ansehen"-Button, Variant-Text, Chips, Preis-Box-Container
- **Getriebe-Kürzel:** "Automat" → "AT", "Manuell" → "MT"
- **Spec-Zeilen** statt Chips: kompakter, besser scannbar auf Mobile

### Nicht geändert

- Card-Container (rounded-2xl, shadow, hover-Effekte)
- VehicleGrid, AutosContent, VehicleFilter
- Detailseite (VDP)
