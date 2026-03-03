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

  // Safe JSON-LD pattern: static data is JSON.stringify'd and script tags are escaped.
  // This same pattern is used on the VDP page and other pages in this project.
  const jsonLdHtml = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <section className="bg-ct-light min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
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
