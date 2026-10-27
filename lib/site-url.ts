// The site's public address, used for canonical URLs, hreflang links and the
// sitemap. Set NEXT_PUBLIC_SITE_URL to your custom domain; on Vercel the
// production domain is used automatically.
function resolveSiteUrl() {
  // An empty value counts as not set, and "example.com" gets https://.
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    const url = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
    if (!URL.canParse(url)) {
      throw new Error(`NEXT_PUBLIC_SITE_URL isn't a web address: "${configured}". Use e.g. https://example.com.`);
    }
    return new URL(url);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return new URL("http://localhost:3000");
}

export const siteUrl = resolveSiteUrl();
