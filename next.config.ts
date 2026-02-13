import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // For GitHub Pages deployment, set basePath if deploying to a subpath
  // For user/org pages (username.github.io), no basePath needed
  // basePath: '',
};

export default nextConfig;
