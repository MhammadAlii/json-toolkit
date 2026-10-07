import { CodeCompareIcon } from "@/components/icons/code-compare";
import { CubeIcon } from "@/components/icons/cube";
import type { IconProps } from "@/components/icons/icon-props";
import { MagnifyingGlassPlusIcon } from "@/components/icons/magnifying-glass-plus";
import { MicrochipIcon } from "@/components/icons/microchip";
import { RightLeftIcon } from "@/components/icons/right-left";
import type { ToolCategory, ToolTint } from "@/core/tool/types";

export const categoryStyle: Record<ToolCategory, { icon: React.ComponentType<IconProps>; tint: ToolTint }> = {
  core: { icon: CubeIcon, tint: "purple" },
  explore: { icon: MagnifyingGlassPlusIcon, tint: "green" },
  query: { icon: CodeCompareIcon, tint: "amber" },
  converters: { icon: RightLeftIcon, tint: "purple" },
  utilities: { icon: MicrochipIcon, tint: "pink" },
};
