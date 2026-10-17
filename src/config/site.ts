export const site = {
  name: "JSON Toolkit",
  shortName: "JSON Toolkit",
  tagline: "Free, fast, private JSON tools that run in your browser",
  description:
    "Format, validate, minify and convert JSON online. Free JSON tools that run entirely in your browser: nothing you paste is uploaded to a server.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_US",
  lastUpdated: "2026-10-17",
  copyrightYear: "2026",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
} as const;

export const ads = {
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
  slots: {
    toolBelow: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_BELOW ?? "",
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
    inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_CONTENT ?? "",
    footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? "",
    hero: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HERO ?? "",
  },
} as const;

export type AdPlacement = keyof typeof ads.slots;

export function absoluteUrl(path = "/"): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
