import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/config/site";
import { catalog } from "@/features/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(site.lastUpdated);
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    ...catalog.map((t) => ({ url: absoluteUrl(`/${t.slug}`), lastModified, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...["/about", "/contact", "/privacy", "/terms", "/licenses"].map((p) => ({ url: absoluteUrl(p), lastModified, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
