export function ValidatorExcerpt({ lines, errorLine, column }: { lines: { number: number; text: string }[]; errorLine: number; column: number }) {
  return (
    <pre aria-label={`Lines around line ${errorLine}`} className="overflow-x-auto rounded-lg border border-border bg-code-bg py-2 font-mono text-xs leading-5">
      {lines.map((l) => (
        <div key={l.number}>
          <div className={`flex ${l.number === errorLine ? "bg-danger/10 text-heading" : "text-muted"}`}>
            <span className={`w-10 shrink-0 pr-3 text-right select-none ${l.number === errorLine ? "text-danger" : "text-muted/40"}`}>{l.number}</span>
            <span className="pr-3 whitespace-pre">{l.text || " "}</span>
          </div>
          {l.number === errorLine && (
            <div aria-hidden className="flex text-danger">
              <span className="w-10 shrink-0" />
              <span className="whitespace-pre">{`${" ".repeat(Math.max(column - 1, 0))}^`}</span>
            </div>
          )}
        </div>
      ))}
    </pre>
  );
}
