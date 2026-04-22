import type { NextConfig } from 'next'
const nextConfig = {
  allowedDevOrigins: ['*.ngrok-free.app'],
  devIndicators: {
    appIsrStatus: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ivmylgnaxsbbszcpytrh.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
