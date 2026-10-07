import Link from "next/link";
import { CategoryHeading } from "@/components/tool/category-heading";
import { toolIcons } from "@/components/tool/tool-icons";
import type { ToolMeta } from "@/core/tool/types";

export function ConverterHub({ label, converters }: { label: string; converters: ToolMeta[] }) {
  return (
    <section
      id="converters"
      aria-labelledby="converters-heading"
      className="relative flex scroll-mt-24 flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface/60 p-5 sm:p-6"
    >
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative">
        <CategoryHeading category="converters" label={label} id="converters-heading" />
      </div>
      <ul className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
        {converters.map((t) => {
          const Icon = toolIcons[t.icon];
          return (
            <li key={t.slug}>
              <Link
                href={`/${t.slug}`}
                className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-4 text-center transition-colors hover:border-brand/50"
              >
                <Icon className="h-4 w-auto text-muted" />
                <span className="text-xs leading-4 font-bold text-heading">{t.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
