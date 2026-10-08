import { cellPath, cellText, type JsonTable, type TableRow } from "@/core/json/table";
import { samePath, type PathSegment } from "@/core/json/path";
import { JsonTableCell } from "./json-table-cell";

const th = "sticky top-0 z-10 border-b border-border bg-code-bg px-4 py-3 text-left text-xs font-bold tracking-[0.6px] whitespace-nowrap text-muted uppercase";

export function JsonTableView({
  table,
  rows,
  columns,
  selectedPath,
  onSelect,
}: {
  table: JsonTable;
  rows: TableRow[];
  columns: string[];
  selectedPath?: PathSegment[];
  onSelect?: (path: PathSegment[]) => void;
}) {
  const indexed = table.kind !== "entries";
  const cellClass = (path: PathSegment[]) =>
    `${selectedPath && samePath(selectedPath, path) ? "bg-brand/10 outline outline-1 -outline-offset-1 outline-brand/40" : ""} ${onSelect ? "cursor-pointer hover:bg-border/30" : ""}`;

  return (
    <table className="w-full border-collapse text-sm leading-5">
      <thead>
        <tr>
          {indexed && (
            <th scope="col" className={`${th} left-0 z-20 w-12`}>
              #
            </th>
          )}
          {columns.map((c) => (
            <th key={c} scope="col" className={th}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.path[0])} className="group border-b border-border/50">
            {indexed && (
              <td
                onClick={() => onSelect?.(row.path)}
                className={`sticky left-0 bg-code-bg px-4 py-3 font-mono text-xs text-muted group-even:bg-surface-3 ${cellClass(row.path)}`}
              >
                {Number(row.path[0]) + 1}
              </td>
            )}
            {columns.map((c, ci) => {
              const present = c in row.cells;
              const path = present ? cellPath(table, row, c) : row.path;
              return (
                <td
                  key={c}
                  title={present ? cellText(row.cells[c]).slice(0, 300) : undefined}
                  onClick={() => onSelect?.(path)}
                  className={`max-w-[240px] truncate px-4 py-3 align-top group-even:bg-surface-3/60 ${cellClass(path)}`}
                >
                  <JsonTableCell value={row.cells[c]} emphasize={ci === 0} />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
