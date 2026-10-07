export type JsonTokenType = "key" | "string" | "number" | "boolean" | "null" | "punct" | "space";

export type JsonToken = { type: JsonTokenType; value: string };

const NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;

// Tokenizes JSON text for syntax highlighting. Unknown characters are kept as punctuation so the
// output always reproduces the input exactly.
export function tokenizeJson(text: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (/\s/.test(c)) {
      let j = i;
      while (j < text.length && /\s/.test(text[j])) j++;
      tokens.push({ type: "space", value: text.slice(i, j) });
      i = j;
    } else if (c === '"') {
      let j = i + 1;
      while (j < text.length && text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
      const value = text.slice(i, j + 1);
      let k = j + 1;
      while (k < text.length && /\s/.test(text[k])) k++;
      tokens.push({ type: text[k] === ":" ? "key" : "string", value });
      i = j + 1;
    } else if (c === "-" || (c >= "0" && c <= "9")) {
      const m = NUMBER.exec(text.slice(i));
      const value = m ? m[0] : c;
      tokens.push({ type: m ? "number" : "punct", value });
      i += value.length;
    } else if (text.startsWith("true", i) || text.startsWith("false", i)) {
      const value = text.startsWith("true", i) ? "true" : "false";
      tokens.push({ type: "boolean", value });
      i += value.length;
    } else if (text.startsWith("null", i)) {
      tokens.push({ type: "null", value: "null" });
      i += 4;
    } else {
      tokens.push({ type: "punct", value: c });
      i++;
    }
  }
  return tokens;
}
