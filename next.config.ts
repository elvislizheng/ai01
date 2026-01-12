import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'acquia-drupal-registration-service.rcmusic.com',
        port: '',
        pathname: '/sites/default/files/tcert_web_logos/**',
      },
    ],
  },
};

export default nextConfig;
