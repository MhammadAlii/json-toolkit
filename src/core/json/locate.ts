import type { PathSegment } from "@/core/json/path";

const key = (path: PathSegment[]) => JSON.stringify(path);

/** Maps every value's path to the 1-based line where it starts. Expects text that parses as JSON. */
export function locateLines(text: string): (path: PathSegment[]) => number | undefined {
  const lines = new Map<string, number>();
  let i = 0;
  let line = 1;
  const skip = () => {
    while (i < text.length && /\s/.test(text[i])) {
      if (text[i] === "\n") line++;
      i++;
    }
  };
  const string = () => {
    let out = "";
    i++;
    while (i < text.length && text[i] !== '"') {
      if (text[i] === "\\") {
        out += JSON.parse(`"${text.slice(i, text[i + 1] === "u" ? i + 6 : i + 2)}"`);
        i += text[i + 1] === "u" ? 6 : 2;
      } else out += text[i++];
    }
    i++;
    return out;
  };
  const value = (path: PathSegment[]) => {
    skip();
    lines.set(key(path), line);
    const c = text[i];
    if (c === "{") {
      i++;
      skip();
      if (text[i] === "}") return void i++;
      for (;;) {
        skip();
        const k = string();
        skip();
        i++; // :
        value([...path, k]);
        skip();
        if (text[i++] === "}") return;
      }
    }
    if (c === "[") {
      i++;
      skip();
      if (text[i] === "]") return void i++;
      for (let n = 0; ; n++) {
        value([...path, n]);
        skip();
        if (text[i++] === "]") return;
      }
    }
    if (c === '"') return void string();
    while (i < text.length && /[^\s,\]}]/.test(text[i])) i++;
  };
  value([]);
  return (path) => lines.get(key(path));
}
