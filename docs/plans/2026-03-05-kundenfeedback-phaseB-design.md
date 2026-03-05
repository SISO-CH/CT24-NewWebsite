# Kundenfeedback Phase B — Mittlerer Aufwand (Design)

**Datum:** 2026-03-05
**Status:** Approved

---

## Kontext

Fortsetzung der Kundenfeedback-Umsetzung. Phase A (9 Quick Wins) ist abgeschlossen.
Phase B umfasst 10 Features mit mittlerem Aufwand.

---

## 10. Wishlist pro Auto

- Heart-Icon auf VehicleCard + VDP
- localStorage (`ct24_wishlist`), max 20 Fahrzeuge, speichert `{ id, make, model, price, image }`
- Wishlist-Seite unter `/merkliste` mit gespeicherten Fahrzeugen als VehicleCard-Grid
- Heart-Icon im Header (neben "Zuletzt angesehen") mit Badge + Flyout
- Toggle: Klick auf Heart fügt hinzu / entfernt

---

## 11. Inzahlungnahme überarbeiten

**Ziel:** Bei jedem Auto auf der VDP ein "Inzahlungnahme"-Button. Intelligentes Formular das Sinn ergibt.

**Formular-Felder (5 Inputs):**
- Marke (Dropdown oder Freitext)
- Modell (Freitext)
- Erstzulassung / Jahrgang (Dropdown)
- Kilometerstand (Nummernfeld)
- Zustand (Dropdown: Sehr gut / Gut / Befriedigend / Beschädigt)

**Schätzung:**
- Primär: AS24-Marktdaten — Durchschnittspreis ähnlicher Fahrzeuge (gleiche Marke, Modell, ±1 Jahr, ähnliche km) × Inzahlungnahme-Faktor (70-80% je nach Zustand)
- Fallback: Claude AI Schätzung wenn keine AS24-Treffer
- Ergebnis: "Geschätzter Inzahlungnahme-Wert: CHF XX'XXX" (unverbindlich)

**Integration mit VDP:**
- Button auf jeder VDP-Seite öffnet Modal
- Das Ziel-Fahrzeug (das der Kunde kaufen will) wird automatisch mitgegeben
- User muss nicht nochmal ausfüllen welches Auto er kaufen will
- Formular-Submit → API-Route → E-Mail an Händler mit beiden Fahrzeugdaten

---

## 12. Personal auf Homepage

- Team-Sektion mit 5 Personen
- Pro Person: Foto, Name, Rolle, optional Telefon
- Platziert nach "How it works", vor "Services Teaser"
- Platzhalter-Avatare (Initialen-Kreise in CT-Cyan) bis echte Fotos geliefert werden
- Daten aus `lib/team.ts` (prüfen ob vorhanden, sonst erstellen)

---

## 13. Social Proof — View-Counter

- Echte `vehicle_view` Events zählen via Vercel KV
- Key-Schema: `views:{vehicleId}` mit TTL 24h
- API-Route `/api/vehicle-views` — POST (increment) + GET (read)
- Anzeige auf VehicleCard: "X Mal angesehen heute"
- Schwellenwert: Nur anzeigen wenn > 3 Views
- Auf VDP: Ebenfalls anzeigen

---

## 14. Angebot als PDF auf VDP

- Button "Als PDF speichern" auf VDP (neben den CTAs)
- Clientseitig generiert mit `jsPDF` + `html2canvas`
- Inhalt:
  - Car Trade24 Logo + Adresse + Telefon
  - Fahrzeug-Hauptbild
  - Alle technischen Daten (Marke, Modell, Jahrgang, km, Leistung, Getriebe, Treibstoff, Antrieb, Farbe)
  - Kaufpreis inkl. MWST-Hinweis
  - Leasingrate (Standard-Berechnung)
  - Ausstattungsliste
  - Gültigkeitsdatum (14 Tage ab Erstellung)
  - QR-Code zurück zur VDP-Seite
- Dateiname: `CarTrade24_Angebot_[Marke]_[Modell].pdf`

---

## 15. Sprachen erweitern (ES, PL, SK, PT, AL)

