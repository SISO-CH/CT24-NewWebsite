# UX-Strukturoptimierung — Design
**Datum:** 2026-03-02
**Scope:** Alle Seiten — Reihenfolge, Duplikate, fehlende Abschlüsse

---

## Ziel

Nach dem Aufbau aller Features (Phase 1–3) sind auf mehreren Seiten strukturelle Probleme entstanden:
neue Sektionen wurden ans Ende angehängt statt sinnvoll eingebettet, Elemente wiederholen sich,
und einige Seiten haben keinen konvertierenden Abschluss. Diese Optimierung korrigiert Struktur
und Reihenfolge nach Verkaufsfunnel-Logik — **ohne Redesign**, nur Verschieben, Entfernen, Ergänzen.

---

## Leitprinzip

```
Attention → Interest → Desire → Conversion → Trust → Action
```

Jede Seite folgt diesem Fluss. Informationen die den Nutzer überzeugen kommen
vor dem Tool/Formular das er benutzen soll. Jede Seite endet mit einem CTA.

---

## Seite 1 — Homepage (`/`)

### Problem
- Services-Teaser steht ganz unten (kaum gesehen)
- Inzahlungnahme-Teaser und Kontakt-Sektion sind beide dunkel und direkt benachbart
- `RecentlyViewed` ist letztes Element — korrekt

### Neue Sektionsreihenfolge

| # | Sektion | Hintergrund | Änderung |
|---|---------|-------------|---------|
| 1 | Hero | weiss | — |
| 2 | USP-Bar | ct-light | — |
| 3 | Fahrzeug-Highlights | weiss | — |
| 4 | So geht's (3 Schritte) | ct-light | — |
| 5 | **Services-Teaser** | weiss | ↑ verschoben von Position 9 |
| 6 | **Inzahlungnahme-Teaser** | dunkel (Gradient) | ↑ verschoben von Position 8 |
| 7 | Google Reviews | ct-light | ↓ verschoben von Position 5 |
| 8 | Trust-Badges | weiss | — |
| 9 | Kontakt/Standort | ct-dark | — |
| 10 | Recently Viewed | weiss | — |

### Begründung
- Services direkt nach «So geht's»: Nutzer versteht den Prozess, sieht nun den Mehrwert
- Inzahlungnahme vor Reviews: Conversion-Tool vor Trust-Signal — klassischer Funnel
- Zwischen Inzahlungnahme (dunkel) und Kontakt (dunkel) liegen nun Reviews + Trust als helle Puffer → kein Dark-Dark-Block mehr

---

## Seite 2 — VDP (`/autos/[id]`)

### Problem A — Quick-Specs duplizieren die Tech-Tabelle
Aktuelle 4 Felder: km / PS / Getriebe / Kraftstoff
Alle 4 erscheinen identisch in der Technischen-Daten-Tabelle darunter.

**Fix:** Quick-Specs zeigen: **Baujahr / km / PS / Antrieb**
Getriebe und Kraftstoff bleiben in der Tabelle (kein Duplikat mehr).

### Problem B — Video als separate Sektion
`VideoWalkaround` rendert als eigener Block zwischen Galerie und Quick-Specs.

**Fix:** Video als dritten Tab in `VehicleMediaTabs` einbauen (neben «Fotos» und «360°-Ansicht»).
`VideoWalkaround` wird nicht mehr separat gerendert.

### Problem C — Sidebar zu dicht (8 Kontaktoptionen)

**Aktuelle Elemente:**
1. Leasingpreis
2. Kaufpreis + MwSt-Hinweis
3. PriceComparison
4. LeasingCalculator
5. 3 USP-Checkmarks
6. Button: «Jetzt anfragen» → /kontakt
7. Button: TestDriveTrigger (Probefahrt)
8. Button: ReserveButton (CHF 200)
9. Link: Cardossier (falls vorhanden)
10. Button: WhatsApp
11. Link: Anrufen
12. Collapsible: VDPContactForm (inline)
13. PriceAlertForm
14. CarVertical-Block (Occasionen)
15. Matelso Rückruf-Widget

**Neue Sidebar-Reihenfolge:**

```
Leasingpreis (falls vorhanden)
Kaufpreis + MwSt-Hinweis
PriceComparison
──────────────────
3 USP-Checkmarks          ← VOR den CTAs (begründen die Aktion)
──────────────────
[Jetzt anfragen]          ← primärer CTA (volle Breite, cyan)
[Probefahrt] [WhatsApp]   ← zwei sekundäre, nebeneinander (halbe Breite)
[Reservieren CHF 200]     ← tertiär, mit Kontext-Label
Anrufen +41 56 618 55 44  ← Textlink, kein Button
──────────────────
LeasingCalculator         ← ausklappbar (details/summary)
Cardossier-Link           ← falls vorhanden
──────────────────
CarVertical-Block         ← nur Occasionen
PriceAlertForm            ← ganz unten, «noch nicht jetzt» Signal
```

**Entfernt:**
- `VDPContactForm` inline (redundant — «Jetzt anfragen» führt zu /kontakt)
- Matelso Rückruf-Widget (redundant — Anrufen-Link genügt)

---

## Seite 3 — Inzahlungnahme (`/inzahlungnahme`)

### Problem
USPs stehen *nach* dem Wizard — Nutzer sieht erst das Tool, dann den Grund.

### Neue Reihenfolge

| # | Sektion | Änderung |
|---|---------|---------|
| 1 | Header | — |
| 2 | **USPs (3 Karten)** | ↑ verschoben vor Wizard |
| 3 | Wizard | ↓ verschoben nach USPs |

---

## Seite 4 — Kontakt (`/kontakt`)

