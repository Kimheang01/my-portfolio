// The site's public address, used for canonical URLs, hreflang links and the
// sitemap. Set NEXT_PUBLIC_SITE_URL to your custom domain; on Vercel the
// production domain is used automatically.
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
);
