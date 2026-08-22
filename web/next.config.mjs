/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "https", hostname: "*.onrender.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  experimental: {
    optimizePackageImports: [],
  },
  async headers() {
    return [
      {
        // Le Service Worker ne doit JAMAIS être mis en cache par le navigateur
        // ou un CDN : sinon un correctif déployé peut mettre des heures/jours
        // à atteindre les visiteurs, même les nouveaux.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
