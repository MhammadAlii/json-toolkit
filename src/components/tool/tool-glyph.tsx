import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CodeIcon } from "@/components/icons/code";
import { FileCsvIcon } from "@/components/icons/file-csv";
import { WandIcon } from "@/components/icons/wand";
import { WrenchIcon } from "@/components/icons/wrench";
import { IconTile } from "@/components/ui/icon-tile";
import type { ToolIcon, ToolTint } from "@/core/tool/types";

const icons: Record<ToolIcon, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  wand: WandIcon,
  check: CheckDoubleIcon,
  wrench: WrenchIcon,
  csv: FileCsvIcon,
  code: CodeIcon,
};

// Full class names so Tailwind can detect them.
const tints: Record<ToolTint, string> = {
  purple: "bg-tint-purple/20 text-tint-purple",
  green: "bg-tint-green/20 text-tint-green",
  amber: "bg-tint-amber/20 text-tint-amber",
  blue: "bg-tint-blue/20 text-tint-blue",
  indigo: "bg-tint-indigo/20 text-tint-indigo",
};

export function ToolGlyph({ icon, tint, size = "sm" }: { icon?: ToolIcon; tint: ToolTint; size?: "sm" | "md" | "lg" }) {
  const Icon = icon ? icons[icon] : undefined;
  return (
    <IconTile size={size} className={tints[tint]}>
      {Icon ? <Icon className="h-3.5 w-auto" /> : <span aria-hidden className="text-[11px] font-bold">{"{ }"}</span>}
    </IconTile>
  );
}
