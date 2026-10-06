"use client";

import { CopyIcon } from "@/components/icons/copy";
import { useClipboard } from "@/hooks/use-clipboard";

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const { copy, copied } = useClipboard();
  return (
    <button type="button" onClick={() => copy(text)} className={className}>
      <CopyIcon className="size-2.5" />
      {copied ? "Copied!" : label}
    </button>
  );
}
