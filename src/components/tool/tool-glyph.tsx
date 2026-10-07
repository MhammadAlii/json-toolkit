import { IconTile } from "@/components/ui/icon-tile";
import type { ToolIcon, ToolTint } from "@/core/tool/types";
import { tintTile, toolIcons } from "./tool-icons";

export function ToolGlyph({ icon, tint, size = "sm" }: { icon: ToolIcon; tint: ToolTint; size?: "sm" | "md" | "lg" }) {
  const Icon = toolIcons[icon];
  return (
    <IconTile size={size} className={tintTile[tint]}>
      <Icon className="h-3.5 w-auto" />
    </IconTile>
  );
}
