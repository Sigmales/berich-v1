import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // 🔧 Optimisations pour résoudre l'erreur JSON
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },

  // ⚡ Optimisations de performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js']
  },

  // 🛡️ Sécurité et stabilité
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 📦 Gestion des erreurs
  poweredByHeader: false,
  
  // 🔍 Debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
