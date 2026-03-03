"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import BlogCard from "./BlogCard";
import type { BlogPost, BlogPostSummary } from "@/lib/blog";

const PAGE_SIZE = 12;

export default function BlogGrid({ posts }: { posts: (BlogPost | BlogPostSummary)[] }) {
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
