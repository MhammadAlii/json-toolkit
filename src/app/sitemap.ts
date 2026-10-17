import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/config/site";
import { catalog } from "@/features/catalog";
import { guides } from "@/features/guides/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(site.lastUpdated);
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/tools"), lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/converters"), lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/utilities"), lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/guides"), lastModified, changeFrequency: "weekly", priority: 0.8 },
    ...guides.map((g) => ({ url: absoluteUrl(`/guides/${g.slug}`), lastModified: new Date(g.updated), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...catalog.map((t) => ({ url: absoluteUrl(`/${t.slug}`), lastModified, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...["/about", "/contact", "/privacy", "/terms", "/licenses"].map((p) => ({ url: absoluteUrl(p), lastModified, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
