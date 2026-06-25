import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    { url: `${SITE_URL}/validatie/`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/bron/`, changeFrequency: "yearly", priority: 0.5 },
    {
      url: `${SITE_URL}/voorwaarden/`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    { url: `${SITE_URL}/privacy/`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cookies/`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
