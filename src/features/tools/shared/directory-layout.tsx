import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { PageTitle } from "@/components/ui/page-title";
import { Text } from "@/components/ui/text";
import { absoluteUrl } from "@/config/site";
import type { ToolMeta } from "@/core/tool/types";
import { AdSlot } from "@/features/ads/ad-slot";

// Shared by the /tools and /converters listing pages: title, intro, content and a sticky sidebar ad.
export function DirectoryLayout({
  title,
  intro,
  path,
  listName,
  tools,
  children,
}: {
  title: string;
  intro: string;
  path: string;
  listName: string;
  /** Every tool listed on the page, for the ItemList structured data. */
  tools: ToolMeta[];
  children: React.ReactNode;
}) {
  return (
    <div className="container-page grid items-start gap-8 py-12 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="flex min-w-0 flex-col gap-10">
        <header className="flex max-w-2xl flex-col gap-2">
          <PageTitle size="md">{title}</PageTitle>
          <Text variant="small">{intro}</Text>
        </header>
        {children}
      </div>

      <aside className="sticky top-24 hidden xl:block">
        <AdSlot placement="sidebar" />
      </aside>

      <BreadcrumbJsonLd items={[{ name: title, href: path }]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: listName,
          itemListElement: tools.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: absoluteUrl(`/${t.slug}`) })),
        }}
      />
    </div>
  );
}
