import Link from "next/link";
import { ToolCard } from "@/components/tool/tool-card";
import { Badge } from "@/components/ui/badge";
import { FaqList } from "@/components/ui/faq-list";
import { PageTitle } from "@/components/ui/page-title";
import { SectionTitle } from "@/components/ui/section-title";
import { formatDay } from "@/core/text/format-date";
import { AdSlot } from "@/features/ads/ad-slot";
import { catalogBySlug } from "@/features/catalog";
import type { GuideMeta } from "../guide";
import { guides } from "../registry";
import { GuideCard } from "./guide-card";
import { GuideStructuredData } from "./guide-structured-data";

// Frame for every guide: title and lead beside the hero ad, the article, then FAQ, the tools it uses and more guides.
export function GuideLayout({ guide, children }: { guide: GuideMeta; children: React.ReactNode }) {
  const more = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);
  return (
    <div className="container-page flex flex-col gap-10 py-8">
      <header className="flex items-start justify-between gap-6">
        <div className="flex max-w-3xl min-w-0 flex-col gap-3">
          <nav aria-label="Breadcrumb" className="text-xs text-muted">
            <Link href="/guides" className="hover:text-foreground">
              Guides
            </Link>
          </nav>
          <PageTitle size="md">{guide.h1}</PageTitle>
          <p className="text-lg leading-7 text-muted">{guide.summary}</p>
          <p className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <Badge>Guide</Badge>
            <span>{guide.readingMinutes} min read</span>
            <span aria-hidden>·</span>
            <span>
              Updated <time dateTime={guide.updated}>{formatDay(guide.updated)}</time>
            </span>
          </p>
        </div>
        <div className="ad-frame hidden w-[300px] shrink-0 lg:block">
          <AdSlot placement="hero" />
        </div>
      </header>

      <article className="flex max-w-3xl flex-col gap-10 text-base leading-[28px] text-muted">{children}</article>

      <AdSlot placement="toolBelow" />

      {guide.faqs.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionTitle>Frequently asked questions</SectionTitle>
          <FaqList items={guide.faqs} className="max-w-4xl" />
        </section>
      )}

      <section className="flex flex-col gap-4">
        <SectionTitle>Tools used in this guide</SectionTitle>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guide.tools.map((slug) => (
            <li key={slug}>
              <ToolCard tool={catalogBySlug[slug]} />
            </li>
          ))}
        </ul>
      </section>

      {more.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionTitle>More guides</SectionTitle>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((g) => (
              <li key={g.slug}>
                <GuideCard guide={g} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <GuideStructuredData guide={guide} />
    </div>
  );
}
