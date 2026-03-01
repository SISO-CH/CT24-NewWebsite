import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.autoscout24.ch",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/informationen", destination: "/ueber-uns", permanent: true },
      { source: "/fr/informationen", destination: "/fr/ueber-uns", permanent: true },
      { source: "/it/informationen", destination: "/it/ueber-uns", permanent: true },
      { source: "/en/informationen", destination: "/en/ueber-uns", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
