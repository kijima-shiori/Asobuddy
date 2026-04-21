import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['*.ngrok-free.app'],
  devIndicators: {
    appIsrStatus: false,
  },
}

export default nextConfig
