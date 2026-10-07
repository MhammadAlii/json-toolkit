import type { ToolCategory, ToolMeta, ToolSlug } from "@/core/tool/types";
import { converters } from "./converters/registry";
import { tools } from "./tools/registry";

export const catalog: ToolMeta[] = [...tools, ...converters];

export const catalogBySlug = Object.fromEntries(catalog.map((t) => [t.slug, t])) as Record<ToolSlug, ToolMeta>;

export const categoryOrder: ToolCategory[] = ["core", "explore", "query", "converters", "utilities"];

export const categoryLabels: Record<ToolCategory, string> = {
  core: "JSON Core",
  explore: "Explore JSON",
  query: "Compare & Query",
  converters: "Converter Hub",
  utilities: "Developer Utilities",
};

export function toolsInCategory(category: ToolCategory): ToolMeta[] {
  return catalog.filter((t) => t.category === category);
}

export function relatedTools(tool: ToolMeta): ToolMeta[] {
  return tool.related.map((slug) => catalogBySlug[slug]);
}
