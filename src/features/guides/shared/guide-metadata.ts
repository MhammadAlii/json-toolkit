import { pageMetadata } from "@/components/seo/page-metadata";
import type { GuideMeta } from "../guide";

export const guideMetadata = (guide: GuideMeta) =>
  pageMetadata({ title: guide.title, description: guide.description, path: `/guides/${guide.slug}`, keywords: guide.keywords, absoluteTitle: true });
