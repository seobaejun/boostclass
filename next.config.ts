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
  // Next.js 15 서버/클라이언트 컴포넌트 경계 명확화
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
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
  // 번들 최적화 설정
  compiler: {
    // 프로덕션 빌드에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // 웹팩 최적화 설정
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 환경에서 번들 크기 최적화
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        // 코드 스플리팅 최적화
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // 공통 의존성 분리
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // 큰 라이브러리 분리
            reactPlayer: {
              name: 'react-player',
              test: /[\\/]node_modules[\\/]react-player[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            supabase: {
              name: 'supabase',
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
