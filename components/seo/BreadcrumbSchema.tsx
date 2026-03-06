import Link from "next/link";

interface Crumb {
  name: string;
  href: string;
}

interface BreadcrumbSchemaProps {
  crumbs: Crumb[];
  className?: string;
}

export default function BreadcrumbSchema({ crumbs, className }: BreadcrumbSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `https://cartrade24.ch${crumb.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={className ?? "max-w-7xl mx-auto px-4 pt-20 pb-2"}
      >
        <ol className="flex flex-wrap items-center gap-1 text-xs text-[#9ca3af]">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden="true">/</span>}
                {isLast ? (
                  <span>{crumb.name}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-[var(--ct-cyan)] transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
