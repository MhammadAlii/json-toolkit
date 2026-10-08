import type { ToolMeta } from "@/core/tool/types";
import { tintText, toolIcons } from "./tool-icons";

export function ToolHeader({ tool, aside }: { tool: ToolMeta; aside?: React.ReactNode }) {
  const Icon = toolIcons[tool.icon];
  return (
    <header className="flex items-center justify-between gap-6">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface">
          <Icon className={`h-6 w-auto ${tintText[tool.tint]}`} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl leading-9 font-bold text-foreground sm:text-3xl">{tool.h1}</h1>
          <p className="text-base leading-6 text-muted">{tool.summary}</p>
        </div>
      </div>
      {aside}
    </header>
  );
}