- 5 neue Locales in `next-intl` Konfiguration hinzufügen
- URL-Präfixe: `/es/`, `/pl/`, `/sk/`, `/pt/`, `/sq/`
- Claude AI generiert Übersetzungen aus den deutschen JSON-Locale-Dateien
- LocaleSwitcher im Header auf Dropdown umstellen (9 Sprachen zu viel für Inline)
- Sprachnamen in Landessprache: Español, Polski, Slovenčina, Português, Shqip

---

## 16. Mobile First Vertiefung

Durchgängiger Mobile-Check aller Phase-B Features:
- Wishlist-Heart: min. 44px Touch-Target, gut positioniert auf Card
- Badges (Neu, Preisreduziert): nicht überlappend mit Heart
- PDF-Button: Mobile-freundlich
- Team-Sektion: Horizontal scrollbar auf Mobile
- Inzahlungnahme-Modal: Fullscreen auf Mobile
- LocaleSwitcher: Touch-freundliches Dropdown

---

## 17. Animationen & Gamification

**Scroll-Animationen:**
- Bestehendes `FadeIn` erweitern mit Varianten (slide-up, slide-left, scale)
- Staggered Animations für Listen/Grids

**Hover-Effekte:**
- VehicleCards: leichter Lift + verstärkter Schatten
- Buttons: Scale-Effekt auf Hover

**Counter-Animationen:**
- Zahlen (Preis, km, Statistiken) zählen von 0 hoch beim Erscheinen im Viewport
- IntersectionObserver-basiert

**Feedback-Animationen:**
- Checkmark-Animation nach Formular-Submit (statt statisches Icon)
- Heart-Animation bei Wishlist-Toggle (Pulse/Scale)
- Skeleton Screens beim initialen Laden von Fahrzeuglisten

**Fortschrittsanzeige:**
- Mehrstufige Formulare (Inzahlungnahme): Schrittanzeige oben

**Badges auf VehicleCards:**
- "Neu eingetroffen" (grün)
- "Preisreduziert" (magenta)
- "Bestseller" / "Beliebt" (cyan)

---

## 18. Verknappung

Alle basierend auf echten Daten — kein Fake:

- **"Neu eingetroffen"** — Fahrzeuge < 7 Tage in der API (Vergleich `createdAt` oder erstes Erscheinen)
- **"Preisreduziert"** — Wenn AS24 `previousPrice` liefert oder wir Preishistorie tracken
  - Anzeige: alter Preis durchgestrichen + neuer Preis + Differenz
- **"Nur noch X verfügbar"** — Bei ≤ 2 Fahrzeugen desselben Modells im Bestand
- **View-Counter** — aus Feature 13 ("12 Mal angesehen heute")
- Position: Badges oben-links auf VehicleCard-Bild, View-Counter unter dem Bild

---

## 19. Händler-Seite (B2B)

**Route:** `/haendler`

**Sektionen:**
1. **Hero** — "Fahrzeuge für Ihren Bestand — direkt vom Grosshandel"
   - Subtext: Exklusiver Zugang zur CT24-Händlerplattform
   - CTA: "Jetzt Account anfragen"
2. **Vorteile** — 4 Cards:
   - Grosse Auswahl an geprüften Fahrzeugen
   - Händlerpreise unter Markt
   - Schnelle Abwicklung + Lieferung
   - Persönlicher Ansprechpartner
3. **So funktioniert's** — 3 Schritte:
   - Account anfragen → Zugang erhalten → Fahrzeuge bestellen
4. **Services** (sekundär) — Cards:
   - Vermarktung (Fotos, Texte, Inserate)
   - Digitalisierung (Website, Online-Präsenz)
   - KI-Lösungen (automatisierte Texte, Chatbot)
5. **Kontaktformular** — Händler-spezifisch:
   - Firma, Ansprechpartner, E-Mail, Telefon, Nachricht
   - Tracking: `lead_form_submit` mit `form_type: "b2b_haendler"`

**Navigation:** Link "Für Händler" im Header oder Footer hinzufügen.

---

## Gesamtübersicht Phase C (Backlog)

20. Fahrzeug-Archiv für SEO (verkaufte Autos als Content)
21. Vorbestellte Fahrzeuge aus Google Sheet
22. n8n PDF-Preisschild-Generator (Webhook)
23. Voice Agent für Chat
24. SEMrush/Ahrefs API für SEO
25. GEO — Generative Engine Optimization
26. SEO maximal (technisch + inhaltlich)
27. CO2-Rechner als Lead-Generator
