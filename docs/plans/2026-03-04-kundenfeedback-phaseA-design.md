# Kundenfeedback Phase A — Quick Wins (Design)

**Datum:** 2026-03-04
**Status:** Approved

---

## Kontext

Kundenfeedback mit ca. 30 Punkten erhalten. Priorisierung in 3 Phasen:
- **Phase A** — Quick Wins (dieses Dokument, 9 Punkte)
- **Phase B** — Mittlerer Aufwand (geplant)
- **Phase C** — Komplex (geplant)

---

## 1. VDP: Bilder auf 4:3

**Problem:** Fahrzeugbilder werden aktuell beschnitten (falsches Seitenverhältnis).

**Lösung:**
- `aspect-ratio` in `VehicleMediaTabs` auf `4/3` umstellen
- `object-fit: contain` oder `cover` je nach Kontext prüfen
- Mobile: Querformat-Bilder vollflächig mit Swipe-Gesten
- Alle Bildcontainer konsistent auf 4:3

**Betroffene Dateien:**
- `components/vehicles/VehicleMediaTabs.tsx`
- Ggf. `components/vehicles/VehicleCard.tsx` (Listenansicht)

---

## 2. VDP: Getriebe als Spec-Box

**Problem:** Getriebe fehlt in den Highlight-Boxes oben auf der VDP.

**Lösung:**
- 5. Box hinzufügen: Getriebe (Automatik/Schaltgetriebe/CVT)
- Datenquelle: `vehicle.transmission` (bereits aus AS24 API gemappt)
- Icon: `Cog` aus lucide-react
- Grid: 5-spaltig Desktop, 3+2 Mobile

**Betroffene Dateien:**
- `app/[locale]/autos/[id]/page.tsx` (Spec-Boxes Sektion)

---

## 3. VDP: Leasingrechner ausgeklappt + Restwert

**Problem:** Leasingrechner ist eingeklappt (Details-Element), Restwert fehlt.

**Lösung:**
- `<details open>` als Default → Leasingrechner immer sichtbar
- Neuer Restwert-Slider hinzufügen:
  - Range: 20–60% des Fahrzeugpreises
  - Default: 30%
  - Anzeige: Prozent + absoluter CHF-Betrag
- Berechnung anpassen:
  - Aktuell: `(Preis - Anzahlung) / Monate * Zinsfaktor`
  - Neu: `(Preis - Anzahlung - Restwert) / Monate * Zinsfaktor`
- Restwert-Betrag prominent unter dem Slider anzeigen

**Betroffene Dateien:**
- `components/ui/LeasingCalculator.tsx`

---

## 4. VDP: "Jetzt Anfragen" als Modal

**Problem:** "Jetzt Anfragen" verlinkt auf `/kontakt?betreff=...` — User verlässt VDP.

**Lösung:**
- Neues `InquiryModal` erstellen (gleicher Pattern wie `TestDriveModal`)
- Inhalt: `VDPContactForm` mit vorausgefülltem Fahrzeugname
- Button auf VDP öffnet Modal statt Navigation
- Tracking: `cta_click` Event mit `cta_type: "inquiry"`

**Betroffene Dateien:**
- `components/vehicles/InquiryModal.tsx` (neu)
- `app/[locale]/autos/[id]/page.tsx` (Button-Handler)
- `components/ui/MobileCTABar.tsx` (optional: auch dort Modal statt Link)

---

## 5. Filter-Darstellung verbessern

**Problem:** Filter wirkt zu subtil/flau, führt den User nicht genug.

**Lösung:**
- Labels über den Dropdowns (statt nur Placeholder)
- Grössere Dropdowns (`h-10` statt `h-9`)
- Stärkere visuelle Trennung zwischen Filtern
- Aktive Filter prominenter hervorheben (gefüllter Hintergrund statt nur Badge)
- Desktop: "Erweiterte Filter" standardmässig sichtbar
- Mobile: Fullscreen-Filter-Overlay oder Bottom-Sheet
- Such-Button oder Auto-Apply mit visuellem Feedback

**Betroffene Dateien:**
- `components/vehicles/VehicleFilter.tsx`

---

## 6. Header: "Zuletzt angesehen" als Icon

**Problem:** "Zuletzt angesehen" ist eine Sektion auf der Homepage, nicht im Header.

