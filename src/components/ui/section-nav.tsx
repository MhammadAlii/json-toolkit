"use client";

import { useEffect, useState } from "react";

export type NavSection = { id: string; label: string };

export function SectionNav({ sections, title = "Navigation" }: { sections: NavSection[]; title?: string }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const targets = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Section becomes active once its heading passes just below the sticky header.
      { rootMargin: "-80px 0px -65% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label={title} className="flex flex-col gap-1">
      <p className="px-4 pb-3 text-xs leading-4 font-bold tracking-[1.2px] text-subtle uppercase">{title}</p>
      {sections.map((s) => {
        const isActive = s.id === active;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={isActive ? "location" : undefined}
            className={`rounded-r-md border-l-2 px-4 py-2.5 text-sm leading-5 font-medium transition-colors ${
              isActive ? "border-brand bg-gradient-to-r from-brand/10 to-brand/0 text-brand" : "border-transparent text-secondary hover:text-foreground"
            }`}
          >
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}
