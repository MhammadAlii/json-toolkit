import type { TransformResult } from "@/core/json/parse";

type Token = { kind: "string"; value: string } | { kind: "word"; value: string } | { kind: "punct"; value: "{" | "}" | "[" | "]" | ":" | "," };

type Context = { type: "object" | "array"; expect: "key" | "colon" | "value" | "next" };

const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", "/": "/", "\\": "\\", '"': '"', "'": "'" };

function tokenize(input: string, fixes: Set<string>): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (/\s/.test(c)) {
      i++;
    } else if (c === "/" && input[i + 1] === "/") {
      while (i < input.length && input[i] !== "\n") i++;
      fixes.add("removed comments");
    } else if (c === "/" && input[i + 1] === "*") {
      const end = input.indexOf("*/", i + 2);
      i = end === -1 ? input.length : end + 2;
      fixes.add("removed comments");
    } else if (c === '"' || c === "'" || c === "`") {
      if (c !== '"') fixes.add("converted single quotes to double quotes");
      let value = "";
      i++;
      while (i < input.length && input[i] !== c) {
        if (input[i] === "\\" && i + 1 < input.length) {
          const e = input[i + 1];
          if (e === "u" && /^[0-9a-fA-F]{4}$/.test(input.slice(i + 2, i + 6))) {
            value += String.fromCharCode(parseInt(input.slice(i + 2, i + 6), 16));
            i += 6;
          } else {
            value += ESCAPES[e] ?? e;
            i += 2;
          }
        } else {
          if (input[i] === "\n" || input[i] === "\t") fixes.add("escaped control characters in strings");
          value += input[i++];
        }
      }
      if (i >= input.length) fixes.add("closed an unterminated string");
      i++;
      tokens.push({ kind: "string", value });
    } else if ("{}[]:,".includes(c)) {
      tokens.push({ kind: "punct", value: c as "{" });
      i++;
    } else {
      let word = "";
      while (i < input.length && !/[\s{}[\]:,"'`]/.test(input[i]) && !(input[i] === "/" && /[/*]/.test(input[i + 1] ?? ""))) {
        word += input[i++];
      }
      tokens.push({ kind: "word", value: word });
    }
  }
  return tokens;
}

function wordToValue(word: string, fixes: Set<string>): string {
  if (/^(true|false|null)$/.test(word)) return word;
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(word)) return word;
  const lowered: Record<string, string> = { True: "true", False: "false", None: "null", undefined: "null", NaN: "null", Infinity: "null", "-Infinity": "null" };
  if (word in lowered) {
    fixes.add("replaced non-JSON literals (True, None, undefined…)");
    return lowered[word];
  }
  const n = Number(word);
  if (word !== "" && Number.isFinite(n)) {
    fixes.add("normalised numbers");
    return String(n);
  }
  fixes.add("quoted unquoted strings");
  return JSON.stringify(word);
}

export function repairJson(input: string): TransformResult {
  if (input.trim() === "") return { ok: false, error: "Input is empty." };
  try {
    return { ok: true, output: JSON.stringify(JSON.parse(input), null, 2), note: "Already valid JSON. No repairs were needed." };
  } catch {
    // Not valid yet; repair below.
  }

  const fixes = new Set<string>();
  const out: string[] = [];
  const stack: Context[] = [];
  let pendingComma = false;
  let rootDone = false;

  const top = () => stack[stack.length - 1];

  const beforeValue = () => {
    const ctx = top();
    if (!ctx) {
      if (rootDone) throw new Error("Input contains more than one top-level value.");
      return;
    }
    if (ctx.expect === "next") {
      fixes.add("added missing commas");
      out.push(",");
    } else if (pendingComma) {
      out.push(",");
    }
    pendingComma = false;
  };

  const afterValue = () => {
    const ctx = top();
    if (ctx) ctx.expect = "next";
    else rootDone = true;
  };

  const close = (ctx: Context) => {
    if (ctx.type === "object" && ctx.expect === "value") {
      fixes.add("filled missing values with null");
      out.push("null");
    } else if (ctx.expect === "colon") {
      fixes.add("filled missing values with null");
      out.push(":null");
    }
    if (pendingComma) fixes.add("removed trailing commas");
    pendingComma = false;
    out.push(ctx.type === "object" ? "}" : "]");
    stack.pop();
    afterValue();
  };

  for (const tok of tokenize(input, fixes)) {
    const ctx = top();
    if (tok.kind === "punct") {
      switch (tok.value) {
        case ",":
          if (ctx?.expect === "next") {
            pendingComma = true;
            ctx.expect = ctx.type === "object" ? "key" : "value";
          } else {
            fixes.add("removed extra commas");
          }
          break;
        case ":":
          if (ctx?.type === "object" && ctx.expect === "colon") {
            out.push(":");
            ctx.expect = "value";
          }
          break;
        case "{":
        case "[":
          if (ctx?.type === "object" && (ctx.expect === "key" || ctx.expect === "next")) {
            beforeValue();
            fixes.add("added missing keys");
            out.push(`"key${out.length}":`);
          } else if (ctx?.expect === "colon") {
            fixes.add("added missing colons");
            out.push(":");
          } else {
            beforeValue();
          }
          out.push(tok.value);
          stack.push({ type: tok.value === "{" ? "object" : "array", expect: tok.value === "{" ? "key" : "value" });
          break;
        case "}":
        case "]":
          if (!ctx) {
            fixes.add("removed extra closing brackets");
          } else {
            if ((tok.value === "}") !== (ctx.type === "object")) fixes.add("fixed mismatched brackets");
            close(ctx);
          }
          break;
      }
      continue;
    }

    const isKey = ctx?.type === "object" && (ctx.expect === "key" || ctx.expect === "next");
    if (isKey) {
      beforeValue();
      if (tok.kind === "word") fixes.add("quoted unquoted keys");
      out.push(JSON.stringify(tok.value));
      ctx.expect = "colon";
      continue;
    }
    if (ctx?.expect === "colon") {
      fixes.add("added missing colons");
      out.push(":");
      ctx.expect = "value";
    } else {
      beforeValue();
    }
    out.push(tok.kind === "string" ? JSON.stringify(tok.value) : wordToValue(tok.value, fixes));
    afterValue();
  }

  if (stack.length) fixes.add("closed unclosed brackets");
  while (stack.length) close(top());

  try {
    const value = JSON.parse(out.join(""));
    const list = [...fixes];
    return {
      ok: true,
      output: JSON.stringify(value, null, 2),
      note: list.length ? `Repaired: ${list.join(", ")}.` : "Repaired formatting.",
    };
  } catch (e) {
    return { ok: false, error: `Couldn't repair this input automatically: ${e instanceof Error ? e.message : String(e)}` };
  }
}
