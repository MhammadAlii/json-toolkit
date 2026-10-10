import type { TypeMapRow } from "./json-to-typescript";

export function TsTypeMap({ rows }: { rows: TypeMapRow[] }) {
  const th = "sticky top-0 border-b border-border bg-code-bg px-4 py-3 text-left text-xs font-bold tracking-[0.6px] whitespace-nowrap text-muted uppercase";
  return (
    <table className="w-full border-collapse text-sm leading-5">
      <thead>
        <tr>
          <th scope="col" className={th}>
            Type
          </th>
          <th scope="col" className={th}>
            Property
          </th>
          <th scope="col" className={th}>
            TypeScript
          </th>
          <th scope="col" className={th}>
            Optional
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border/50 even:bg-surface-3/60">
            <td className="px-4 py-2.5 font-mono text-xs text-tint-blue">{r.type}</td>
            <td className="px-4 py-2.5 font-mono text-xs text-heading">{r.property}</td>
            <td className="max-w-[260px] truncate px-4 py-2.5 font-mono text-xs text-json-number" title={r.tsType}>
              {r.tsType}
            </td>
            <td className="px-4 py-2.5 text-xs text-muted">{r.optional ? "Yes" : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
