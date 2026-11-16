/** @type {import('next').NextConfig} */
const rawBackend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://yoobic-backend.onrender.com';
let backendUrl = rawBackend.trim();

if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
  backendUrl = `https://${backendUrl}`;
}
backendUrl = backendUrl.replace(/\/$/, '');

console.log('[NextConfig] Proxying /api requests to backend:', backendUrl);

const nextConfig = {
  reactStrictMode: false,
  transpilePackages: [
    '@yoobic/api-client',
    '@yoobic/shared-types',
    '@yoobic/validation',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
