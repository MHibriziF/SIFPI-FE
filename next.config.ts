import type { NextConfig } from 'next';

const imageHostnames = (
  process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES ?? 'images.unsplash.com,*.r2.dev,*.cloudflarestorage.com'
)
  .split(',')
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: imageHostnames.map(hostname => ({
      protocol: 'https' as const,
      hostname,
      port: '',
      pathname: '/**',
    })),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
