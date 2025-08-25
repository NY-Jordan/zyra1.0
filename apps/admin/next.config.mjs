/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@zyra/ui"],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
