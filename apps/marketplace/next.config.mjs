/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@zyra/ui", "@zyra/email"],
  // Next's image optimizer needs `sharp` in the Netlify function bundle, which
  // isn't installed anywhere in this monorepo — without it, /_next/image
  // requests fail silently in production. Serve the (already build-time
  // static-imported) images as-is instead of routing them through it.
  images: {
    unoptimized: true,
  },
}

export default nextConfig
