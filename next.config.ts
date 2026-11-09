import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    agentFeedback: true,
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Allow phones testing via LAN IP or an ngrok tunnel to load dev assets/HMR.
  allowedDevOrigins: [
    "192.168.0.105",
    "100.82.88.116",
    "*.ngrok-free.dev",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
