import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ["mysql2"],
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
