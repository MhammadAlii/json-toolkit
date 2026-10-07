"use client";

import { useCallback, useRef, useState } from "react";

// Fallback for browsers and embedded views that block the async Clipboard API.
function legacyCopy(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

type Status = { key: string; ok: boolean } | null;

export function useClipboard(resetMs = 1500) {
  const [status, setStatus] = useState<Status>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = useCallback(
    async (text: string, key = "default") => {
      let ok: boolean;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = legacyCopy(text);
      }
      setStatus({ key, ok });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setStatus(null), resetMs);
      return ok;
    },
    [resetMs],
  );

  return {
    copy,
    copied: status?.ok ? status.key : null,
    failed: status && !status.ok ? status.key : null,
  };
}
