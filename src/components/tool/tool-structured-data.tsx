import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/config/site";
import type { ToolMeta } from "@/core/tool/types";

export function ToolStructuredData({ tool }: { tool: ToolMeta }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          tool.category === "converters" ? { name: "JSON Converters", href: "/converters" } : { name: "Developer Tools", href: "/tools" },
          { name: tool.name, href: `/${tool.slug}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: tool.h1,
          url: absoluteUrl(`/${tool.slug}`),
          description: tool.description,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
    </>
  );
}
