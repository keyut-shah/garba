import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static: no server, no adapter, no bandwidth meter to blow through.
  // Deploys as-is to Cloudflare Pages (build output dir: `out`).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
