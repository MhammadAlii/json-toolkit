import { absoluteUrl } from "@/config/site";
import { JsonLd } from "./json-ld";

export type Crumb = { name: string; href: string };

export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.href) })),
      }}
    />
  );
}
