"use client";

import { CopyIcon } from "@/components/icons/copy";
import { ExternalLinkIcon } from "@/components/icons/external-link";
import { GithubIcon } from "@/components/icons/github";
import { ShareIcon } from "@/components/icons/share";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { useClipboard } from "@/hooks/use-clipboard";
import type { Credit } from "./licenses";

export function LicenseDetail({ credit }: { credit: Credit }) {
  const { copy, copied } = useClipboard();

  async function share() {
    const url = `${window.location.origin}/licenses#${credit.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${credit.name} license`, url });
      } catch {
        // User dismissed the share sheet.
      }
    } else {
      await copy(url, "link");
    }
  }

  return (
    <Card
      as="section"
      radius="2xl"
      aria-label="License details"
      className="w-full shrink-0 overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] lg:sticky lg:top-24 lg:w-[450px]"
    >
      <div className="flex flex-col gap-1 border-b border-border bg-surface-2 p-6">
        <div className="flex items-center justify-between">
          <span className="rounded bg-brand/10 px-2 py-1 font-mono text-xs leading-4 font-bold tracking-[0.6px] text-brand uppercase">
            {credit.license}
          </span>
          <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" aria-label="Open license source" className="p-2 text-secondary hover:text-foreground">
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </div>
        <SectionTitle className="pt-3 break-words">{credit.name}</SectionTitle>
        <p className="text-sm leading-5 text-secondary">{credit.copyright}</p>
      </div>

      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] leading-[15px] font-bold tracking-[1px] text-subtle uppercase">License Text</p>
          <button type="button" onClick={() => copy(credit.text, "license")} className="flex items-center gap-2 text-xs leading-4 font-medium text-brand hover:opacity-80">
            <CopyIcon className="size-3" />
            {copied === "license" ? "Copied!" : "Copy License"}
          </button>
        </div>
        <Card tone="base" radius="lg" className="relative">
          <pre tabIndex={0} className="h-[400px] overflow-y-auto p-4 pr-6 pb-16 font-mono text-xs leading-[19.5px] whitespace-pre-wrap text-secondary">
            {credit.text}
          </pre>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-lg bg-gradient-to-t from-background to-transparent" />
        </Card>
      </div>

      <div className="flex gap-3 border-t border-border bg-surface-2 p-6">
        <ButtonLink href={credit.repository} className="flex-1">
          <GithubIcon className="size-4" /> Open Repository
        </ButtonLink>
        <button
          type="button"
          onClick={share}
          aria-label={copied === "link" ? "Link copied" : "Share this license"}
          className="flex size-12 items-center justify-center rounded-xl border border-border text-secondary transition-colors hover:text-foreground"
        >
          <ShareIcon className="h-4 w-auto" />
        </button>
      </div>
    </Card>
  );
}
