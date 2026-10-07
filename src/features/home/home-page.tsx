import { ShieldHalfIcon } from "@/components/icons/shield-half";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/components/ui/lead";
import { PageTitle } from "@/components/ui/page-title";
import { absoluteUrl, site } from "@/config/site";
import { AdSlot } from "@/features/ads/ad-slot";
import { FormatterWorkspace } from "@/features/tools/formatter/formatter-workspace";

export function HomePage() {
  return (
    <div className="container-page flex flex-col gap-8 py-12">
      <section className="relative flex flex-col items-center gap-4 pt-0.5 text-center">
        <Badge>Free developer toolkit</Badge>
        <PageTitle>JSON tools for developers.</PageTitle>
        <Lead size="sm" className="max-w-2xl pb-2">
          Format, validate, repair, explore and convert JSON — directly in your browser.
        </Lead>
        <Badge tone="success" size="note" icon={<ShieldHalfIcon className="size-3" />}>
          Runs in your browser — your data never leaves your device.
        </Badge>
        <AdSlot placement="hero" className="absolute top-0 right-0 hidden w-[197px] xl:block" />
      </section>

      <section id="tools" aria-label="JSON formatter" className="scroll-mt-20 pt-6">
        <FormatterWorkspace />
      </section>

      <AdSlot placement="toolBelow" />

      <span id="converters" className="sr-only" />
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
