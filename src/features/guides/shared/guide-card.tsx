import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import type { GuideMeta } from "../guide";

export function GuideCard({ guide }: { guide: GuideMeta }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/50"
    >
      <span className="flex items-start gap-3">
        <h3 className="min-w-0 flex-1 text-sm leading-5 font-bold text-heading">{guide.h1}</h3>
        <ArrowRightIcon className="mt-1 h-2.5 w-auto shrink-0 text-muted/30 transition-colors group-hover:text-brand" />
      </span>
      <p className="flex-1 text-xs leading-5 text-muted">{guide.summary}</p>
      <p className="text-[11px] leading-4 font-semibold text-muted/70">{guide.readingMinutes} min read</p>
    </Link>
  );
}
