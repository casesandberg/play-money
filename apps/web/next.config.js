/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@play-money/ui'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001'],
    },
  },
}
