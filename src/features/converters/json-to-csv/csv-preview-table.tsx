// Rendering huge tables is slow; the preview shows the first rows and says how many are left out.
const maxRows = 200;

export function CsvPreviewTable({ headers, cells }: { headers: string[]; cells: string[][] }) {
  const th = "sticky top-0 border-b border-border bg-code-bg px-4 py-3 text-left text-xs font-bold tracking-[0.6px] whitespace-nowrap text-muted uppercase";
  return (
    <div>
      <table className="w-full border-collapse text-sm leading-5">
        <thead>
          <tr>
            <th scope="col" className={`${th} w-12`}>
              #
            </th>
            {headers.map((h) => (
              <th key={h} scope="col" className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cells.slice(0, maxRows).map((row, i) => (
            <tr key={i} className="border-b border-border/50 even:bg-surface-3/60">
              <td className="px-4 py-2.5 font-mono text-xs text-muted">{i + 1}</td>
              {row.map((c, j) => (
                <td key={j} className="max-w-[240px] truncate px-4 py-2.5 text-heading" title={c}>
                  {c || <span className="text-muted/40">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {cells.length > maxRows && (
        <p className="px-4 py-3 text-xs text-muted">
          Showing the first {maxRows} of {cells.length.toLocaleString()} rows. The CSV tab and download include all of them.
        </p>
      )}
    </div>
  );
}
