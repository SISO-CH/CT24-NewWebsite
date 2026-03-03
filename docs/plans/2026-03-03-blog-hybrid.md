# Blog & Ratgeber (Hybrid MDX + KI) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a blog section with MDX content, infinite scroll, category filtering, SEO, and a CLI script that generates draft posts via Claude Haiku.

**Architecture:** MDX files in `content/blog/` with `gray-matter` frontmatter parsing. `next-mdx-remote/rsc` renders MDX in React Server Components. A CLI script in `scripts/` uses Claude Haiku to generate draft posts. Blog pages follow existing App Router patterns.

**Tech Stack:** `gray-matter`, `next-mdx-remote`, `@tailwindcss/typography`, `@anthropic-ai/sdk` (already installed), `reading-time`

**Design Doc:** `docs/plans/2026-03-03-blog-hybrid-design.md`

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install runtime + dev dependencies**

```bash
cd /root/cartrade24
npm install gray-matter next-mdx-remote reading-time
npm install -D @tailwindcss/typography
```

**Step 2: Verify build still works**

```bash
npm run build
```

Expected: build succeeds, no errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add blog dependencies (gray-matter, next-mdx-remote, reading-time, typography)"
```

---

### Task 2: Add Tailwind typography plugin

**Files:**
- Modify: `app/globals.css`

**Step 1: Import the typography plugin**

Add after line 1 (`@import "tailwindcss";`):

```css
@plugin "@tailwindcss/typography";
```

**Step 2: Add blog-specific prose overrides**

Add at the end of `globals.css`:

```css
/* ── Blog prose overrides ── */
.prose-blog {
  --tw-prose-headings: var(--ct-dark);
  --tw-prose-links: var(--ct-cyan);
  --tw-prose-bold: var(--ct-dark);
  --tw-prose-quotes: var(--ct-dark);
  --tw-prose-quote-borders: var(--ct-cyan);
}
.prose-blog blockquote {
  border-left-width: 4px;
}
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add app/globals.css
git commit -m "style: add tailwind typography plugin + blog prose overrides"
```

---

### Task 3: Create blog types and utility library

**Files:**
- Create: `lib/blog.ts`

**Step 1: Create `lib/blog.ts`**

This file handles loading, parsing, sorting, and filtering blog posts from the `content/blog/` directory.

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export type BlogCategory = "ratgeber" | "news";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;           // ISO date string YYYY-MM-DD
  category: BlogCategory;
  excerpt: string;
  image: string;           // path relative to /public, e.g. "/images/blog/foo.jpg"
  tags: string[];
  author: string;
  draft: boolean;
  readingTime: string;     // e.g. "4 Min."
  content: string;         // raw MDX content (without frontmatter)
}

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseMdxFile(filePath: string): BlogPost | null {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  if (data.draft) return null;

  const stats = readingTime(content);

  return {
    slug: data.slug ?? path.basename(filePath, ".mdx"),
    title: data.title ?? "Untitled",
    date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
    category: data.category === "news" ? "news" : "ratgeber",
    excerpt: data.excerpt ?? "",
    image: data.image ?? "/images/blog/placeholder.jpg",
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: data.author ?? "CarTrade24",
    draft: false,
    readingTime: `${Math.ceil(stats.minutes)} Min.`,
    content,
  };
}

/** Returns all published posts, sorted by date (newest first). */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => parseMdxFile(path.join(BLOG_DIR, f)))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Returns posts for a specific category. */
export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

/** Returns a single post by slug, or null. */
export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

/** Returns all unique tags across all posts. */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort();
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add lib/blog.ts
git commit -m "feat: add blog post parsing library (gray-matter + reading-time)"
```

---

### Task 4: Create sample blog posts

**Files:**
- Create: `content/blog/2026-03-01-elektro-vs-hybrid.mdx`
- Create: `content/blog/2026-03-02-occasion-checkliste.mdx`
- Create: `content/blog/2026-03-03-fruehlings-aktion.mdx`
- Create: `public/images/blog/.gitkeep`

