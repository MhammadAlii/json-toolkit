import { FaqList } from "@/components/ui/faq-list";
import { SectionTitle } from "@/components/ui/section-title";
import { Text } from "@/components/ui/text";
import type { ToolMeta } from "@/core/tool/types";
import { ToolCard } from "./tool-card";

// Indexable how-to, FAQ and related links shown below every implemented tool.
export function ToolSeoContent({ tool, related }: { tool: ToolMeta; related: ToolMeta[] }) {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex max-w-3xl flex-col gap-4">
        <SectionTitle>About the {tool.name}</SectionTitle>
        <Text>{tool.intro}</Text>
        <SectionTitle as="h3" size="md" className="pt-2">
          How to use it
        </SectionTitle>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-base leading-[26px] text-muted marker:text-brand">
          {tool.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
      <section className="flex flex-col gap-4">
        <SectionTitle>Frequently asked questions</SectionTitle>
        <FaqList items={tool.faqs} className="max-w-4xl" />
      </section>
      {related.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionTitle>Related tools</SectionTitle>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <li key={t.slug}>
                <ToolCard tool={t} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
