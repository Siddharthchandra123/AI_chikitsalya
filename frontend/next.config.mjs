/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  headers: async () => {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff'
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY'
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block'
            }
          ]
        }
      ]
    }
    return []
  }
}

export default nextConfig
