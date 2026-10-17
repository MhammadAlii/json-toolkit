import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, site } from "@/config/site";
import type { GuideMeta } from "../guide";

export function GuideStructuredData({ guide }: { guide: GuideMeta }) {
  const url = absoluteUrl(`/guides/${guide.slug}`);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Guides", href: "/guides" },
          { name: guide.h1, href: `/guides/${guide.slug}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: guide.h1,
          description: guide.description,
          url,
          mainEntityOfPage: url,
          datePublished: guide.published,
          dateModified: guide.updated,
          author: { "@type": "Organization", name: site.name, url: absoluteUrl("/") },
          publisher: { "@type": "Organization", name: site.name, url: absoluteUrl("/") },
        }}
      />
      {guide.faqs.length > 0 && <FaqJsonLd items={guide.faqs} />}
    </>
  );
}
