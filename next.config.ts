import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray package-lock.json in $HOME otherwise makes
  // Next infer the wrong root.
  turbopack: { root: path.resolve(__dirname) },
  // Allow LAN devices (iPad etc.) to load dev assets — dev server binds 0.0.0.0.
  allowedDevOrigins: ["192.168.1.75", "192.168.1.*"],
};

export default nextConfig;
