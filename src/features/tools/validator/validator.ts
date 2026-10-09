import { lintJson, type LintError } from "@/core/json/lint";
import { jsonStats, type JsonStats } from "@/core/json/stats";

export type Explanation = {
  /** Short headline, rendered as `lead` + `token` + `trail`, e.g. Unexpected token "status" at line 9, column 3. */
  lead: string;
  token?: string;
  trail: string;
  what: string;
  tips: string[];
};

export type Validation =
  | { status: "empty" }
  | { status: "valid"; stats: JsonStats; value: unknown }
  | { status: "invalid"; error: LintError; explanation: Explanation };

const where = (e: LintError) => ` at line ${e.line}, column ${e.column}.`;

const numberRules: Record<string, string> = {
  "leading-zero": "Numbers can't start with a zero unless the number is 0 itself, such as 0.5.",
  "leading-dot": "Numbers need a digit before the decimal point, so .5 must be written as 0.5.",
  "trailing-dot": "Numbers need a digit after the decimal point, so 1. must be written as 1 or 1.0.",
  plus: "Positive numbers can't have a + sign.",
  exponent: "An exponent like e or E has to be followed by digits, as in 1e3.",
  radix: "Hexadecimal, binary and octal numbers aren't allowed; write the number in decimal.",
  "missing-digits": "A minus sign has to be followed by digits.",
};

const literalFixes: Record<string, string> = {
  True: "Use lowercase true.",
  False: "Use lowercase false.",
  TRUE: "Use lowercase true.",
  FALSE: "Use lowercase false.",
  None: "Use null instead of None.",
  NULL: "Use lowercase null.",
  Null: "Use lowercase null.",
  undefined: "Use null, or remove the property, instead of undefined.",
  NaN: "NaN isn't allowed; use null or a string such as \"NaN\".",
  Infinity: "Infinity isn't allowed; use null or a string such as \"Infinity\".",
};

