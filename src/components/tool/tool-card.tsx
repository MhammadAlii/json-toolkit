import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import type { ToolMeta } from "@/core/tool/types";
import { tintText, toolIcons } from "./tool-icons";

export function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = toolIcons[tool.icon];
  return (
    <Link
      href={`/${tool.slug}`}
      className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/50"
    >
      <span className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className={`h-3.5 w-auto ${tintText[tool.tint]}`} />
        </span>
        <h3 className="min-w-0 flex-1 text-sm leading-5 font-bold text-heading">{tool.name}</h3>
        <ArrowRightIcon className="h-2.5 w-auto shrink-0 text-muted/30 transition-colors group-hover:text-brand" />
      </span>
      <p className="text-xs leading-5 text-muted">{tool.summary}</p>
    </Link>
  );
}
