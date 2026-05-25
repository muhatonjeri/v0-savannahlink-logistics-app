/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // Warnings don't block production build
  },
  typescript: {
    ignoreBuildErrors: false,   // TypeScript errors DO block build — strict mode
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    }];
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
