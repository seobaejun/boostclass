import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 빌드 시 ESLint 경고는 무시 (배포용)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript 에러가 있어도 빌드는 계속 진행 (배포용)
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
  },
};

export default nextConfig;
