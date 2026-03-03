# Blog & Ratgeber — Hybrid (MDX + KI) Design

**Datum:** 2026-03-03
**Status:** Genehmigt
**Ansatz:** MDX-Dateien im Repo + KI-Entwurfsgenerierung (Claude Haiku)

## Ziel

Blog-Sektion für organischen Traffic mit zwei Inhaltstypen:
- **Ratgeber** — Kaufberatung, Vergleiche, Tipps
- **News & Aktionen** — Neue Fahrzeuge, Sonderangebote, Events

Frequenz: mehrmals wöchentlich. KI generiert Entwürfe, Autoren reviewen und veröffentlichen.

## Architektur & Dateistruktur

```
content/
  blog/
    2026-03-03-elektro-vs-hybrid.mdx
    2026-03-05-occasion-kaufberatung.mdx
    ...
lib/
  blog.ts          # Posts laden, sortieren, filtern
  blog-ai.ts       # KI-Entwurfsgenerierung (Claude Haiku)
scripts/
  generate-blog-post.ts   # CLI-Script für KI-Entwürfe
app/[locale]/
  blog/
    page.tsx        # Blog-Übersicht (Infinite Scroll, Kategorien)
    [slug]/
      page.tsx      # Einzelner Blog-Post
components/
  blog/
    BlogCard.tsx         # Karte für Übersicht
    BlogPost.tsx         # Post-Layout mit MDX-Rendering
    BlogCategoryTabs.tsx # Kategorie-Filter
    CallToAction.tsx     # CTA-Box für MDX
    VehicleTeaser.tsx    # Fahrzeug-Teaser für MDX
    ImageGallery.tsx     # Bildergalerie für MDX
```

## MDX-Frontmatter

```yaml
---
title: "Elektroauto vs. Hybrid: Was lohnt sich 2026?"
slug: elektro-vs-hybrid
date: 2026-03-03
category: ratgeber          # ratgeber | news
excerpt: "Die wichtigsten Unterschiede..."
image: /images/blog/elektro-vs-hybrid.jpg
tags: [elektroauto, hybrid, kaufberatung]
author: CarTrade24
draft: false                # true = nicht veröffentlicht
---
```

## Blog-Seiten

### Übersicht (`/blog`)

- Hero: Titel "Blog & Ratgeber" + Beschreibung
- Kategorie-Tabs: Alle / Ratgeber / News & Aktionen
- Karten-Grid: 3 Spalten Desktop, 1 Spalte Mobile
- Infinite Scroll (konsistent mit Fahrzeugliste)
- Jede Karte: Bild (16:9), Kategorie-Badge, Titel, Excerpt, Datum

### Einzelner Post (`/blog/[slug]`)

- Hero-Bild (volle Breite)
- Titel, Datum, Kategorie-Badge, Lesezeit
- MDX-Content (max-width ~720px, Tailwind `prose`)
- Verwandte Posts am Ende (gleiche Kategorie, max 3)
- CTA: "Passende Fahrzeuge ansehen" → `/autos` mit Filter

### Navigation

- Blog-Link im Hauptmenü
- Optional: letzter Blog-Post als Teaser auf Homepage

## KI-Entwurfsgenerierung

### Workflow

1. Thema + optionale Stichworte eingeben
2. Claude Haiku generiert vollständigen MDX-Entwurf
3. Entwurf wird als `draft: true` gespeichert
4. Review, anpassen, `draft: false` setzen → veröffentlicht

### Technisch

- CLI-Script: `scripts/generate-blog-post.ts`
- Input: Thema, Kategorie, optionale Stichworte
- Output: MDX-Datei mit Frontmatter + Content
- Rein lokales Tool, keine API-Route
- Kosten: ~CHF 0.01-0.02 pro Post

### Prompt-Strategie

- Schweizer Hochdeutsch (Sie-Form)
- CH-Terminologie: "Occasion", "Fahrzeug", CHF
- SEO-fokussiert: Long-Tail Keywords, strukturierte Überschriften
- Branchenspezifisch: Automobilhandel Schweiz

## SEO

- **JSON-LD:** `BlogPosting` pro Post, `Blog` auf Übersicht, Breadcrumbs
- **Meta-Tags:** title + description aus Frontmatter, Open Graph für Social
- **Canonical:** `<link rel="canonical">` auf jeder Seite
- **Sitemap:** Blog-Posts automatisch in `sitemap.xml` (ohne Drafts)
- **Interne Verlinkung:** Verwandte Posts, Fahrzeug-Links, Homepage-Teaser

## Design

### Blog-Karten (Übersicht)

- Weisser Hintergrund, abgerundete Ecken, Schatten (wie VehicleCard)
- Bild oben (16:9, `object-cover`)
- Kategorie-Badge: Cyan-Pill (Ratgeber), Magenta-Pill (News)
- Titel (bold, 1-2 Zeilen), Excerpt (grau, 2 Zeilen)
- Footer: Datum links, Lesezeit rechts

### Einzelner Post

- Container max-width ~720px (Lesbarkeit)
- Tailwind `prose` als Basis, angepasst an Design Tokens
- Bilder: volle Breite mit Bildunterschrift
- Zitate: Cyan-Rand links
- CTA-Boxen: Cyan-Hintergrund, weisser Text

### MDX-Komponenten

- `<CallToAction>` — Farbige Box mit Button
- `<VehicleTeaser make="BMW" model="iX" />` — Fahrzeug aus Bestand
- `<ImageGallery>` — Bildergalerie mit Lightbox
