import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/api/v1/:path*', // Proxy to Backend
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*', // Proxy uploads static assets
      },
    ];
  },
};

export default nextConfig;
