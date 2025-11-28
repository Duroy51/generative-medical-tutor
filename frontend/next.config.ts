import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iywhbpfquqcejlklujzl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp','image/avif'],
    // <- IMPORTANT : bypass de l'optimiseur Next.js
    unoptimized: true,
  },
  experimental: {
    proxyTimeout: 180000, // vous pouvez garder
  },
};

export default nextConfig;