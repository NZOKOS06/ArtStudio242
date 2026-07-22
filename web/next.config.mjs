/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "*.onrender.com" },
    ],
  },
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
