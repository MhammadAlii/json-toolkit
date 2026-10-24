"use client";

import { useEffect, useRef } from "react";
import { ads, type AdPlacement } from "@/config/site";
import { AdIcon } from "@/components/icons/ad";
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Reserved heights prevent layout shift (CLS) when ads load. The hero has none: it fills a frame sized by the
// title and description beside it, so it never makes the header taller.
const minHeights: Record<AdPlacement, string> = {
  toolBelow: "min-h-[128px]",
  sidebar: "min-h-[600px]",
  inContent: "min-h-[250px]",
  footer: "min-h-[69px]",
  hero: "",
};

export function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  const slot = ads.slots[placement];
  const ref = useRef<HTMLElement>(null);

  // The <ins> is created here, after hydration, rather than rendered. AdSense rewrites the first unprocessed <ins> on
  // the page (and its ancestors' styles) on any push, so a server-rendered one could be filled before React hydrated it
  // and the page would fail to hydrate. Creating it right before our own push also ties each push to its own slot.
  useEffect(() => {
    const aside = ref.current;
    if (!ads.client || !slot || !aside || aside.querySelector("ins.adsbygoogle")) return;
    // Without data-ad-format, AdSense sizes the ad to the <ins> box, which is how the hero stays inside its frame.
    const fillsFrame = placement === "hero";
    const ins = document.createElement("ins");
    ins.className = fillsFrame ? "adsbygoogle block size-full overflow-hidden" : "adsbygoogle block";
    ins.dataset.adClient = ads.client;
    ins.dataset.adSlot = slot;
    if (!fillsFrame) {
      ins.dataset.adFormat = placement === "sidebar" ? "vertical" : placement === "footer" ? "horizontal" : "auto";
      ins.dataset.fullWidthResponsive = "true";
    }
    aside.appendChild(ins);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers throw here; the page must keep working.
    }
  }, [slot, placement]);

  if (!ads.client || !slot) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <Card className={`flex flex-col items-center justify-center gap-2 border-dashed ${minHeights[placement]} ${className}`}>
        <AdIcon className="h-[30px] w-auto text-muted/20" />
        <span className="text-[10px] leading-[15px] font-bold tracking-[2px] text-muted/30">ADVERTISEMENT</span>
      </Card>
    );
  }

  return <aside ref={ref} aria-label="Advertisement" className={`ad-slot ${minHeights[placement]} ${className}`} />;
}
