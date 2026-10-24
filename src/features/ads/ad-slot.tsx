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

// Reserved heights prevent layout shift (CLS) when ads load.
const minHeights: Record<AdPlacement, string> = {
  toolBelow: "min-h-[128px]",
  sidebar: "min-h-[600px]",
  inContent: "min-h-[250px]",
  footer: "min-h-[69px]",
  hero: "min-h-[128px]",
};

export function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  const slot = ads.slots[placement];
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!ads.client || !slot || !ref.current || ref.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers throw here; the page must keep working.
    }
  }, [slot]);

  if (!ads.client || !slot) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <Card className={`flex flex-col items-center justify-center gap-2 border-dashed ${minHeights[placement]} ${className}`}>
        <AdIcon className="h-[30px] w-auto text-muted/20" />
        <span className="text-[10px] leading-[15px] font-bold tracking-[2px] text-muted/30">ADVERTISEMENT</span>
      </Card>
    );
  }

  return (
    <aside aria-label="Advertisement" className={`ad-slot ${minHeights[placement]} ${className}`}>
      <ins
        ref={ref}
        className="adsbygoogle block"
        data-ad-client={ads.client}
        data-ad-slot={slot}
        data-ad-format={placement === "sidebar" ? "vertical" : placement === "footer" ? "horizontal" : "auto"}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
