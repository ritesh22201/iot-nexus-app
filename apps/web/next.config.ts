import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  transpilePackages: ['@iot-nexus/shared'],
  poweredByHeader: false,
  reactStrictMode: true,
};
export default nextConfig;
