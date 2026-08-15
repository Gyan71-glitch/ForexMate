import type { NextConfig } from "next";

const rawBackendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const backendBase = rawBackendUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendBase}/api/v1/:path*`, // Proxy to Live Backend
      },
      {
        source: '/uploads/:path*',
        destination: `${backendBase}/uploads/:path*`, // Proxy uploads static assets
      },
    ];
  },
};

export default nextConfig;
