/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mptnhektozvjowoydjha.supabase.co'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
