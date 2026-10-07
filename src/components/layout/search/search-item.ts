import type { ToolCategory, ToolIcon, ToolTint } from "@/core/tool/types";

export type SearchItem = {
  slug: string;
  name: string;
  tagline: string;
  keywords: string[];
  category: ToolCategory;
  icon?: ToolIcon;
  tint: ToolTint;
};
