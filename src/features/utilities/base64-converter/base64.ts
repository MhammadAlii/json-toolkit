export type Base64Options = {
  /** Uses - and _ instead of + and / (RFC 4648 §5). */
  urlSafe: boolean;
  /** Keeps the trailing = padding. */
  padding: boolean;
  /** Breaks lines every 76 characters, as MIME email does. */
  wrap: boolean;
  /** Prefixes data:<type>;base64, so the result can be used as a URL. */
  dataUri: boolean;
};

export const defaultBase64Options: Base64Options = { urlSafe: false, padding: true, wrap: false, dataUri: false };

export type DecodedBase64 =
  | { ok: true; bytes: Uint8Array<ArrayBuffer>; urlSafe: boolean; mime?: string }
  | { ok: false; error: string };

export type Content =
  | { kind: "json"; text: string }
  | { kind: "text"; text: string }
  | { kind: "image"; mime: string; ext: string }
  | { kind: "binary"; mime: string; ext: string; label: string };

export function encodeBase64(bytes: Uint8Array, options: Base64Options, mime = "text/plain;charset=utf-8"): string {
  let binary = "";
  // String.fromCharCode takes its arguments on the stack, so large inputs go in chunks.
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  let b64 = btoa(binary);
  if (options.urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_");
  if (!options.padding) b64 = b64.replace(/=+$/, "");
  if (options.dataUri) return `data:${mime};base64,${b64}`;
  return options.wrap ? (b64.match(/.{1,76}/g) ?? []).join("\n") : b64;
}

/** Decodes standard or URL-safe Base64, with or without padding, line breaks or a data: URI prefix. */
export function decodeBase64(input: string): DecodedBase64 {
  let text = input.trim();
  let mime: string | undefined;
  const uri = /^data:([^,;]*)((?:;[^,;]+)*);base64,/i.exec(text);
  if (uri) {
    mime = uri[1] || "text/plain";
    text = text.slice(uri[0].length);
  }
  const compact = text.replace(/\s+/g, "");
  const bad = /[^A-Za-z0-9+/\-_=]/.exec(compact);
  if (bad) return { ok: false, error: `“${bad[0]}” isn't a Base64 character.` };
  const body = compact.replace(/=+$/, "");
  if (body.includes("=")) return { ok: false, error: "Padding (=) can only appear at the end." };
  if (compact.length - body.length > 2) return { ok: false, error: "There's too much = padding at the end." };
  if (body.length % 4 === 1) return { ok: false, error: "The length is off by one character; the text looks cut short." };
  if (/[+/]/.test(body) && /[-_]/.test(body)) return { ok: false, error: "The text mixes standard (+ /) and URL-safe (- _) characters." };
  const urlSafe = /[-_]/.test(body);
  const standard = body.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(standard.padEnd(Math.ceil(standard.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { ok: true, bytes, urlSafe, mime };
}

const signatures: { bytes: number[]; offset?: number; mime: string; ext: string; label: string; image?: boolean }[] = [
  { bytes: [0x89, 0x50, 0x4e, 0x47], mime: "image/png", ext: "png", label: "PNG image", image: true },
  { bytes: [0xff, 0xd8, 0xff], mime: "image/jpeg", ext: "jpg", label: "JPEG image", image: true },
  { bytes: [0x47, 0x49, 0x46, 0x38], mime: "image/gif", ext: "gif", label: "GIF image", image: true },
  { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8, mime: "image/webp", ext: "webp", label: "WebP image", image: true },
  { bytes: [0x25, 0x50, 0x44, 0x46], mime: "application/pdf", ext: "pdf", label: "PDF document" },
  { bytes: [0x50, 0x4b, 0x03, 0x04], mime: "application/zip", ext: "zip", label: "ZIP archive" },
  { bytes: [0x1f, 0x8b], mime: "application/gzip", ext: "gz", label: "Gzip archive" },
];

const utf8 = new TextDecoder("utf-8", { fatal: true });

/** What the decoded bytes are: JSON, text, a known file type or unknown binary. */
export function describeBytes(bytes: Uint8Array, mime?: string): Content {
  const sig = signatures.find((s) => s.bytes.every((b, i) => bytes[(s.offset ?? 0) + i] === b));
  if (sig) return sig.image ? { kind: "image", mime: sig.mime, ext: sig.ext } : { kind: "binary", mime: sig.mime, ext: sig.ext, label: sig.label };
  let text: string;
  try {
    text = utf8.decode(bytes);
  } catch {
    return { kind: "binary", mime: mime ?? "application/octet-stream", ext: "bin", label: "Binary data" };
  }
  // Control characters other than tabs and line breaks mean it's data that happens to be valid UTF-8.
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) return { kind: "binary", mime: "application/octet-stream", ext: "bin", label: "Binary data" };
  if (mime?.startsWith("image/svg")) return { kind: "image", mime: "image/svg+xml", ext: "svg" };
  const trimmed = text.trim();
  if (/^[[{]/.test(trimmed)) {
    try {
      return { kind: "json", text: JSON.stringify(JSON.parse(trimmed), null, 2) };
    } catch {
      // Not JSON after all; shown as text.
    }
  }
  return { kind: "text", text };
}

/** A hex dump of the first bytes: offset, 16 bytes in hex and their printable ASCII. */
export function hexDump(bytes: Uint8Array, limit = 1024): string {
  const lines: string[] = [];
  for (let i = 0; i < Math.min(bytes.length, limit); i += 16) {
    const row = [...bytes.subarray(i, Math.min(i + 16, bytes.length))];
    const hex = row.map((b) => b.toString(16).padStart(2, "0")).join(" ");
    const ascii = row.map((b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : ".")).join("");
    lines.push(`${i.toString(16).padStart(8, "0")}  ${hex.padEnd(47)}  ${ascii}`);
  }
  return lines.join("\n");
}
