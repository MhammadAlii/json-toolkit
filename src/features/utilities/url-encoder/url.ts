export type UrlOptions = {
  /** `component` escapes everything reserved (encodeURIComponent); `uri` keeps a full URL's structure (encodeURI); `form` is component with spaces as `+`. */
  mode: "component" | "uri" | "form";
  /** Decoding: reads `+` as a space, as HTML forms send it. */
  plusAsSpace: boolean;
  /** Converts each line on its own, keeping the line breaks. */
  perLine: boolean;
};

export const defaultUrlOptions: UrlOptions = { mode: "component", plusAsSpace: false, perLine: false };

export type UrlResult = { ok: true; value: string } | { ok: false; error: string };

export type UrlParts = {
  protocol: string;
  host: string;
  port: string;
  path: string;
  hash: string;
  params: [string, string][];
};

const eachLine = (text: string, perLine: boolean, fn: (line: string) => string) => (perLine ? text.split("\n").map(fn).join("\n") : fn(text));

/** Percent-encodes text; fails only on unpaired surrogates, which have no UTF-8 form. */
export function encodeUrl(text: string, options: UrlOptions): UrlResult {
  try {
    const value = eachLine(text, options.perLine, (line) =>
      options.mode === "uri" ? encodeURI(line) : options.mode === "form" ? encodeURIComponent(line).replace(/%20/g, "+") : encodeURIComponent(line),
    );
    return { ok: true, value };
  } catch {
    return { ok: false, error: "The text contains a broken Unicode character (an unpaired surrogate) that can't be encoded." };
  }
}

// Points at the first sequence decodeURIComponent rejects, so the error can say where it is.
function decodeError(text: string): string {
  const bad = /%(?![0-9A-Fa-f]{2})/.exec(text);
  if (bad) return `The % at character ${bad.index + 1} isn't followed by two hex digits.`;
  const run = /(?:%[0-9A-Fa-f]{2})+/g;
  for (let m = run.exec(text); m; m = run.exec(text)) {
    try {
      decodeURIComponent(m[0]);
    } catch {
      return `The encoded bytes at character ${m.index + 1} (${m[0].slice(0, 24)}) aren't valid UTF-8.`;
    }
  }
  return "The text can't be decoded.";
}

export function decodeUrl(text: string, options: UrlOptions): UrlResult {
  let failed = "";
  const value = eachLine(text, options.perLine, (line) => {
    const source = options.plusAsSpace ? line.replace(/\+/g, " ") : line;
    try {
      return decodeURIComponent(source);
    } catch {
      failed ||= decodeError(source);
      return source;
    }
  });
  return failed ? { ok: false, error: failed } : { ok: true, value };
}

export const escapeCount = (text: string) => text.match(/%[0-9A-Fa-f]{2}/g)?.length ?? 0;

/** Splits a full URL (with a scheme such as https:) into its parts and decoded query parameters. */
export function urlParts(text: string): UrlParts | null {
  const trimmed = text.trim();
  // A space in the path or query is fine (browsers encode it), but not in the host or across lines.
  if (!/^[a-z][a-z0-9+.-]*:\/\/[^\s/?#]+[^\n]*$/i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    return {
      protocol: url.protocol.replace(/:$/, ""),
      host: url.hostname,
      port: url.port,
      path: decodeSafe(url.pathname),
      hash: decodeSafe(url.hash.replace(/^#/, "")),
      params: [...url.searchParams.entries()],
    };
  } catch {
    return null;
  }
}

function decodeSafe(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}
