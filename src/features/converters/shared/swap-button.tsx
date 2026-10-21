"use client";

import { RightLeftIcon } from "@/components/icons/right-left";
import { Button } from "@/components/ui/button";

// Flips a two-way converter's direction; `to` names the direction it switches to, e.g. "YAML → JSON".
export function SwapButton({ to, onClick }: { to: string; onClick: () => void }) {
  return (
    <Button variant="soft" size="tiny" onClick={onClick} title={`Switch to ${to}`}>
      <RightLeftIcon className="h-[11px] w-auto" /> Swap
    </Button>
  );
}
