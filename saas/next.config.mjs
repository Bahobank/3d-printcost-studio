/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3002",
        "3dprintcost.studio",
        "www.3dprintcost.studio",
      ],
    },
  },
};

export default nextConfig;
