export type StringOptions = {
  /** How the JSON is laid out before it's escaped. */
  layout: "minify" | "pretty" | "keep";
  /** The quotes around the result; `none` gives just the escaped contents. */
  quotes: "double" | "single" | "none";
  /** Writes characters outside ASCII as \uXXXX escapes. */
  escapeUnicode: boolean;
};

export const defaultStringOptions: StringOptions = { layout: "minify", quotes: "double", escapeUnicode: false };

export type StringConversion = { output: string; escapes: number };

// The contents of a double-quoted JSON string, as JSON.stringify writes them.
const escapeDouble = (text: string) => JSON.stringify(text).slice(1, -1);

// Same escapes, but for a single-quoted string: \" no longer needs escaping and ' does.
const toSingle = (escaped: string) => escaped.replace(/\\(.)|'/g, (m, c: string | undefined) => (c === '"' ? '"' : c ? m : "\\'"));

const escapeNonAscii = (text: string) => text.replace(/[\u0080-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);

/** Escapes JSON text into a string literal; `source` is the original input, used when the layout is kept. */
export function jsonToString(value: unknown, source: string, options: StringOptions): StringConversion {
  const json = options.layout === "minify" ? JSON.stringify(value) : options.layout === "pretty" ? JSON.stringify(value, null, 2) : source.trim();
  let body = escapeDouble(json);
  if (options.quotes === "single") body = toSingle(body);
  if (options.escapeUnicode) body = escapeNonAscii(body);
  const escapes = body.match(/\\(u[0-9a-f]{4}|.)/g)?.length ?? 0;
  const quote = options.quotes === "double" ? '"' : options.quotes === "single" ? "'" : "";
  return { output: `${quote}${body}${quote}`, escapes };
}
