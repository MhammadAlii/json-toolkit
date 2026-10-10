import { LineGutter } from "@/components/ui/line-gutter";

const keywords = /^(INSERT|INTO|VALUES|UPDATE|SET|WHERE|CREATE|TABLE|IF|NOT|EXISTS|PRIMARY|KEY|NULL|ON|CONFLICT|DO|NOTHING|DUPLICATE|IGNORE|OR|MERGE|USING|AS|WHEN|MATCHED|THEN|BEGIN|START|TRANSACTION|COMMIT|TRUE|FALSE|excluded|target|source)$/;
const types = /^(INTEGER|INT|BIGINT|REAL|FLOAT|DOUBLE|PRECISION|BOOLEAN|BIT|DATE|DATETIME|DATETIME2|TIMESTAMP|TEXT|VARCHAR|NVARCHAR|MAX|JSON|JSONB)$/;

// Colours SQL keywords, types, strings and numbers with the theme's JSON colours.
function Line({ line }: { line: string }) {
  const parts = line.split(/(N?'(?:[^']|'')*'|"(?:[^"]|"")*"|`[^`]*`|\[[^\]]*\]|-?\b\d+(?:\.\d+)?(?:e[-+]?\d+)?\b|[A-Za-z_][\w]*|\s+|.)/).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        const cls = /^N?'/.test(p)
          ? "text-json-string"
          : keywords.test(p)
            ? "text-json-key"
            : types.test(p)
              ? "text-tint-blue"
              : /^-?\d/.test(p)
                ? "text-json-number"
                : /^[A-Za-z_"`[]/.test(p)
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

// Long multi-row INSERTs are capped so the view stays responsive; copy and download include everything.
const maxLines = 3000;

export function SqlCodeView({ sql }: { sql: string }) {
  const lines = sql.split("\n");
  return (
    <div className="flex min-h-full">
      <LineGutter count={Math.min(lines.length, maxLines)} className="text-muted/40" />
      <pre className="min-w-0 flex-1 overflow-x-auto p-4 font-mono text-sm leading-5">
        {lines.slice(0, maxLines).map((line, i) => (
          <div key={i}>
            <Line line={line} />
            {line === "" && " "}
          </div>
        ))}
        {lines.length > maxLines && <div className="pt-2 font-sans text-xs text-muted">Showing {maxLines.toLocaleString()} of {lines.length.toLocaleString()} lines. Copy or download to get all of it.</div>}
      </pre>
    </div>
  );
}
