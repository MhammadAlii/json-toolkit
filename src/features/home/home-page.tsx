import { ComingSoon } from "@/components/ui/coming-soon";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, site } from "@/config/site";
import { catalog } from "@/features/catalog";

// TODO: implement the home design
export function HomePage() {
  return (
    <>
      <span id="tools" className="sr-only" />
      <span id="query" className="sr-only" />
      <span id="converters" className="sr-only" />
      <ComingSoon
        title="JSON tools for developers."
        description="Format, validate, repair, explore and convert JSON — directly in your browser."
        links={catalog.map((t) => ({ label: t.name, href: `/${t.slug}` }))}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: absoluteUrl("/"),
          description: site.description,
        }}
      />
    </>
  );
}
