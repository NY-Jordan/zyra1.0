import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@zyra/ui", "@zyra/email"],
};

export default nextConfig;