**Step 1: Create directories**

```bash
mkdir -p content/blog
mkdir -p public/images/blog
touch public/images/blog/.gitkeep
```

**Step 2: Create sample ratgeber post**

File: `content/blog/2026-03-01-elektro-vs-hybrid.mdx`

```mdx
---
title: "Elektroauto vs. Hybrid: Was lohnt sich 2026 in der Schweiz?"
slug: elektro-vs-hybrid
date: 2026-03-01
category: ratgeber
excerpt: "Vollelektrisch oder Hybrid? Wir vergleichen Kosten, Reichweite und Alltagstauglichkeit für Schweizer Verhältnisse."
image: /images/blog/placeholder.jpg
tags: [elektroauto, hybrid, kaufberatung, vergleich]
author: CarTrade24
draft: false
---

## Elektro oder Hybrid — die Gretchenfrage 2026

Die Schweiz gehört europaweit zu den Spitzenreitern bei der Elektromobilität. Doch welcher Antrieb passt zu Ihnen? Wir vergleichen die wichtigsten Faktoren.

## Kosten im Vergleich

Elektrofahrzeuge sind in der Anschaffung oft günstiger als vor wenigen Jahren. Dank sinkender Batteriepreise und kantonaler Förderungen lohnt sich der Umstieg zunehmend.

- **Elektro:** Tiefere Betriebskosten (Strom vs. Benzin), weniger Wartung
- **Hybrid:** Günstigerer Einstiegspreis, Flexibilität bei langen Strecken

## Reichweite und Alltag

Für Pendler im Mittelland reichen moderne Elektroautos mit 400–600 km Reichweite locker. Wer regelmässig ins Tessin oder in die Berge fährt, profitiert vom Hybrid als Übergangslösung.

## Unser Fazit

Für die meisten Schweizer Autofahrer ist 2026 der ideale Zeitpunkt für den Umstieg auf ein Elektroauto. Wer noch zögert, findet im Plug-in-Hybrid einen guten Kompromiss.

**Entdecken Sie unsere Elektro- und Hybridfahrzeuge im Bestand — persönlich geprüft und sofort verfügbar.**
```

**Step 3: Create sample news post**

File: `content/blog/2026-03-03-fruehlings-aktion.mdx`

```mdx
---
title: "Frühlings-Aktion: Gratis Heimlieferung bis Ende März"
slug: fruehlings-aktion
date: 2026-03-03
category: news
excerpt: "Bis 31. März 2026 liefern wir Ihr neues Fahrzeug kostenlos bis vor die Haustür — im Umkreis von 50 km."
image: /images/blog/placeholder.jpg
tags: [aktion, heimlieferung, angebot]
author: CarTrade24
draft: false
---

## Frühlings-Aktion bei CarTrade24

Der Frühling ist da — und wir feiern mit einer besonderen Aktion: **Bis Ende März liefern wir jedes Fahrzeug kostenlos bis vor Ihre Haustür.**

### So funktioniert's

1. Wählen Sie Ihr Wunschfahrzeug auf unserer Website
2. Kontaktieren Sie uns für eine Beratung
3. Wir liefern — kostenlos im Umkreis von 50 km ab Wohlen

### Bedingungen

- Gültig für alle Fahrzeuge im Bestand
- Lieferung innerhalb von 50 km ab Wohlen AG
- Aktion gültig bis 31. März 2026

**Jetzt Fahrzeug aussuchen und von der Gratis-Heimlieferung profitieren!**
```

**Step 4: Create second ratgeber post**

File: `content/blog/2026-03-02-occasion-checkliste.mdx`

