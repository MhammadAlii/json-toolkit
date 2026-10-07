import { describeParseError, parseJson } from "@/core/json/parse";
import { decodeBase64 } from "@/features/tools/base64-converter/base64-converter";

export type DecodedJwt = { header: unknown; payload: unknown; signature: string; expiresAt?: Date; issuedAt?: Date };

export type JwtResult = { ok: true; token: DecodedJwt } | { ok: false; error: string };

function decodePart(part: string, label: string): { ok: true; value: unknown } | { ok: false; error: string } {
  const text = decodeBase64(part);
  if (!text.ok) return { ok: false, error: `${label} is not valid Base64URL.` };
  const parsed = parseJson(text.output);
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, error: `${label} is not valid JSON: ${describeParseError(parsed.error)}` };
}

function claimDate(payload: unknown, claim: "exp" | "iat"): Date | undefined {
  const v = payload && typeof payload === "object" ? (payload as Record<string, unknown>)[claim] : undefined;
  return typeof v === "number" ? new Date(v * 1000) : undefined;
}

export function decodeJwt(token: string): JwtResult {
  const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");
  if (parts.length !== 3) return { ok: false, error: "A JWT has three parts separated by dots (header.payload.signature)." };
  const header = decodePart(parts[0], "Header");
  if (!header.ok) return header;
  const payload = decodePart(parts[1], "Payload");
  if (!payload.ok) return payload;
  return {
    ok: true,
    token: {
      header: header.value,
      payload: payload.value,
      signature: parts[2],
      expiresAt: claimDate(payload.value, "exp"),
      issuedAt: claimDate(payload.value, "iat"),
    },
  };
}
