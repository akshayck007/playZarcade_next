/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '**.gamepix.com',
      },
      {
        protocol: 'https',
        hostname: '**.static.gamepix.com',
      },
    ],
  },
};

export default nextConfig;
