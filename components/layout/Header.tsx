"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import RecentlyViewedFlyout from "@/components/layout/RecentlyViewedFlyout";
import WishlistFlyout from "@/components/layout/WishlistFlyout";
import { trackEvent } from "@/lib/tracking";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/autos", label: "Autos" },
  { href: "/finanzierung", label: "Finanzierung" },
  { href: "/firmenkunden", label: "Firmenkunden" },
  { href: "/blog", label: "Blog" },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];


export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3-column grid: logo | nav | cta */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-4">
          <Link href="/" className="flex-shrink-0">
            <Logo variant="dark" width={148} />
          </Link>

          {/* Desktop nav — centered */}
          <nav className="hidden lg:flex items-center justify-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 font-medium text-[0.82rem] uppercase tracking-[0.06em] transition-colors rounded-md",
                  pathname === link.href
                    ? "text-[var(--ct-cyan)]"
                    : "text-[#374151] hover:text-[var(--ct-cyan)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Phone CTA (desktop) + Mobile toggle */}
          <div className="flex items-center justify-end gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <WishlistFlyout />
              <RecentlyViewedFlyout />
              <LocaleSwitcher />
              <a
                href="tel:+41566185544"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--ct-cyan)" }}
                onClick={() => trackEvent({ event: "phone_click", source_page: pathname, value: 50 })}
              >
                <Phone size={13} />
                +41 56 618 55 44
              </a>
            </div>
            <button
              className="lg:hidden p-2 rounded-md text-[#374151]"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menü öffnen"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-screen" : "max-h-0"
        )}
      >
        <div className="bg-white border-t border-[#f0f0f0] px-4 py-4 space-y-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block py-3 px-2 font-medium text-sm uppercase tracking-[0.06em] transition-colors rounded-md",
                pathname === link.href
                  ? "text-[var(--ct-cyan)]"
                  : "text-[#374151] hover:text-[var(--ct-cyan)]"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#f0f0f0] mt-2 flex items-center gap-3">
            <LocaleSwitcher />
            <a
              href="tel:+41566185544"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: "var(--ct-cyan)" }}
              onClick={() => trackEvent({ event: "phone_click", source_page: pathname, value: 50 })}
            >
              <Phone size={13} />
              +41 56 618 55 44
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
