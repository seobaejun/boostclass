import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 빌드 시 ESLint 경고도 표시하도록 설정
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScript 에러가 있어도 빌드는 계속 진행
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
