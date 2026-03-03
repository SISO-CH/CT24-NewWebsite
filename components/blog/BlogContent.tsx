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
