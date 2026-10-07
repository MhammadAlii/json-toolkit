import type { Metadata } from "next";
import { site } from "@/config/site";

export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  keywords?: string[];
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "website", siteName: site.name },
    twitter: { card: "summary_large_image", title, description },
  };
}
