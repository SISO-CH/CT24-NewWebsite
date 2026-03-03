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

  const related = getAllPosts()
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  const categoryLabel = post.category === "news" ? "News & Aktionen" : "Ratgeber";
  const categoryColor = post.category === "news" ? "var(--ct-magenta)" : "var(--ct-cyan)";

  // JSON-LD structured data for SEO — safe because JSON.stringify produces
  // valid JSON and we escape "</script>" via the \u003c replacement.
  // Same pattern as app/[locale]/autos/[id]/page.tsx (VDP page).
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

  const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <article className="bg-ct-light min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
      />

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
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-ct-cyan transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Zurück zum Blog
          </Link>

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

          <h1 className="text-3xl sm:text-4xl font-extrabold text-ct-dark mb-8 leading-tight">
            {post.title}
          </h1>
        </FadeIn>

        <FadeIn delay={40}>
          <div className="prose prose-lg prose-blog max-w-none">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </FadeIn>

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
