/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@zyra/ui", "@zyra/email"],
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
