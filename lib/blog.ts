import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export { BLOG_CATEGORIES } from "./blog-shared";
export type { BlogCategory, BlogPost, BlogPostSummary } from "./blog-shared";
import type { BlogCategory, BlogPost, BlogPostSummary } from "./blog-shared";

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

let _cachedPosts: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (_cachedPosts) return _cachedPosts;

  let files: string[];
  try {
    files = fs.readdirSync(BLOG_DIR);
  } catch {
    return [];
  }

  _cachedPosts = files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => parseMdxFile(path.join(BLOG_DIR, f)))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));

  return _cachedPosts;
}

export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export function getAllPostSummaries(): BlogPostSummary[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return getAllPosts().map(({ content, ...rest }) => rest);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort();
}
