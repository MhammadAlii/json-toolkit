import { IconTile } from "@/components/ui/icon-tile";
import type { ToolCategory } from "@/core/tool/types";
import { categoryStyle } from "./tool-category-style";
import { tintTile } from "./tool-icons";

export function CategoryHeading({ category, label, id }: { category: ToolCategory; label: string; id?: string }) {
  const { icon: Icon, tint } = categoryStyle[category];
  return (
    <h2 id={id} className="flex items-center gap-3 text-xs leading-4 font-bold tracking-[1.2px] text-heading uppercase">
      <IconTile size="sm" className={tintTile[tint]}>
        <Icon className="h-3.5 w-auto" />
      </IconTile>
      {label}
    </h2>
  );
}
