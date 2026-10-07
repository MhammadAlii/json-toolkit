import type { TransformResult } from "@/core/json/parse";

export function encodeUrl(text: string): TransformResult {
  return { ok: true, output: encodeURIComponent(text) };
}

export function decodeUrl(text: string): TransformResult {
  try {
    return { ok: true, output: decodeURIComponent(text.replace(/\+/g, " ")) };
  } catch {
    return { ok: false, error: "Malformed percent-encoding: every % must be followed by two hex digits." };
  }
}
