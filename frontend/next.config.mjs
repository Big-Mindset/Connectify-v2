
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:2525/api/auth/:path*',
      },
    ];
  },
  images : {
    domains : ["i.pinimg.com"]
  },
  allowedDevOrigins : []
};

export default nextConfig;