import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { routing } from "@/i18n/routing";
import "../globals.css";

type Locale = (typeof routing.locales)[number];
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
        url: "/og-image.jpg",
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
    languages: {
      "de": "https://cartrade24.ch",
      "fr": "https://cartrade24.ch/fr",
      "it": "https://cartrade24.ch/it",
      "en": "https://cartrade24.ch/en",
      "x-default": "https://cartrade24.ch",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={montserrat.variable}>
      <body className="flex flex-col min-h-screen">
        <GTMScript />
        <MatelsoScript />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
          <MobileCTABar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
