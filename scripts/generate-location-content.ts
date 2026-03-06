/**
 * generate-location-content.ts
 *
 * Generates MDX content files for each location using Claude AI.
 * Output: content/locations/{slug}.mdx
 *
 * Usage:  npx tsx scripts/generate-location-content.ts
 *
 * Requires ANTHROPIC_API_KEY in environment.
 * DO NOT run automatically — run manually when location content needs (re-)generation.
 */

import fs from "fs";
import path from "path";
import { getClient } from "../lib/ai";
import { locations } from "../lib/locations";

const OUTPUT_DIR = path.join(process.cwd(), "content", "locations");
const DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function placeholderContent(name: string, kanton: string): string {
  return [
    "---",
    `title: "Occasion kaufen in ${name} (${kanton}) — Car Trade24"`,
    `description: "Gepruefte Occasionen und Neuwagen in ${name}. Besuchen Sie Car Trade24 in Wohlen AG."`,
    `h1: "Occasion kaufen in ${name}"`,
    "---",
    "",
    `Entdecken Sie unser Sortiment an geprueften Occasionen und Neuwagen — ganz in der Naehe von ${name}.`,
    "",
    "## Haeufige Fragen",
    "",
    `### Wie weit ist Car Trade24 von ${name} entfernt?`,
    "",
    `Unser Standort in Wohlen AG ist bequem von ${name} aus erreichbar.`,
    "",
    `### Kann ich eine Probefahrt in ${name} buchen?`,
    "",
    "Ja, vereinbaren Sie einfach einen Termin ueber unsere Website oder telefonisch.",
    "",
    "### Bietet Car Trade24 Lieferung nach " + name + " an?",
    "",
    `Ja, wir bieten Home Delivery in die Region ${name} an. Kontaktieren Sie uns fuer Details.`,
    "",
  ].join("\n");
}

async function generateForLocation(
  name: string,
  slug: string,
  kanton: string,
  distanceKm: number,
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(`  ⚠ No ANTHROPIC_API_KEY — writing placeholder for ${name}`);
    return placeholderContent(name, kanton);
  }

  try {
    const client = getClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system:
        "Du bist ein SEO-Texter fuer einen Schweizer Autohändler (Car Trade24, Wohlen AG). " +
        "Schreibe auf Deutsch (Schweizer Stil, kein ß). Antworte NUR mit dem gewuenschten Inhalt, ohne Erklaerungen.",
      messages: [
        {
          role: "user",
          content: `Erstelle eine lokale SEO-Landingpage fuer "${name}" (Kanton ${kanton}, ca. ${distanceKm} km von Wohlen AG).

Gib mir EXAKT dieses Format (MDX mit Frontmatter):

---
title: "Occasion kaufen in ${name} (${kanton}) — Car Trade24"
description: "[Meta-Description, max. 155 Zeichen, mit '${name}' und 'Occasion']"
h1: "Occasion kaufen in ${name}"
---

[~150 Woerter Einleitung ueber Autokauf in ${name}, erwaehne Car Trade24 in Wohlen AG, Entfernung ${distanceKm} km, gepruefte Occasionen, Leasing, Garantie]

## Haeufige Fragen

### [Frage 1 zu Anfahrt/Entfernung von ${name}]

[Antwort ~30 Woerter]

### [Frage 2 zu Probefahrt/Service fuer Kunden aus ${name}]

[Antwort ~30 Woerter]

### [Frage 3 zu Lieferung/Finanzierung fuer ${name}]

[Antwort ~30 Woerter]`,
        },
      ],
    });

    const first = response.content[0];
    if (first.type === "text" && first.text.includes("---")) {
      return first.text.trim() + "\n";
    }

    console.warn(`  ⚠ Unexpected AI response for ${name} — using placeholder`);
    return placeholderContent(name, kanton);
  } catch (error) {
    console.error(`  ✗ AI error for ${name}:`, error);
    return placeholderContent(name, kanton);
  }
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`Generating location content for ${locations.length} cities...\n`);

  for (const loc of locations) {
    const filePath = path.join(OUTPUT_DIR, `${loc.slug}.mdx`);

    if (fs.existsSync(filePath)) {
      console.log(`  ✓ ${loc.name} — already exists, skipping`);
      continue;
    }

    console.log(`  → Generating ${loc.name} (${loc.kanton})...`);
    const content = await generateForLocation(loc.name, loc.slug, loc.kanton, loc.distanceKm);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`  ✓ ${loc.name} — written`);

    await sleep(DELAY_MS);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
