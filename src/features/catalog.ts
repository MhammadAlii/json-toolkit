import type { ToolCategory, ToolMeta, ToolSlug } from "@/core/tool/types";
import { converters } from "./converters/registry";
import { tools } from "./tools/registry";

export const catalog: ToolMeta[] = [...tools, ...converters];

export const catalogBySlug = Object.fromEntries(catalog.map((t) => [t.slug, t])) as Record<ToolSlug, ToolMeta>;

export const categoryLabels: Record<ToolCategory, string> = {
  core: "Core tools",
  query: "Compare & query",
  converters: "Converters",
};

export function relatedTools(tool: ToolMeta): ToolMeta[] {
  return tool.related.map((slug) => catalogBySlug[slug]);
}
