import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Points next-intl at i18n/request.ts.
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // The end-to-end tests build into their own folder (see tests/e2e/server.sh),
  // so pages they regenerate from the test database never mix with a real build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  // Basic protection for every page: no framing (clickjacking), no MIME
  // sniffing, no full URLs leaked to other sites, no camera/mic/location.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  images: {
    // Images uploaded in the admin, stored in Vercel Blob under portfolio/.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/portfolio/**" }],
  },
  partialPrefetching: true,
  experimental: {
    // Unknown URLs and locales get app/global-not-found.tsx.
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
