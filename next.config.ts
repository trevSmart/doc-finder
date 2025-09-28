import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3005',
        pathname: '/api/file-preview',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/file-preview',
      },
    ],
  },
};

export default nextConfig;
