import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "listing-images.autoscout24.ch",
        pathname: "/**",
      },
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

const intlConfig = withNextIntl(nextConfig);

export default withSentryConfig(intlConfig, {
  silent: !process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableLogger: true,
});
