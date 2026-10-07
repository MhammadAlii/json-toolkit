import { CategoryHeading } from "@/components/tool/category-heading";
import { ToolCard } from "@/components/tool/tool-card";
import type { ToolCategory, ToolMeta } from "@/core/tool/types";

export function ToolSection({ category, label, tools }: { category: ToolCategory; label: string; tools: ToolMeta[] }) {
  const headingId = `${category}-heading`;
  return (
    <section id={category} aria-labelledby={headingId} className="flex scroll-mt-24 flex-col gap-4">
      <CategoryHeading category={category} label={label} id={headingId} />
      <ul className="grid gap-4 sm:grid-cols-2">
        {tools.map((t) => (
          <li key={t.slug}>
            <ToolCard tool={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}
