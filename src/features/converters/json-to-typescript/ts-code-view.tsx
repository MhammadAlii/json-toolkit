import { LineGutter } from "@/components/ui/line-gutter";

const keywords = new Set(["export", "interface", "type", "readonly"]);
const primitives = new Set(["string", "number", "boolean", "null", "unknown", "any", "undefined", "Record", "Array"]);

// A small tokenizer for the generated code: comments, strings, keywords, built-in and declared types.
function Line({ line }: { line: string }) {
  if (/^\s*\/\*\*/.test(line)) return <span className="text-muted/60 italic">{line}</span>;
  const parts = line.split(/("(?:[^"\\]|\\.)*"|[A-Za-z_$][\w$]*|[^\sA-Za-z_$"]+|\s+)/).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        const next = parts.slice(i + 1).find((x) => x.trim());
        const cls = keywords.has(p)
          ? "text-json-key"
          : primitives.has(p)
            ? "text-json-number"
            : /^"/.test(p)
              ? next === "?:" || next === ":" || next?.startsWith("?") || next?.startsWith(":")
                ? "text-heading"
                : "text-json-string"
              : /^[A-Z]/.test(p)
                ? "text-tint-blue"
                : /^[A-Za-z_$]/.test(p)
                  ? "text-heading"
                  : /\S/.test(p)
                    ? "text-json-punct"
                    : "";
        return (
          <span key={i} className={cls}>
            {p}
          </span>
        );
      })}
    </>
  );
}

export function TsCodeView({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="flex min-h-full">
      <LineGutter count={lines.length} className="text-muted/40" />
      <pre className="min-w-0 flex-1 overflow-x-auto p-4 font-mono text-sm leading-5">
        {lines.map((line, i) => (
          <div key={i}>
            <Line line={line} />
            {line === "" && " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
