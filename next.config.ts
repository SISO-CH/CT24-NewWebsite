import type { NextConfig } from "next";

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
      {
        source: "/informationen",
        destination: "/ueber-uns",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
