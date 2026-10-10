import { Card } from "@/components/ui/card";
import type { SqlColumn } from "./json-to-sql";

// The inferred columns, with each SQL column name editable.
export function SqlColumnsCard({ columns, names, onRename }: { columns: SqlColumn[]; names: Record<string, string>; onRename: (key: string, name: string) => void }) {
  const th = "border-b border-border px-4 py-3 text-left text-[10px] font-bold tracking-[0.6px] whitespace-nowrap text-muted uppercase";
  return (
    <Card as="section" tone="surface" aria-label="Columns" className="overflow-hidden">
      <h3 className="border-b border-border px-5 py-4 text-sm font-bold text-heading">Columns</h3>
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th scope="col" className={th}>
                JSON key
              </th>
              <th scope="col" className={th}>
                SQL column
              </th>
              <th scope="col" className={th}>
                Type
              </th>
              <th scope="col" className={th}>
                Null
              </th>
            </tr>
          </thead>
          <tbody>
            {columns.map((c) => (
              <tr key={c.key} className="border-b border-border/50">
                <td className="px-4 py-2 font-mono text-xs text-muted">{c.key}</td>
                <td className="px-4 py-2">
                  <input
                    aria-label={`SQL column for ${c.key}`}
                    value={names[c.key] ?? c.name}
                    onChange={(e) => onRename(c.key, e.target.value)}
                    spellCheck={false}
                    className="w-full min-w-[120px] rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-heading outline-none focus:border-brand/60"
                  />
                </td>
                <td className="px-4 py-2">
                  <span className="rounded bg-tint-blue/10 px-1.5 py-0.5 font-mono text-[11px] text-tint-blue">{c.sqlType}</span>
                </td>
                <td className="px-4 py-2 text-xs text-muted">{c.nullable ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