### Problem
Probefahrt-Buchung ist eingebettet (eigene Seite `/probefahrt` existiert bereits).
Ohne Matelso-Konfiguration zeigt sie nur einen Platzhaltertext → schlechte UX.

### Fix
Probefahrt-Sektion aus `/kontakt` entfernen.
Struktur: **Header → ContactContent** (wie vorher ohne den Probefahrt-Block).

---

## Seite 5 — Probefahrt (`/probefahrt`)

### Problem
Sehr dünne Seite: nur Icon + 3 Bulletpoints + Formular. Kein Kontext, kein Prozess,
kein konsistenter Page-Header wie alle anderen Seiten.

### Neue Struktur

| # | Sektion | Inhalt |
|---|---------|--------|
| 1 | **Page-Header** | Gleiche Pattern wie alle Seiten (Label + H1 + Subtext) |
| 2 | **USPs / Trust** | 3 Punkte: Kostenlos · Keine Kaufpflicht · Wunschfahrzeug wählbar |
| 3 | **Prozessschritte** | 1. Fahrzeug angeben → 2. Termin bestätigen → 3. Probefahrt geniessen |
| 4 | **Formular** | ServiceContactForm (wie bisher) |

---

## Seite 6 — Home Delivery (`/home-delivery`)

### Problem
Gleiche Ausgangslage wie Probefahrt — nur Formular, kein Kontext.

### Neue Struktur

| # | Sektion | Inhalt |
|---|---------|--------|
| 1 | **Page-Header** | Label + H1 «Ihr neues Auto. Direkt zu Ihnen.» + Subtext |
| 2 | **USPs** | 3 Punkte: Bis 50 km kostenlos · Terminwahl · Vollversichert |
| 3 | **Prozessschritte** | 1. Fahrzeug wählen → 2. Termin vereinbaren → 3. Lieferung erhalten |
| 4 | **Formular** | ServiceContactForm (wie bisher) |

---

## Seite 7 — Zulassungsservice (`/zulassungsservice`)

### Problem
Gleiche Ausgangslage — nur Formular.

### Neue Struktur

| # | Sektion | Inhalt |
|---|---------|--------|
| 1 | **Page-Header** | Label + H1 «Zulassung? Erledigen wir für Sie.» + Subtext |
| 2 | **USPs** | 3 Punkte: Kein Behördengang · Schnell erledigt · Schweizweit |
| 3 | **Prozessschritte** | 1. Daten übermitteln → 2. Wir erledigen alles → 3. Fahrzeug ist zugelassen |
| 4 | **Formular** | ServiceContactForm (wie bisher) |

---

## Seite 8 — Fahrzeug-Sourcing (`/fahrzeug-sourcing`)

### Problem
Gleiche Ausgangslage — nur Formular.

### Neue Struktur

| # | Sektion | Inhalt |
|---|---------|--------|
| 1 | **Page-Header** | Label + H1 «Wir finden Ihr Wunschauto.» + Subtext |
| 2 | **USPs** | 3 Punkte: Alle Marken · Schweiz + Import · Kein Aufpreis |
| 3 | **Prozessschritte** | 1. Wunsch definieren → 2. Wir suchen → 3. Fahrzeug präsentieren |
| 4 | **Formular** | ServiceContactForm (wie bisher) |

---

## Seite 9 — Über uns (`/ueber-uns`)

### Problem
Seite endet ohne CTA — der Nutzer weiss nicht was als nächstes tun.

### Fix
Am Ende einen CTA-Block hinzufügen (weisser Hintergrund, zentriert):
«Überzeugt? Schauen Sie sich unsere Fahrzeuge an.» → `/autos`

---

## Seite 10 — FAQ (`/faq`)

### Problem
Seite endet ohne CTA — Nutzer der alle Fragen gelesen hat ist ready to convert.

### Fix
Am Ende einen CTA-Block hinzufügen:
«Noch eine Frage? Wir helfen gerne persönlich.» → `/kontakt`

---

## Seite 11 — Finanzierung (`/finanzierung`)

### Problem
Nach dem interaktiven Leasingrechner folgt ein separater CTA-Abschnitt
(«Persönliche Offerte anfragen»). Das ist redundant — der Rechner hat bereits
einen sichtbaren Kontakt-Link.

### Fix
Den separaten CTA-Abschnitt entfernen. Der B2B-Teaser (Firmenkunden) bleibt als
vorletzter Block, der Leasingrechner-Abschnitt ist der letzte Content-Block.

---

## Nicht verändert

| Seite | Grund |
|-------|-------|
| `/autos` | Sauber strukturiert, kein Handlungsbedarf |
| `/ankauf` | Saubere 3-Schritt-Struktur, kein Handlungsbedarf |
| `/firmenkunden` | Sauber: Vorteile → Schritte → Formular |
| `/garantie` | Sauber: Abdeckung → Laufzeiten → FAQ → CTA |
| `/agb`, `/datenschutz`, `/news` | Reine Inhaltsseiten, keine UX-Relevanz |

---

## Zusammenfassung der Änderungen

| Typ | Anzahl |
|-----|--------|
| Sektionen verschoben | 4 |
| Sektionen entfernt | 4 (VDPContactForm, Matelso Widget, Probefahrt@Kontakt, Finanzierung CTA) |
| Sektionen hinzugefügt | 12 (je 3 pro Service-Seite × 4 Seiten) + 2 CTAs (FAQ, Über uns) |
| Sidebar restrukturiert | 1 (VDP) |
| Quick-Specs geändert | 1 (VDP) |
| Video als Tab | 1 (VehicleMediaTabs) |

---

## Nicht in Scope

- Visuelles Redesign (Farben, Typografie, Komponenten-Styles)
- Neue Features oder Inhalte
- Mobile-spezifische Layouts (werden automatisch übernommen)
