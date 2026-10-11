import { sortDeep } from "@/core/json/sort";

export type JsonOutputOptions = {
  indent: 2 | 4 | "tab" | "minify";
  sortKeys: boolean;
};

export const defaultJsonOutputOptions: JsonOutputOptions = { indent: 2, sortKeys: false };

export type StringToJson =
  | { ok: true; value: unknown; levels: number; note?: string }
  | { ok: false; error: string };

// Stringified JSON is rarely nested deeper than this; it also guards against looping on odd input.
const maxLevels = 10;

const simpleEscapes = new Set(['"', "\\", "/", "b", "f", "n", "r", "t"]);

/**
 * Turns the body of a quoted string (any quote style, outer quotes removed) into the body of a valid
 * double-quoted JSON string: \' and \xHH become JSON escapes, bare double quotes and raw control
 * characters are escaped, and an unknown escape keeps its backslash as a literal one.
 */
function toJsonBody(body: string): string {
  let out = "";
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "\\" && i + 1 < body.length) {
      const next = body[++i];
      if (simpleEscapes.has(next)) out += `\\${next}`;
      else if (next === "'" || next === "`") out += next;
      else if (next === "u" && /^[0-9a-fA-F]{4}$/.test(body.slice(i + 1, i + 5))) out += "\\u";
      else if (next === "x" && /^[0-9a-fA-F]{2}$/.test(body.slice(i + 1, i + 3))) {
        out += `\\u00${body.slice(i + 1, i + 3)}`;
        i += 2;
      } else if (next === "\n") continue;
      else out += `\\\\${next < " " ? JSON.stringify(next).slice(1, -1) : next}`;
    } else if (c === "\\") out += "\\\\";
    else if (c === '"') out += '\\"';
    else if (c < " ") out += JSON.stringify(c).slice(1, -1);
    else out += c;
  }
  return out;
}

function unquote(text: string): string {
  const quoted = /^(["'`])([\s\S]*)\1$/.exec(text);
  return JSON.parse(`"${toJsonBody(quoted ? quoted[2] : text)}"`) as string;
}

const tryParse = (text: string): { ok: true; value: unknown } | { ok: false } => {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false };
  }
};

const looksLikeJson = (text: string) => /^\s*[[{"]/.test(text);

/** Unescapes a stringified JSON value, unwrapping as many levels of stringification as it finds. */
export function stringToJson(input: string): StringToJson {
  const text = input.trim();
  const direct = tryParse(text);
  if (direct.ok && typeof direct.value !== "string") {
    return { ok: true, value: direct.value, levels: 0, note: "This is already JSON, not an escaped string, so it's shown as is." };
  }

  let current: string;
  try {
    current = direct.ok ? (direct.value as string) : unquote(text);
  } catch {
    return { ok: false, error: "This doesn't look like an escaped string. Check for a missing quote or a stray backslash." };
  }

  for (let levels = 1; levels <= maxLevels; levels++) {
    const next = tryParse(current);
    if (!next.ok) {
      return {
        ok: false,
        error: looksLikeJson(current)
          ? "The string was unescaped, but the text inside isn't valid JSON. Try JSON Repair on it."
          : "The string was unescaped, but the text inside isn't JSON.",
      };
    }
    if (typeof next.value !== "string" || !looksLikeJson(next.value)) return { ok: true, value: next.value, levels };
    current = next.value;
  }
  return { ok: false, error: `The string is stringified more than ${maxLevels} times.` };
}

export function formatJson(value: unknown, options: JsonOutputOptions): string {
  const v = options.sortKeys ? sortDeep(value) : value;
  const indent = options.indent === "minify" ? undefined : options.indent === "tab" ? "\t" : options.indent;
  return JSON.stringify(v, null, indent);
}
