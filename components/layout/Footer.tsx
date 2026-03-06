import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { locations } from "@/lib/locations";

/* ── Helper: column header label ──────────────────────────── */
function ColLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="uppercase mb-4 tracking-[0.1em]"
      style={{ color: "#6b7280", fontSize: "0.7rem", fontWeight: 600 }}
    >
      {children}
    </p>
  );
}

/* ── Helper: nav link ──────────────────────────────────────── */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="block text-[#d1d5db] hover:text-[#00a0e3] transition-colors duration-200"
        style={{ fontSize: "0.875rem" }}
      >
        {children}
      </Link>
    </li>
  );
}

/* ── Helper: icon button (pure CSS hover) ──────────────────── */
function IconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 rounded-full flex items-center justify-center
                 bg-white/[0.06] hover:bg-white/[0.12] transition-colors duration-200"
    >
      {children}
    </a>
  );
}

/* ── Footer ─────────────────────────────────────────────────── */
// NOTE: Footer is a server component — onClick tracking for phone/email links
// is not possible here. MobileCTABar covers mobile phone tracking, and
// Matelso dynamic number insertion handles desktop call tracking.
export default function Footer() {
  return (
    <footer
      style={{
        background: "linear-gradient(to bottom, #141414, #0a0a0a)",
        borderTop: "2px solid transparent",
        borderImage: "linear-gradient(90deg, #00a0e3, #e4007d) 1",
      }}
    >
      <div className="max-w-7xl mx-auto" style={{ padding: "3.5rem 1.5rem 2rem" }}>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 lg:gap-12">

          {/* ── Col 1: Brand ── */}
          <div>
            <Logo variant="light" width={200} />

            <p
              className="mt-3 leading-relaxed"
              style={{ color: "#9ca3af", fontSize: "0.875rem", maxWidth: "220px" }}
            >
              Ihr Spezialist für geprüfte Occasionen in der Schweiz.
            </p>

            {/* Contact icon buttons */}
            <div className="flex gap-2.5 mt-5">
              <IconButton href="tel:+41566185544" label="Telefon anrufen">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </IconButton>

              <IconButton href="mailto:info@cartrade24.ch" label="E-Mail senden">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </IconButton>

              <IconButton
                href="https://maps.google.com/?q=Ringstrasse+26+5610+Wohlen"
                label="Standort anzeigen"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </IconButton>
            </div>
          </div>

          {/* ── Col 2: Fahrzeuge ── */}
          <div>
            <ColLabel>Fahrzeuge</ColLabel>
            <ul className="space-y-2.5">
              <FooterLink href="/autos">Alle Fahrzeuge</FooterLink>
              <FooterLink href="/finanzierung">Leasing & Finanzierung</FooterLink>
              <FooterLink href="/ankauf">Fahrzeug verkaufen</FooterLink>
              <FooterLink href="/inzahlungnahme">Inzahlungnahme</FooterLink>
              <FooterLink href="/firmenkunden">Firmenkunden</FooterLink>
              <FooterLink href="/haendler">Für Händler</FooterLink>
              <FooterLink href="/probefahrt">Probefahrt buchen</FooterLink>
              <FooterLink href="/home-delivery">Home Delivery</FooterLink>
              <FooterLink href="/zulassungsservice">Zulassungsservice</FooterLink>
              <FooterLink href="/fahrzeug-sourcing">Fahrzeug-Sourcing</FooterLink>
              <FooterLink href="/fahrzeug-archiv">Fahrzeug-Archiv</FooterLink>
            </ul>
          </div>

          {/* ── Col 3: Unternehmen ── */}
          <div>
            <ColLabel>Unternehmen</ColLabel>
            <ul className="space-y-2.5">
              <FooterLink href="/ueber-uns">Über uns</FooterLink>
              <FooterLink href="/garantie">Garantie</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
              <FooterLink href="/news">News</FooterLink>
              <FooterLink href="/agb">AGB</FooterLink>
              <FooterLink href="/datenschutz">Datenschutz</FooterLink>
            </ul>
          </div>

          {/* ── Col 4: Kontakt ── */}
          <div>
            <ColLabel>Kontakt</ColLabel>
            <div
              className="leading-[1.8]"
              style={{ color: "#9ca3af", fontSize: "0.875rem" }}
            >
              <p>📍 Ringstrasse 26, 5610 Wohlen</p>
              <p>
                <a href="tel:+41566185544" className="hover:text-white transition-colors duration-200">
                  📞 +41 56 618 55 44
                </a>
              </p>
              <p>
                <a href="mailto:info@cartrade24.ch" className="hover:text-white transition-colors duration-200">
                  ✉️ info@cartrade24.ch
                </a>
              </p>
              <p className="text-[10px] text-[#6b7280] mt-1">
                {/* TODO: Replace with real UID from MWST-Register — mwst.admin.ch */}
                UID: CHE-XXX.XXX.XXX MWST
              </p>
            </div>

            {/* Öffnungszeiten box */}
            <div
              className="rounded-lg mt-4 p-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="rounded-full flex-shrink-0"
                  style={{ width: 8, height: 8, backgroundColor: "#009640", display: "inline-block" }}
                />
                <span style={{ color: "#9ca3af", fontSize: "0.78rem" }}>
                  Heute geöffnet
                </span>
              </div>
              <p style={{ color: "#d1d5db", fontSize: "0.8rem", lineHeight: 1.6 }}>
                Mo–Fr&nbsp;&nbsp;08:30–18:30<br />
                Sa&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;09:00–16:00
              </p>
            </div>
          </div>
        </div>

        {/* ── Standorte ── */}
        <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <ColLabel>Standorte</ColLabel>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {locations.map((l) => (
              <Link
                key={l.slug}
                href={`/autos-in-${l.slug}`}
                className="text-[#d1d5db] hover:text-[#00a0e3] transition-colors duration-200"
                style={{ fontSize: "0.875rem" }}
              >
                {l.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Divider + Copyright ── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p style={{ color: "#4b5563", fontSize: "0.78rem" }}>
            © {new Date().getFullYear()} Car Trade24 GmbH. Alle Rechte vorbehalten.
          </p>
          <p style={{ color: "#4b5563", fontSize: "0.78rem" }}>
            Mit ❤️ entwickelt in der Schweiz
          </p>
        </div>
      </div>
    </footer>
  );
}
