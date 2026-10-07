import { isPlainObject } from "@/core/json/path";
import { JsonPrimitive } from "./json-primitive";

function rowsFor(value: unknown): { columns: string[]; rows: Record<string, unknown>[] } | null {
  if (Array.isArray(value) && value.length > 0 && value.every(isPlainObject)) {
    const columns = [...new Set(value.flatMap((r) => Object.keys(r)))];
    return { columns, rows: value };
  }
  if (Array.isArray(value)) return { columns: ["#", "value"], rows: value.map((v, i) => ({ "#": i, value: v })) };
  if (isPlainObject(value)) return { columns: ["key", "value"], rows: Object.entries(value).map(([key, v]) => ({ key, value: v })) };
  return null;
}

export function JsonTableView({ value }: { value: unknown }) {
  const table = rowsFor(value);
  if (!table) return <p className="p-4 text-sm text-muted">A single value can&apos;t be shown as a table.</p>;

  return (
    <div className="p-4">
      <table className="w-full border-collapse font-mono text-xs leading-5">
        <thead>
          <tr>
            {table.columns.map((c) => (
              <th key={c} scope="col" className="sticky top-0 border-b border-border bg-code-bg px-3 py-2 text-left font-bold text-heading">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-border/20">
              {table.columns.map((c) => (
                <td key={c} className="max-w-xs truncate px-3 py-2 align-top">
                  {c in row ? <JsonPrimitive value={row[c]} /> : <span className="text-muted/40">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
