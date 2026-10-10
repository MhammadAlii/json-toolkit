import { LineGutter } from "@/components/ui/line-gutter";

// Read-only output with line numbers; `firstLineClassName` lets CSV mark its header row.
export function ConverterCodeView({ text, firstLineClassName = "" }: { text: string; firstLineClassName?: string }) {
  const lines = text.split("\n");
  return (
    <div className="flex min-h-full">
      <LineGutter count={lines.length} className="text-muted/40" />
      <pre className="min-w-0 flex-1 overflow-x-auto p-4 font-mono text-sm leading-5 text-muted/90">
        {lines.map((line, i) => (
          <div key={i} className={i === 0 ? firstLineClassName : undefined}>
            {line || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}
