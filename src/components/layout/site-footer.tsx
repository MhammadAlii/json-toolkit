import Link from "next/link";
import { site } from "@/config/site";
import { converters } from "@/features/converters/registry";
import { AdSlot } from "@/features/ads/ad-slot";
import { Logo } from "@/components/layout/logo";

type Column = { title: string; links: { label: string; href: string }[]; gap: string };

const columns: Column[] = [
  {
    title: "Converters",
    gap: "gap-3",
    links: converters.map((t) => ({ label: t.name, href: `/${t.slug}` })),
  },
  {
    title: "Legal",
    gap: "gap-4",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Licenses", href: "/licenses" },
    ],
  },
  {
    title: "Company",
    gap: "gap-4",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-footer pt-16 pb-12">
      <div className="container-page">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-[15px]">
            <Logo size="sm" />
            <p className="max-w-[272px] text-sm leading-[22.75px] text-muted/80">
              The ultimate suite of JSON manipulation tools. Built by developers, for developers. Secure, fast, and entirely
              client-side.
            </p>
          </div>
          {columns.map((c) => (
            <nav key={c.title} aria-labelledby={`footer-${c.title}`} className="flex flex-col gap-6">
              <h2 id={`footer-${c.title}`} className="text-sm leading-5 font-bold tracking-[1.4px] text-heading uppercase">
                {c.title}
              </h2>
              <ul className={`flex flex-col ${c.gap}`}>
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm leading-5 text-muted underline transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col-reverse items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs leading-4 text-muted/50">
            © {site.copyrightYear} JSON TOOLKIT. All rights reserved.
          </p>
          <AdSlot placement="footer" className="w-full sm:w-[286px]" />
        </div>
      </div>
    </footer>
  );
}
