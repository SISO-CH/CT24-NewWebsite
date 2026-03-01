import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/ui/CookieBanner";
import GTMScript from "@/components/analytics/GTMScript";
import MatelsoScript from "@/components/analytics/MatelsoScript";
import MobileCTABar from "@/components/ui/MobileCTABar";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Car Trade24 GmbH – Occasion & Neuwagen Schweiz",
    template: "%s | Car Trade24 GmbH",
  },
  description:
    "Geprüfte Occasionen und Neuwagen in Wohlen (Aargau). Schweizweite Lieferung, bis zu 7 Jahre Garantie.",
  metadataBase: new URL("https://cartrade24.ch"),
  openGraph: {
    type: "website",
    locale: "de_CH",
    url: "https://cartrade24.ch",
    siteName: "Car Trade24 GmbH",
    title: "Car Trade24 GmbH – Occasion & Neuwagen Schweiz",
    description:
      "Geprüfte Occasionen und Neuwagen in Wohlen (Aargau). Schweizweite Lieferung, bis zu 7 Jahre Garantie.",
    images: [
      {
        url: "/og-image.jpg", // 1200×630px in /public ablegen
        width: 1200,
        height: 630,
        alt: "Car Trade24 GmbH – Ihr Autohandel in Wohlen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Car Trade24 GmbH – Occasion & Neuwagen Schweiz",
    description: "Geprüfte Occasionen in Wohlen (Aargau). Bis zu 7 Jahre Garantie.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://cartrade24.ch",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={montserrat.variable}>
      <body className="flex flex-col min-h-screen">
        <GTMScript />
        <MatelsoScript />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <MobileCTABar />
      </body>
    </html>
  );
}
