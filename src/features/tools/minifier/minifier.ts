import { lintJson, type LintError } from "@/core/json/lint";

export type Bin = { content: number; whitespace: number };

export type Minified =
  | { status: "empty" }
  | { status: "invalid"; error: LintError }
  | { status: "minified"; output: string; originalBytes: number; minifiedBytes: number; savedPercent: number; bins: Bin[] };

const utf8Length = (code: number) => (code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4);

/**
 * Removes whitespace between tokens straight from the source text, so numbers, escapes and key
 * order stay byte-for-byte identical (JSON.parse + stringify would round big numbers and rewrite escapes).
 */
export function minify(text: string, binCount = 40): Minified {
  if (text.trim() === "") return { status: "empty" };
  const lint = lintJson(text);
  if (!lint.ok) return { status: "invalid", error: lint.error };

  const kept: string[] = [];
  const perChar: { bytes: number; whitespace: boolean }[] = [];
  let inString = false;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const code = text.codePointAt(i)!;
    const bytes = utf8Length(code);
    const wide = code > 0xffff;
    if (inString) {
      if (c === "\\") {
        perChar.push({ bytes: 2, whitespace: false });
        i++;
        continue;
      }
      if (c === '"') inString = false;
      perChar.push({ bytes, whitespace: false });
    } else if (c === " " || c === "\n" || c === "\r" || c === "\t") {
      if (i > start) kept.push(text.slice(start, i));
      start = i + 1;
      perChar.push({ bytes: 1, whitespace: true });
    } else {
      if (c === '"') inString = true;
      perChar.push({ bytes, whitespace: false });
    }
    if (wide) i++;
  }
  kept.push(text.slice(start));
  const output = kept.join("");

  const originalBytes = perChar.reduce((n, c) => n + c.bytes, 0);
  const minifiedBytes = originalBytes - perChar.reduce((n, c) => n + (c.whitespace ? c.bytes : 0), 0);
  const bins: Bin[] = Array.from({ length: binCount }, () => ({ content: 0, whitespace: 0 }));
  let offset = 0;
  for (const c of perChar) {
    const bin = bins[Math.min(binCount - 1, Math.floor((offset / originalBytes) * binCount))];
    if (c.whitespace) bin.whitespace += c.bytes;
    else bin.content += c.bytes;
    offset += c.bytes;
  }
  const savedPercent = originalBytes ? ((originalBytes - minifiedBytes) / originalBytes) * 100 : 0;
  return { status: "minified", output, originalBytes, minifiedBytes, savedPercent, bins };
}

/** Gzip size of the text, where the browser supports CompressionStream. */
export async function gzipSize(text: string): Promise<number | null> {
  if (typeof CompressionStream === "undefined") return null;
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  return (await new Response(stream).arrayBuffer()).byteLength;
}