```mdx
---
title: "Occasion kaufen: Die ultimative Checkliste für 2026"
slug: occasion-checkliste
date: 2026-03-02
category: ratgeber
excerpt: "Worauf Sie beim Kauf eines Occasionsfahrzeugs achten müssen — von der Probefahrt bis zum Vertrag."
image: /images/blog/placeholder.jpg
tags: [occasion, kaufberatung, checkliste, tipps]
author: CarTrade24
draft: false
---

## Occasionskauf ohne böse Überraschungen

Ein Occasionsfahrzeug ist für viele Schweizerinnen und Schweizer die kluge Wahl. Doch worauf sollten Sie achten?

## Vor der Besichtigung

- **Budget festlegen:** Gesamtkosten inkl. Versicherung, Steuern, Service einplanen
- **Fahrzeughistorie prüfen:** Cardossier oder vergleichbare Prüfung anfordern
- **Marktpreise vergleichen:** Auf AutoScout24 den Durchschnittspreis für Modell und Jahrgang checken

## Bei der Probefahrt

- Motor kalt starten (zeigt Startprobleme)
- Alle Gänge durchschalten
- Bremsen testen (Geräusche, Vibrationen)
- Klimaanlage und Heizung prüfen

## Nach dem Kauf

- MFK-Termin einplanen (falls Prüfung bald fällig)
- Versicherung vergleichen und abschliessen
- Garantiebedingungen klären

**Bei CarTrade24 sind alle Occasions geprüft und kommen mit bis zu 7 Jahren Garantie.**
```

**Step 5: Commit**

```bash
git add content/ public/images/blog/.gitkeep
git commit -m "content: add 3 sample blog posts (2 ratgeber, 1 news)"
```

---

### Task 5: Create BlogCard component

**Files:**
- Create: `components/blog/BlogCard.tsx`

**Step 1: Create `components/blog/BlogCard.tsx`**

Follows the visual style of `VehicleCard.tsx` (file: `components/vehicles/VehicleCard.tsx`): white card, rounded corners, shadow, hover lift.

```tsx
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

const CATEGORY_BADGE: Record<string, { label: string; color: string }> = {
  ratgeber: { label: "Ratgeber", color: "var(--ct-cyan)" },
  news:     { label: "News & Aktionen", color: "var(--ct-magenta)" },
};

export default function BlogCard({ post }: { post: BlogPost }) {
  const badge = CATEGORY_BADGE[post.category] ?? CATEGORY_BADGE.ratgeber;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white border border-[#ebebeb] rounded-2xl overflow-hidden flex flex-col
                 shadow-[0_2px_8px_rgba(0,0,0,0.05)]
                 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1.5
                 transition-all duration-300 ease-out"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#f4f6f8]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span
          className="absolute top-3 left-3 px-2.5 py-1 text-[0.68rem] rounded-full text-white uppercase tracking-wide font-bold shadow-sm"
          style={{ backgroundColor: badge.color }}
        >
          {badge.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-[1rem] font-extrabold leading-snug mb-1 text-ct-dark line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-[#6b7280] line-clamp-2 mb-3">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-[#9ca3af]">
          <span>{new Date(post.date).toLocaleDateString("de-CH")}</span>
          <span>{post.readingTime} Lesezeit</span>
        </div>
      </div>
    </Link>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add components/blog/BlogCard.tsx
git commit -m "feat: add BlogCard component"
```

---

### Task 6: Create BlogGrid with infinite scroll

**Files:**
- Create: `components/blog/BlogGrid.tsx`

**Step 1: Create `components/blog/BlogGrid.tsx`**

Replicates the infinite scroll pattern from `components/vehicles/VehicleGrid.tsx`.

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import BlogCard from "./BlogCard";
import type { BlogPost } from "@/lib/blog";

const PAGE_SIZE = 12;

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => setVisible(PAGE_SIZE), [posts]);

  const loadMore = useCallback(() => {
    setVisible((prev) => Math.min(prev + PAGE_SIZE, posts.length));
  }, [posts.length]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 border border-[#e5e7eb] rounded-2xl">
        <p className="text-[#6b7280] font-medium">Keine Beiträge gefunden.</p>
      </div>
    );
  }

  const hasMore = visible < posts.length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.slice(0, visible).map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          <button
            type="button"
            onClick={loadMore}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity bg-ct-cyan"
          >
            Weitere Beiträge laden ({posts.length - visible} übrig)
          </button>
        </div>
      )}
    </>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add components/blog/BlogGrid.tsx
