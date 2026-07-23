/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "https", hostname: "*.onrender.com", pathname: "/**" },
    ],
  },
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
