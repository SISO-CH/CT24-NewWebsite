import Image from "next/image";
import Link from "next/link";
import { BLOG_CATEGORIES, type BlogPost, type BlogPostSummary } from "@/lib/blog-shared";

export default function BlogCard({ post }: { post: BlogPost | BlogPostSummary }) {
  const badge = BLOG_CATEGORIES[post.category];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-white border border-[#ebebeb] rounded-2xl overflow-hidden flex flex-col
                 shadow-[0_2px_8px_rgba(0,0,0,0.05)]
                 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1.5
                 transition-all duration-300 ease-out"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#f4f6f8]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span
          className="absolute top-3 left-3 px-2.5 py-1 text-[0.68rem] rounded-full text-white uppercase tracking-wide font-bold shadow-sm"
          style={{ backgroundColor: badge.color }}
        >
          {badge.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="text-[1rem] font-extrabold leading-snug mb-1 text-ct-dark line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-[#6b7280] line-clamp-2 mb-3">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-[#9ca3af]">
          <span>{new Date(post.date).toLocaleDateString("de-CH")}</span>
          <span>{post.readingTime} Lesezeit</span>
        </div>
      </div>
    </Link>
  );
}