git commit -m "feat: add BlogGrid component with infinite scroll"
```

---

### Task 7: Create BlogCategoryTabs

**Files:**
- Create: `components/blog/BlogCategoryTabs.tsx`

**Step 1: Create `components/blog/BlogCategoryTabs.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";

const TABS = [
  { key: "all",      label: "Alle" },
  { key: "ratgeber", label: "Ratgeber" },
  { key: "news",     label: "News & Aktionen" },
] as const;

export type BlogTab = (typeof TABS)[number]["key"];

export default function BlogCategoryTabs({
  active,
  onChange,
}: {
  active: BlogTab;
  onChange: (tab: BlogTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all",
            active === tab.key
              ? "bg-ct-cyan text-white shadow-sm"
              : "bg-white text-[#6b7280] border border-[#e5e7eb] hover:border-ct-cyan hover:text-ct-cyan",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add components/blog/BlogCategoryTabs.tsx
git commit -m "feat: add BlogCategoryTabs component"
```

---

### Task 8: Create blog overview page

**Files:**
- Create: `components/blog/BlogContent.tsx` (client wrapper with state)
- Create: `app/[locale]/blog/page.tsx` (server page with metadata)

**Step 1: Create `components/blog/BlogContent.tsx`**

Client component that manages category filter state and passes filtered posts to BlogGrid.

```tsx
"use client";

import { useState, useMemo } from "react";
import BlogGrid from "./BlogGrid";
import BlogCategoryTabs, { type BlogTab } from "./BlogCategoryTabs";
import type { BlogPost } from "@/lib/blog";

export default function BlogContent({ posts }: { posts: BlogPost[] }) {
  const [tab, setTab] = useState<BlogTab>("all");

  const filtered = useMemo(
    () => (tab === "all" ? posts : posts.filter((p) => p.category === tab)),
    [posts, tab],
  );

  return (
    <>
      <BlogCategoryTabs active={tab} onChange={setTab} />
      <div className="mt-8">
        <BlogGrid posts={filtered} />
      </div>
    </>
  );
}
```

**Step 2: Create `app/[locale]/blog/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import BlogContent from "@/components/blog/BlogContent";
import FadeIn from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Blog & Ratgeber | CarTrade24",
  description:
    "Kaufberatung, Vergleiche, Tipps und Aktionen rund um Fahrzeuge in der Schweiz — vom Team CarTrade24 in Wohlen.",
  alternates: { canonical: "https://cartrade24.ch/blog" },
  openGraph: {
    title: "Blog & Ratgeber | CarTrade24",
    description: "Kaufberatung, Vergleiche und Aktionen rund um Fahrzeuge in der Schweiz.",
    url: "https://cartrade24.ch/blog",
    type: "website",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "CarTrade24 Blog & Ratgeber",
    description: "Kaufberatung, Vergleiche und Aktionen rund um Fahrzeuge in der Schweiz.",
    url: "https://cartrade24.ch/blog",
    publisher: {
      "@type": "Organization",
      name: "CarTrade24",
      url: "https://cartrade24.ch",
    },
  };

  return (
    <section className="bg-ct-light min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <FadeIn>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ct-dark mb-3">
            Blog & Ratgeber
          </h1>
          <p className="text-[#6b7280] max-w-2xl mb-8">
            Kaufberatung, Vergleiche, Tipps und aktuelle Aktionen — alles rund um
            Fahrzeuge in der Schweiz.
          </p>
        </FadeIn>
        <FadeIn delay={40}>
          <BlogContent posts={posts} />
        </FadeIn>
      </div>
    </section>
  );
}
```

Note: The `dangerouslySetInnerHTML` for JSON-LD is safe — content is `JSON.stringify()`'d with `</script>` escaped via `.replace(/</g, "\\u003c")`. This is the same pattern used in the VDP page (`app/[locale]/autos/[id]/page.tsx`).

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add components/blog/BlogContent.tsx app/[locale]/blog/page.tsx
git commit -m "feat: add blog overview page with category filtering"
```

---

### Task 9: Create MDX components for posts

**Files:**
- Create: `components/blog/mdx/CallToAction.tsx`
- Create: `components/blog/mdx/index.tsx`

**Step 1: Create `components/blog/mdx/CallToAction.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CallToAction({
  href = "/autos",
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-8 rounded-2xl bg-ct-cyan p-6 text-white not-prose">
      <p className="font-semibold text-lg mb-3">{children}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-ct-cyan font-bold text-sm hover:opacity-90 transition-opacity"
      >
        Fahrzeuge entdecken <ArrowRight size={16} />
      </Link>
    </div>
  );
}
```

**Step 2: Create `components/blog/mdx/index.tsx`**

```tsx
import CallToAction from "./CallToAction";

export const mdxComponents = {
  CallToAction,
};
```

**Step 3: Verify build**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add components/blog/mdx/
git commit -m "feat: add MDX components (CallToAction)"
```

---

### Task 10: Create single blog post page

**Files:**
- Create: `app/[locale]/blog/[slug]/page.tsx`

**Step 1: Create `app/[locale]/blog/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/mdx";
import BlogCard from "@/components/blog/BlogCard";
import FadeIn from "@/components/ui/FadeIn";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | CarTrade24 Blog`,
    description: post.excerpt,
    alternates: { canonical: `https://cartrade24.ch/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://cartrade24.ch/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.image.startsWith("http")
        ? [post.image]
        : [`https://cartrade24.ch${post.image}`],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Related posts: same category, exclude current, max 3
  const related = getAllPosts()
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  const categoryLabel = post.category === "news" ? "News & Aktionen" : "Ratgeber";
  const categoryColor = post.category === "news" ? "var(--ct-magenta)" : "var(--ct-cyan)";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "CarTrade24",
      url: "https://cartrade24.ch",
    },
    url: `https://cartrade24.ch/blog/${post.slug}`,
    image: post.image.startsWith("http")
      ? post.image
      : `https://cartrade24.ch${post.image}`,
  };

  return (
    <article className="bg-ct-light min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero image */}
      {post.image && (
        <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-[#e5e7eb]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <FadeIn>
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-ct-cyan transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Zurück zum Blog
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className="px-2.5 py-1 text-[0.68rem] rounded-full text-white uppercase tracking-wide font-bold"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryLabel}
            </span>
            <span className="text-sm text-[#9ca3af]">
              {new Date(post.date).toLocaleDateString("de-CH")} · {post.readingTime} Lesezeit
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ct-dark mb-8 leading-tight">
            {post.title}
          </h1>
        </FadeIn>

        {/* MDX Content */}
        <FadeIn delay={40}>
          <div className="prose prose-lg prose-blog max-w-none">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </FadeIn>

        {/* Tags */}
        {post.tags.length > 0 && (
          <FadeIn delay={60}>
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[#e5e7eb]">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full bg-white border border-[#e5e7eb] text-[#6b7280]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Related posts */}
        {related.length > 0 && (
          <FadeIn delay={80}>
            <div className="mt-12">
              <h2 className="text-xl font-extrabold text-ct-dark mb-6">
                Das könnte Sie auch interessieren
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((r) => (
                  <BlogCard key={r.slug} post={r} />
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </article>
  );
}
```

Note: The `dangerouslySetInnerHTML` for JSON-LD is safe — same pattern as VDP page.

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: add single blog post page with MDX rendering + related posts"
```

---

### Task 11: Add blog to header navigation

**Files:**
- Modify: `components/layout/Header.tsx:11-18`

**Step 1: Add "Blog" to navLinks**

In `Header.tsx`, change the navLinks array to include Blog after Firmenkunden:

```typescript
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/autos", label: "Autos" },
  { href: "/finanzierung", label: "Finanzierung" },
  { href: "/firmenkunden", label: "Firmenkunden" },
  { href: "/blog", label: "Blog" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat: add Blog link to header navigation"
```

---

### Task 12: Add blog routes to sitemap

**Files:**
- Modify: `app/sitemap.ts`

**Step 1: Import blog utility and add blog routes**

Replace the entire `app/sitemap.ts` with:

```typescript
import type { MetadataRoute } from "next";
import { fetchVehicles } from "@/lib/as24";
import { getAllPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://cartrade24.ch";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                   lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/autos`,        lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/blog`,         lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/finanzierung`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/firmenkunden`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/ankauf`,       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/garantie`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`,          lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/ueber-uns`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/kontakt`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/news`,         lastModified: now, changeFrequency: "weekly",  priority: 0.5 },
    { url: `${base}/agb`,          lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${base}/datenschutz`,  lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  // Dynamic vehicle routes
  let vehicleRoutes: MetadataRoute.Sitemap = [];
  try {
    const vehicles = await fetchVehicles();
    vehicleRoutes = vehicles.map((v) => ({
      url: `${base}/autos/${v.id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch {
    // Fehler ignorieren — Sitemap ohne Fahrzeuge
  }

  // Dynamic blog routes
  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...vehicleRoutes, ...blogRoutes];
}
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat: add blog routes to sitemap"
```

---

### Task 13: Create KI blog post generator script

**Files:**
- Create: `scripts/generate-blog-post.ts`

**Step 1: Create `scripts/generate-blog-post.ts`**

CLI script that generates a draft blog post via Claude Haiku.

```typescript
#!/usr/bin/env npx tsx
/**
 * Blog Post Generator — uses Claude Haiku to create draft MDX posts.
 *
 * Usage:
 *   npx tsx scripts/generate-blog-post.ts "Thema des Beitrags" --category ratgeber
 *   npx tsx scripts/generate-blog-post.ts "Neue Modelle im Frühling" --category news --tags modelle,neuheit
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseArgs() {
  const args = process.argv.slice(2);
  const topic = args.find((a) => !a.startsWith("--"));
  const category = args.find((a) => a.startsWith("--category="))?.split("=")[1]
    ?? (args.includes("--category") ? args[args.indexOf("--category") + 1] : "ratgeber");
  const tagsRaw = args.find((a) => a.startsWith("--tags="))?.split("=")[1]
    ?? (args.includes("--tags") ? args[args.indexOf("--tags") + 1] : "");
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()) : [];

  if (!topic) {
    console.error("Usage: npx tsx scripts/generate-blog-post.ts \"Thema\" --category ratgeber --tags tag1,tag2");
    process.exit(1);
  }

  return { topic, category, tags };
}

async function generate(topic: string, category: string, tags: string[]) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY ist nicht gesetzt.");
    process.exit(1);
  }

  const client = new Anthropic();

  console.log(`Generiere Blogbeitrag zu: "${topic}" (${category})...`);

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: `Du bist ein professioneller Texter für den Schweizer Automobilhandel.
Schreibe Blog-Beiträge auf Schweizer Hochdeutsch (Sie-Form).
Verwende Schweizer Terminologie: "Occasion" (nicht "Gebrauchtwagen"), "Fahrzeug", CHF (nicht EUR).
Strukturiere den Text mit Markdown-Überschriften (## und ###), Listen und Absätzen.
Der Text soll SEO-optimiert sein mit relevanten Long-Tail Keywords.
Am Ende soll ein kurzer Call-to-Action stehen, der auf CarTrade24 verweist.
Antworte ausschliesslich mit validem JSON im folgenden Format:
{
  "title": "SEO-optimierter Titel (max 70 Zeichen)",
  "excerpt": "Meta-Description / Auszug (max 155 Zeichen)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "content": "Der vollständige Markdown-Text..."
}`,
    messages: [{
      role: "user",
      content: `Schreibe einen Blog-Beitrag zum Thema: "${topic}"
Kategorie: ${category === "news" ? "News & Aktionen" : "Ratgeber / Kaufberatung"}
${tags.length > 0 ? `Relevante Tags: ${tags.join(", ")}` : ""}
Zielgruppe: Autointeressenten in der Schweiz (Region Aargau/Mittelland)
Unternehmen: CarTrade24, Fahrzeughändler in Wohlen AG`,
    }],
  });

  const first = response.content[0];
  if (first.type !== "text") throw new Error("Unexpected response type");

  return JSON.parse(first.text.trim()) as {
    title: string;
    excerpt: string;
    tags: string[];
    content: string;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const { topic, category, tags } = parseArgs();
  const result = await generate(topic, category, tags);

  const today = new Date().toISOString().split("T")[0];
  const slug = slugify(result.title);
  const filename = `${today}-${slug}.mdx`;
  const filePath = path.join(BLOG_DIR, filename);

  const allTags = [...new Set([...tags, ...result.tags])];

  const frontmatter = [
    "---",
    `title: "${result.title}"`,
    `slug: ${slug}`,
    `date: ${today}`,
    `category: ${category}`,
    `excerpt: "${result.excerpt}"`,
    `image: /images/blog/placeholder.jpg`,
    `tags: [${allTags.join(", ")}]`,
    `author: CarTrade24`,
    `draft: true`,
    "---",
  ].join("\n");

  const mdx = `${frontmatter}\n\n${result.content}\n`;

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  fs.writeFileSync(filePath, mdx, "utf-8");

  console.log(`\nEntwurf erstellt: ${filePath}`);
  console.log(`   Titel: ${result.title}`);
  console.log(`   Status: draft (auf "false" setzen zum Veröffentlichen)`);
}

main().catch((err) => {
  console.error("Fehler:", err.message);
  process.exit(1);
});
```

**Step 2: Commit**

```bash
git add scripts/generate-blog-post.ts
git commit -m "feat: add CLI script for AI-powered blog post generation"
```

---

### Task 14: Verify full build and create PR

**Step 1: Run full build**

```bash
npm run build
```

Expected: build succeeds with blog pages included.

**Step 2: Verify dev server shows blog**

```bash
npm run dev
```

Open `http://localhost:3000/blog` — should show 3 sample posts with category tabs.
Open `http://localhost:3000/blog/elektro-vs-hybrid` — should render full MDX post.

**Step 3: Push and create PR**

```bash
git push -u origin feature/blog-hybrid
gh pr create --title "feat: Blog & Ratgeber (Hybrid MDX + KI)" --body "$(cat <<'EOF'
## Summary
- Blog section with MDX content, infinite scroll, and category filtering
- CLI script for AI-powered draft generation via Claude Haiku
- 3 sample blog posts (2 Ratgeber, 1 News)
- Full SEO: JSON-LD (Blog + BlogPosting), Open Graph, sitemap integration
- Blog link in header navigation
- Design consistent with existing VehicleCard/VehicleGrid patterns

## New files
- `lib/blog.ts` — Post parsing, sorting, filtering
- `components/blog/` — BlogCard, BlogGrid, BlogCategoryTabs, BlogContent
- `components/blog/mdx/` — Custom MDX components (CallToAction)
- `app/[locale]/blog/page.tsx` — Blog overview
- `app/[locale]/blog/[slug]/page.tsx` — Single post page
- `scripts/generate-blog-post.ts` — AI draft generator
- `content/blog/*.mdx` — Sample content

## Usage: Generate a blog post
    npx tsx scripts/generate-blog-post.ts "Thema" --category ratgeber --tags tag1,tag2

## Test plan
- [ ] /blog shows 3 sample posts with working category tabs
- [ ] /blog/elektro-vs-hybrid renders full MDX content
- [ ] Infinite scroll loads more posts when scrolling
- [ ] Category filtering works (Alle / Ratgeber / News)
- [ ] Related posts appear at bottom of single post
- [ ] Blog link appears in header navigation
- [ ] Blog routes appear in sitemap.xml
- [ ] Build succeeds without errors

Generated with Claude Code
EOF
)"
```
