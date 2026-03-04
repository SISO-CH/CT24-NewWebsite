"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/tracking";

interface Props {
  slug: string;
  category: string;
}

export default function TrackBlogRead({ slug, category }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (fired.current) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.5) {
        fired.current = true;
        trackEvent({ event: "blog_read", post_slug: slug, post_category: category });
        window.removeEventListener("scroll", handler);
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [slug, category]);

  return null;
}
