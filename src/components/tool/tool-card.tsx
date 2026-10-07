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
      <span className="flex items-start justify-between">
        <Icon className={`h-4 w-auto ${tintText[tool.tint]}`} />
        <ArrowRightIcon className="h-2.5 w-auto text-muted/30 transition-colors group-hover:text-brand" />
      </span>
      <h3 className="pt-1 text-sm leading-5 font-bold text-heading">{tool.name}</h3>
      <p className="text-xs leading-5 text-muted">{tool.summary}</p>
    </Link>
  );
}
