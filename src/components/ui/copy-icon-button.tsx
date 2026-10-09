"use client";

import { CheckDoubleIcon } from "@/components/icons/check-double";
import { CopyIcon } from "@/components/icons/copy";
import { useClipboard } from "@/hooks/use-clipboard";
import { Button } from "./button";

/** Icon-only copy button with a "Copied!" bubble, used in tool panel headers. */
export function CopyIconButton({ text, label = "Copy output" }: { text: string; label?: string }) {
  const { copy, copied, failed } = useClipboard();
  return (
    <>
      <span className="relative">
        <Button variant="soft" size="tiny" onClick={() => copy(text)} disabled={!text} aria-label={copied ? "Copied" : failed ? "Copy failed" : label}>
          {copied ? <CheckDoubleIcon className="h-[11px] w-auto text-success" /> : <CopyIcon className="size-[11px]" />}
        </Button>
        {(copied || failed) && (
          <span
            aria-hidden
            className={`pointer-events-none absolute top-full left-1/2 z-10 mt-1.5 -translate-x-1/2 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] leading-4 font-semibold whitespace-nowrap shadow-lg ${
              copied ? "text-success" : "text-danger"
            }`}
          >
            {copied ? "Copied!" : "Copy failed"}
          </span>
        )}
      </span>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : failed ? "Couldn't copy. Select the text and copy it manually." : ""}
      </span>
    </>
  );
}
