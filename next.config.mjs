/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Explicitly enable the App Router
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // This is crucial - tell webpack to ignore server-only modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Replace server-only modules with empty modules
      config.resolve.alias['next/headers'] = require.resolve('./lib/empty-module.js')
      config.resolve.alias['server-only'] = require.resolve('./lib/empty-module.js')
      config.resolve.alias['next/cache'] = require.resolve('./lib/empty-module.js')
    }
    return config
  },
}

export default nextConfig
