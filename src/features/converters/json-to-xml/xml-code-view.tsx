import { LineGutter } from "@/components/ui/line-gutter";

// Colours tags, attribute names and values, and text, with the same theme colours as the JSON views.
function Line({ line }: { line: string }) {
  if (line.startsWith("<?xml")) return <span className="text-muted/60">{line}</span>;
  const parts = line.split(/(<\/?[^\s>/]+|\/?>|\s[^\s=]+(?==")|="[^"]*")/).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        const cls = /^<\/?/.test(p) || /^\/?>$/.test(p)
            ? "text-json-key"
            : /^\s[^\s=]+$/.test(p)
              ? "text-tint-blue"
              : p.startsWith('="')
                ? "text-json-string"
                : "text-heading";
        return (
          <span key={i} className={cls}>
            {p}
          </span>
        );
      })}
    </>
  );
}

export function XmlCodeView({ xml }: { xml: string }) {
  const lines = xml.split("\n");
  return (
    <div className="flex min-h-full">
      <LineGutter count={lines.length} className="text-muted/40" />
      <pre className="min-w-0 flex-1 overflow-x-auto p-4 font-mono text-sm leading-5">
        {lines.map((line, i) => (
          <div key={i}>
            <Line line={line} />
          </div>
        ))}
      </pre>
    </div>
  );
}
