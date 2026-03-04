/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite acesso via Cloudflare Tunnel (trycloudflare.com) no modo dev
  allowedDevOrigins: ["*.trycloudflare.com"],
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
};

module.exports = nextConfig;
