import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { pageMetadata } from "@/components/seo/page-metadata";
import { Lead } from "@/components/ui/lead";
import { PageTitle } from "@/components/ui/page-title";
import { site } from "@/config/site";
import { AdSlot } from "@/features/ads/ad-slot";
import { guides } from "../registry";
import { GuideCard } from "../shared/guide-card";

export const guidesDirectoryMetadata = pageMetadata({
  title: "JSON Guides – Fix Errors, Format, Convert and Query JSON",
  description: `Practical guides to working with JSON: fixing parse errors, formatting, JSON vs YAML, converting to Excel, JWTs and JSONPath, each with a free ${site.name} tool to try it.`,
  path: "/guides",
  absoluteTitle: true,
});

export function GuidesDirectoryPage() {
  return (
    <div className="container-page flex flex-col gap-10 py-12">
      <header className="flex items-start justify-between gap-6">
        <div className="flex max-w-3xl flex-col gap-3">
          <PageTitle>JSON Guides</PageTitle>
          <Lead size="sm">
            Short, practical answers to the questions developers search for most, from &ldquo;Unexpected token&rdquo; errors to JSONPath
            filters. Every guide links to a free tool so you can try it on your own data.
          </Lead>
        </div>
        <div className="hidden w-[300px] shrink-0 lg:block">
          <AdSlot placement="hero" />
        </div>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <li key={g.slug}>
            <GuideCard guide={g} />
          </li>
        ))}
      </ul>
      <BreadcrumbJsonLd items={[{ name: "Guides", href: "/guides" }]} />
    </div>
  );
}
