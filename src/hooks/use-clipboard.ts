"use client";

import { useCallback, useState } from "react";

export function useClipboard(resetMs = 1500) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, key = "default") => {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), resetMs);
    },
    [resetMs],
  );

  return { copy, copied };
}