export function explain(e: LintError): Explanation {
  const t = e.token;
  switch (e.code) {
    case "EMPTY_INPUT":
      return { lead: "The input is empty.", trail: "", what: "There's nothing to validate yet.", tips: ["Paste JSON or load a file."] };
    case "BOM":
      return {
        lead: "The text starts with an invisible byte order mark",
        trail: ".",
        what: "Some editors add a byte order mark (U+FEFF) at the start of a file. It's invisible, but strict JSON parsers reject it.",
        tips: ["Save the file as UTF-8 without BOM.", "Or use Auto-Repair to strip it."],
      };
    case "MISSING_COMMA":
      return {
        lead: "Unexpected token ",
        token: t,
        trail: where(e),
        what: `It looks like you're missing a comma after ${e.previous!.description} on line ${e.previous!.line}.`,
        tips: [`Add a comma at the end of line ${e.previous!.line}.`, `If ${t} shouldn't be there, remove it.`],
      };
    case "TRAILING_COMMA":
      return {
        lead: "Trailing comma",
        trail: where(e),
        what: "There's a comma after the last item. JSON doesn't allow a comma before a closing } or ].",
        tips: [`Remove the comma at line ${e.line}, column ${e.column}.`, "Or add the item that was meant to follow it."],
      };
    case "MISSING_COLON":
      return {
        lead: "Expected a colon but found ",
        token: t,
        trail: where(e),
        what: `${capitalize(e.previous!.description)} on line ${e.previous!.line} isn't followed by a colon.`,
        tips: ["Put a colon between each key and its value, as in \"key\": value."],
      };
    case "SINGLE_QUOTES":
      return {
        lead: "Single-quoted string ",
        token: t,
        trail: where(e),
        what: "JSON strings and keys must use double quotes (\"). Single quotes are allowed in JavaScript but not in JSON.",
        tips: ["Replace the single quotes with double quotes.", "Auto-Repair can convert every single-quoted string at once."],
      };
    case "UNQUOTED_KEY":
      return {
        lead: "Unquoted key ",
        token: t,
        trail: where(e),
        what: "Every key in a JSON object has to be a string in double quotes.",
        tips: [`Write the key as "${t}".`, "Auto-Repair can quote every unquoted key at once."],
      };
    case "COMMENT":
      return {
        lead: "Comment found",
        trail: where(e),
        what: "Standard JSON doesn't support comments. Formats like JSON5 and JSONC allow them, but strict parsers reject them.",
        tips: ["Remove the comment.", "Auto-Repair strips all comments."],
      };
    case "UNCLOSED_STRING":
      return {
        lead: "The string ",
        token: t,
        trail: ` starting at line ${e.line}, column ${e.column} is never closed.`,
        what: "A string has to end with a double quote on the same line. Line breaks inside strings must be written as \\n.",
        tips: ["Add the missing closing double quote.", "If the string spans several lines, replace each line break with \\n."],
      };
    case "UNCLOSED_BRACKET": {
      const kind = e.opener!.char === "{" ? "object" : "array";
      return {
        lead: `The ${kind} opened`,
        trail: `${where(e).replace(".", "")} is never closed.`,
        what: `The input ends before the ${kind} that starts with ${e.opener!.char} on line ${e.opener!.line} is closed.`,
        tips: [`Add ${e.opener!.char === "{" ? "}" : "]"} where the ${kind} should end.`, "Check that every { has a matching } and every [ a matching ]."],
      };
    }
    case "MISMATCHED_BRACKET": {
      const expected = e.opener!.char === "{" ? "}" : "]";
      return {
        lead: "Mismatched bracket ",
        token: t,
        trail: where(e),
        what: `The ${e.opener!.char === "{" ? "object" : "array"} opened with ${e.opener!.char} on line ${e.opener!.line} has to be closed with ${expected}, not ${t}.`,
        tips: [`Replace ${t} with ${expected}.`, "Or add the missing opening bracket earlier."],
      };
    }
    case "INVALID_LITERAL":
      return {
        lead: "Unexpected word ",
        token: t,
        trail: where(e),
        what: literalFixes[t]
          ? `JSON only allows the literals true, false and null, written in lowercase. ${literalFixes[t]}`
          : "Text values have to be strings in double quotes. Only true, false and null can appear without quotes.",
        tips: literalFixes[t] ? [literalFixes[t]] : [`Write it as "${t}" if it's meant to be text.`],
      };
    case "INVALID_NUMBER":
      return {
        lead: "Invalid number ",
        token: t,
        trail: where(e),
        what: numberRules[e.detail ?? ""] ?? "This isn't a valid JSON number.",
        tips: ["Write the number in plain decimal form, such as 42, -3.5 or 1e6.", "Or wrap it in double quotes if it should stay text."],
      };
    case "INVALID_ESCAPE":
      return {
        lead: "Invalid escape ",
        token: t,
        trail: where(e),
        what: "Inside strings, a backslash must start one of \\\" \\\\ \\/ \\b \\f \\n \\r \\t or \\u followed by 4 hex digits.",
        tips: ["Write a literal backslash as \\\\.", "Check \\u escapes have exactly 4 hex digits."],
      };
    case "CONTROL_CHAR":
      return {
        lead: "Raw control character ",
        token: t,
        trail: where(e),
        what: "Strings can't contain raw tabs or other control characters; they must be escaped.",
        tips: ["Replace tabs with \\t inside strings.", "Escape other control characters as \\u00XX."],
      };
    case "TRAILING_DATA":
      return {
        lead: "Unexpected content ",
        token: t,
        trail: where(e),
        what: `The JSON value already ended with ${e.previous!.description} on line ${e.previous!.line}, but more content follows. A JSON document holds exactly one top-level value.`,
        tips: ["Remove the extra content.", "To keep several values, wrap them in an array: [value1, value2]."],
      };
    case "UNEXPECTED_END":
      return {
        lead: "Unexpected end of input",
        trail: where(e),
        what: "The JSON stops in the middle of a value, for example after a colon or comma.",
        tips: ["Add the missing value.", "Check that the text wasn't cut off when copying."],
      };
    case "UNEXPECTED_TOKEN":
      return {
        lead: "Unexpected token ",
        token: t,
        trail: where(e),
        what: e.detail === "too-deep" ? "The JSON is nested too deeply to check." : "This character can't appear here in JSON.",
        tips: ["Check the characters just before it for a missing value, quote or bracket."],
      };
  }
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function validateJsonText(text: string): Validation {
  if (text.trim() === "") return { status: "empty" };
  const lint = lintJson(text);
  if (!lint.ok) return { status: "invalid", error: lint.error, explanation: explain(lint.error) };
  const value = JSON.parse(text) as unknown;
  return { status: "valid", stats: jsonStats(value), value };
}

/** The lines around an error, for showing it in context. */
export function excerpt(text: string, line: number, radius = 2): { number: number; text: string }[] {
  const lines = text.split("\n");
  const from = Math.max(1, line - radius);
  const to = Math.min(lines.length, line + radius);
  return Array.from({ length: to - from + 1 }, (_, k) => ({ number: from + k, text: lines[from + k - 1] }));
}
