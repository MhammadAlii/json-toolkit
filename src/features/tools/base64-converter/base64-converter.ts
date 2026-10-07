import type { TransformResult } from "@/core/json/parse";

export function encodeBase64(text: string, urlSafe = false): TransformResult {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const encoded = btoa(binary);
  return { ok: true, output: urlSafe ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : encoded };
}

// Accepts standard and URL-safe Base64, with or without padding.
export function decodeBase64(input: string): TransformResult {
  const normalized = input.trim().replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) return { ok: false, error: "Input contains characters that aren't valid Base64." };
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return { ok: true, output: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, error: "This Base64 doesn't decode to valid UTF-8 text." };
  }
}
