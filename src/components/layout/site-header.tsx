import Link from "next/link";
import { catalog, categoryLabels } from "@/features/catalog";
import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button-link";
import type { SearchItem } from "@/components/layout/search/search-item";
import { SearchPalette } from "@/components/layout/search/search-palette";

// Only these fields reach the client bundle.
const searchItems: SearchItem[] = catalog.map(({ slug, name, tagline, keywords, category, icon, tint }) => ({
  slug,
  name,
  tagline,
  keywords,
  category,
  icon,
  tint,
}));

const nav = [
  { label: "Tools", href: "/#tools" },
  { label: "Converters", href: "/#converters" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-[6px]">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-10">
          <Logo />
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm leading-5 font-medium text-muted">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="transition-colors hover:text-foreground">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <SearchPalette items={searchItems} categoryLabels={categoryLabels} />
          <div className="hidden sm:block">
            <ButtonLink href="/json-formatter" size="sm">
              Open Formatter
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
