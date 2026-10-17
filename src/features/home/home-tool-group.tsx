import Link from "next/link";
import { tintText, toolIcons } from "@/components/tool/tool-icons";
import { Card } from "@/components/ui/card";
import type { ToolMeta } from "@/core/tool/types";

// One group of tools on the home page: a title, what the group is for, and a link to every tool in it.
export function HomeToolGroup({ title, description, href, more, tools }: { title: string; description: string; href: string; more: string; tools: ToolMeta[] }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-base leading-6 font-bold text-heading">{title}</h3>
        <p className="text-sm leading-[22px] text-muted">{description}</p>
      </div>
      <ul className="flex flex-1 flex-col gap-2.5">
        {tools.map((t) => {
          const Icon = toolIcons[t.icon];
          return (
            <li key={t.slug}>
              <Link href={`/${t.slug}`} className="group flex items-start gap-3">
                <Icon className={`mt-1 h-3.5 w-4 shrink-0 ${tintText[t.tint]}`} />
                <span className="flex flex-col">
                  <span className="text-sm leading-5 font-semibold text-heading group-hover:text-brand">{t.name}</span>
                  <span className="text-xs leading-5 text-muted">{t.tagline}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href={href} className="text-sm font-semibold text-brand hover:underline">
        {more} →
      </Link>
    </Card>
  );
}
