import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface LocationContent {
  title: string;
  description: string;
  h1: string;
  body: string;
}

export function getLocationContent(slug: string): LocationContent | null {
  const filePath = path.join(process.cwd(), "content", "locations", `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    title: data.title ?? `Occasion kaufen in ${slug}`,
    description: data.description ?? "",
    h1: data.h1 ?? data.title ?? "",
    body: content,
  };
}
