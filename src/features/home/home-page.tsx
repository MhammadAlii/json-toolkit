import { ShieldHalfIcon } from "@/components/icons/shield-half";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/components/ui/lead";
import { PageTitle } from "@/components/ui/page-title";
import { SectionHeader } from "@/components/ui/section-header";
import { absoluteUrl, site } from "@/config/site";
import { AdSlot } from "@/features/ads/ad-slot";
import { catalogBySlug } from "@/features/catalog";
import { FormatterWorkspace } from "@/features/tools/formatter/formatter-workspace";
import { PopularToolCard } from "./popular-tool-card";
import { popularTools } from "./popular-tools";

export function HomePage() {
  return (
    <div className="container-page flex flex-col gap-8 py-12">
      {/* The hero text is centred on the whole page; the ad is pinned top-right outside the flow so it can't shift the
          title, and the intro is kept narrow enough on wide screens to stay clear of it. */}
      <section className="relative flex flex-col items-center gap-4 pt-0.5 text-center">
        <Badge>Free developer toolkit</Badge>
        <PageTitle>JSON tools for developers.</PageTitle>
        <Lead size="sm" className="max-w-2xl pb-2 text-balance xl:max-w-[560px]">
          Format, validate, repair, explore and convert JSON — directly in your browser.
        </Lead>
        <Badge tone="success" size="note" icon={<ShieldHalfIcon className="size-3" />}>
          Runs in your browser — your data never leaves your device.
        </Badge>
        <AdSlot placement="hero" className="absolute top-0 right-0 hidden w-[300px] xl:block" />
      </section>

      <section aria-label="JSON formatter" className="pt-6">
        <FormatterWorkspace />
      </section>

      <AdSlot placement="toolBelow" />

      <section aria-labelledby="popular-tools" className="flex flex-col gap-6 pt-8">
        <SectionHeader id="popular-tools" title="Popular tools" description="The tools developers use most, beyond formatting." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((p) => (
            <li key={p.slug}>
              <PopularToolCard tool={catalogBySlug[p.slug]} description={p.description} />
            </li>
          ))}
        </ul>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: absoluteUrl("/"),
          description: site.description,
        }}
      />
    </div>
  );
}
