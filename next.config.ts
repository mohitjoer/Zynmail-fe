import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Forward all API requests to FastAPI backend except Better Auth endpoints handled by Next.js
        source: "/api/:path((?!auth/).*)",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
