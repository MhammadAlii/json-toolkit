import { pageMetadata } from "@/components/seo/page-metadata";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { PageTitle } from "@/components/ui/page-title";
import { Text } from "@/components/ui/text";
import { absoluteUrl, site } from "@/config/site";
import { AdSlot } from "@/features/ads/ad-slot";
import { catalog, categoryLabels, categoryOrder, toolsInCategory } from "@/features/catalog";
import { ConverterHub } from "./converter-hub";
import { ToolSection } from "./tool-section";

export const toolsDirectoryMetadata = pageMetadata({
  title: "All JSON Tools – Formatter, Validator, Converters & More",
  description: `Every ${site.name} tool in one place: format, validate, repair, explore, compare and convert JSON, plus JWT, Base64, URL and timestamp utilities.`,
  path: "/tools",
  absoluteTitle: true,
});

export function ToolsDirectoryPage() {
  return (
    <div className="container-page grid items-start gap-8 py-12 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-10">
        <header className="flex max-w-2xl flex-col gap-2">
          <PageTitle size="md">Developer Tools</PageTitle>
          <Text variant="small">
            Everything you need to inspect, transform and work with structured data. Performance-first utilities that respect your
            privacy.
          </Text>
        </header>

        {categoryOrder.map((category) =>
          category === "converters" ? (
            <ConverterHub key={category} label={categoryLabels[category]} converters={toolsInCategory(category)} />
          ) : (
            <ToolSection key={category} category={category} label={categoryLabels[category]} tools={toolsInCategory(category)} />
          ),
        )}
      </div>

      <aside className="sticky top-24 hidden xl:block">
        <AdSlot placement="sidebar" />
      </aside>

      <BreadcrumbJsonLd items={[{ name: "Tools", href: "/tools" }]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${site.name} tools`,
          itemListElement: catalog.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: absoluteUrl(`/${t.slug}`) })),
        }}
      />
    </div>
  );
}
