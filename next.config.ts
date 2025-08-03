import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Enable experimental features if needed
  },
  images: {
    domains: ['localhost', 'fastapi.localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       // headers: [
  //       //   {
  //       //     key: 'Content-Security-Policy',
  //       //     value: "default-src 'self'; connect-src 'self' http://fastapi.localhost;",
  //       //   },
  //       // ],
  //     },
  //   ];
  // },
};

export default nextConfig;
