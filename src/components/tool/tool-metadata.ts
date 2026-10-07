import type { Metadata } from "next";
import { pageMetadata } from "@/components/seo/page-metadata";
import type { ToolMeta } from "@/core/tool/types";

export function toolMetadata(tool: ToolMeta): Metadata {
  return pageMetadata({ title: tool.title, description: tool.description, path: `/${tool.slug}`, keywords: tool.keywords, absoluteTitle: true });
}
