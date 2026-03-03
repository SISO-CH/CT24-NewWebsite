#!/usr/bin/env npx tsx
/**
 * Blog Post Generator — uses Claude Haiku to create draft MDX posts.
 *
 * Usage:
 *   npx tsx scripts/generate-blog-post.ts "Thema des Beitrags" --category ratgeber
 *   npx tsx scripts/generate-blog-post.ts "Neue Modelle" --category news --tags modelle,neuheit
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

function escapeYaml(s: string): string {
  return s.replace(/"/g, '\\"');
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
    `title: "${escapeYaml(result.title)}"`,
    `slug: ${slug}`,
    `date: ${today}`,
    `category: ${category}`,
    `excerpt: "${escapeYaml(result.excerpt)}"`,
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