**Lösung:**
- `Clock` oder `History` Icon in die Header-Navigation (neben Telefon-Button)
- Klick öffnet Flyout/Dropdown mit den letzten 4 Fahrzeugen
  - Pro Fahrzeug: Thumbnail, Name, Preis
  - "Alle anzeigen" Link (optional)
- Badge mit Anzahl (wenn > 0)
- `RecentlyViewed`-Sektion von der Homepage entfernen
- Datenquelle: `lib/recently-viewed.ts` (bereits vorhanden, localStorage)

**Betroffene Dateien:**
- `components/layout/Header.tsx` (Icon + Flyout)
- `components/layout/RecentlyViewedFlyout.tsx` (neu)
- `app/[locale]/page.tsx` (RecentlyViewed-Sektion entfernen)

---

## 7. Google Reviews weiter oben

**Problem:** Google Reviews sind ganz unten auf der Homepage, nach vielen anderen Sektionen.

**Lösung:**
- Reviews-Sektion direkt nach dem Hero-Bereich platzieren (vor Fahrzeugliste)
- Stärkt Vertrauen sofort beim ersten Seitenbesuch
- Keine inhaltliche Änderung, nur Position im Layout verschieben

**Betroffene Dateien:**
- `app/[locale]/page.tsx` (Sektions-Reihenfolge)

---

## 8. "Kein Fahrzeug gefunden" → Sourcing-Weiterleitung

**Problem:** Wenn keine Fahrzeuge den Filtern entsprechen, wird der User mit 3 Vorschlägen + Reset-Button allein gelassen.

**Lösung:**
- Zusätzlicher prominenter CTA-Block unterhalb der Vorschläge:
  - Headline: "Wir finden Ihr Traumauto!"
  - Subtext: "Beschreiben Sie uns Ihr Wunschfahrzeug — wir suchen es für Sie."
  - Eingabefelder: E-Mail + kurze Fahrzeugbeschreibung (Textarea)
  - Submit → POST `/api/contact` mit Subject "Fahrzeug-Sourcing-Anfrage"
  - Tracking: `lead_form_submit` mit `form_type: "sourcing"`
- Optional: Link "Mehr erfahren" → `/fahrzeug-sourcing`

**Betroffene Dateien:**
- `components/vehicles/AutosContent.tsx` (No-Results Bereich)
- `lib/tracking.ts` (ggf. `form_type` erweitern)

---

## 9. Mobile First Optimierung

**Problem:** Mobile Darstellung muss verbessert werden, angelehnt an AS24.

**Lösung (durchgängig bei allen Punkten):**
- Bilder: Querformat vollflächig, 4:3, Swipe-Navigation
- Filter: Bottom-Sheet oder Fullscreen-Overlay statt kompakte Zeile
- VDP Spec-Boxes: 3+2 Grid statt 5-spaltig
- Leasingrechner: Touch-freundliche Slider
- Modals: Fullscreen auf Mobile statt zentriertes Popup
- Alle Touch-Targets: min. 44px

Kein separates Feature — wird bei jedem der obigen Punkte mitberücksichtigt.

---

## Gesamtübersicht Phase B + C (Backlog)

### Phase B — Mittlerer Aufwand
10. Wishlist pro Auto
11. Inzahlungnahme überarbeiten (bei jedem Auto, intelligentes Formular)
12. Personal auf Homepage (Team mit Fotos)
13. Social Proof ("X Personen schauen dieses Auto an")
14. Angebot als PDF auf VDP
15. Sprachen erweitern (ES, PL, SK, PT, AL)
16. Mobile First Optimierung (AS24-angelehnt)
17. Animationen & Gamification
18. Verknappung ("Nur noch X verfügbar")
19. B2B-Seite komplett neu

### Phase C — Komplex
20. Fahrzeug-Archiv für SEO (verkaufte Autos als Content)
21. Vorbestellte Fahrzeuge aus Google Sheet
22. n8n PDF-Preisschild-Generator (Webhook)
23. Voice Agent für Chat
24. SEMrush/Ahrefs API für SEO
25. GEO — Generative Engine Optimization
26. SEO maximal (technisch + inhaltlich)
27. CO2-Rechner als Lead-Generator
