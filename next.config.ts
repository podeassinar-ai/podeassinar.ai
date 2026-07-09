import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS project. Without this, an unrelated
  // ~/pnpm-lock.yaml made Next infer the home dir as the root, mis-tracing the
  // build output.
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
