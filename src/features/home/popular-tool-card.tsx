import Link from "next/link";
import { tintText, toolIcons } from "@/components/tool/tool-icons";
import type { ToolMeta } from "@/core/tool/types";

// A home page tool card with a longer description than the directory cards.
export function PopularToolCard({ tool, description }: { tool: ToolMeta; description: string }) {
  const Icon = toolIcons[tool.icon];
  return (
    <Link
      href={`/${tool.slug}`}
      className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-6 transition-colors hover:border-brand/50"
    >
      <h3 className="flex items-center gap-3 text-base leading-6 font-bold text-heading">
        <Icon className={`h-4 w-auto shrink-0 ${tintText[tool.tint]}`} />
        {tool.name}
      </h3>
      <p className="flex-1 text-sm leading-[22px] text-muted">{description}</p>
      <span className="text-sm font-semibold text-brand group-hover:underline">Open {tool.name} →</span>
    </Link>
  );
}
