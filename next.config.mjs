import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // App-only type check for production builds; tests and the Prisma seed are
  // covered by `npm run typecheck` instead.
  typescript: { tsconfigPath: "tsconfig.build.json" },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;

// Lets `next dev` use Cloudflare bindings locally (no-op in production builds).
initOpenNextCloudflareForDev();
