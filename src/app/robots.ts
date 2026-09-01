import type { MetadataRoute } from "next";

const SITE = "https://www.whokilledthebill.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin tooling has no business in the index.
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: SITE + "/sitemap.xml",
    host: SITE,
  };
}
