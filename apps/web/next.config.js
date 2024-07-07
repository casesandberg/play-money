/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@play-money/ui'],
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.NEXT_PUBLIC_API_URL],
    },
  },
}
