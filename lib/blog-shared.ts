export type BlogCategory = "ratgeber" | "news";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: BlogCategory;
  excerpt: string;
  image: string;
  tags: string[];
  author: string;
  draft: boolean;
  readingTime: string;
  content: string;
}

export type BlogPostSummary = Omit<BlogPost, "content">;

export const BLOG_CATEGORIES: Record<BlogCategory, { label: string; color: string }> = {
  ratgeber: { label: "Ratgeber", color: "var(--ct-cyan)" },
  news:     { label: "News & Aktionen", color: "var(--ct-magenta)" },
};
