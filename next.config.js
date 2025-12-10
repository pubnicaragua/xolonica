/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Configuración mínima para que Next 16 no marque error al usar Turbopack
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Asegurar que webpack resuelva los alias correctamente cuando se use webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
