import { Badge } from "./badge";
import { ButtonLink } from "./button-link";
import { Card } from "./card";
import { Lead } from "./lead";
import { PageTitle } from "./page-title";

export type ComingSoonLink = { label: string; href: string };

export function ComingSoon({
  title,
  description,
  links = [],
  badge = "Design in progress",
}: {
  title: string;
  description: string;
  links?: ComingSoonLink[];
  badge?: string;
}) {
  return (
    <div className="container-page flex flex-col items-center gap-10 py-20 text-center sm:py-28">
      <div className="flex max-w-2xl flex-col items-center gap-4">
        <Badge>{badge}</Badge>
        <PageTitle>{title}</PageTitle>
        <Lead>{description}</Lead>
      </div>
      <Card tone="faint" radius="2xl" className="w-full max-w-3xl border-dashed p-8">
        <p className="text-xs font-bold tracking-[1.2px] text-subtle uppercase">Placeholder</p>
        <p className="mt-2 text-sm text-muted">This page&apos;s layout will be built from its Figma design.</p>
        {links.length > 0 && (
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <ButtonLink href={l.href} variant="chip" size="sm">
                  {l.label}
                </ButtonLink>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
