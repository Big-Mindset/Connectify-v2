
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:8000/api/auth/:path*',
      },
    ];
  },
  images : {
    domains : ["i.pinimg.com"]
  }
};

export default nextConfig;