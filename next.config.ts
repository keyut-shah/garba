import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static: no server, no adapter, no bandwidth meter to blow through.
  // `out/` is uploaded as the Worker's static assets; the only dynamic thing
  // on the site is the presence socket, which is a Durable Object, not Next.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
