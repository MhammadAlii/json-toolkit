import { formatUtc } from "@/core/text/format-date";
import { relativeTime } from "@/core/text/relative-time";
import { formatZoned, unitLabels, type ParsedTime } from "./epoch";

export type EpochRow = { input: string; parsed: ParsedTime };

// Several timestamps or dates at once, one row each.
export function EpochResultsTable({ rows, now }: { rows: EpochRow[]; now: number | null }) {
  const th = "sticky top-0 border-b border-border bg-code-bg px-4 py-3 text-left text-[10px] font-bold tracking-[0.6px] whitespace-nowrap text-muted uppercase";
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {["Input", "Read as", "UTC", "Your time zone", "Relative"].map((h) => (
            <th key={h} scope="col" className={th}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(({ input, parsed }, i) => (
          <tr key={i} className="border-b border-border/50 align-top even:bg-surface-3/60">
            <td className="max-w-[200px] truncate px-4 py-2.5 font-mono text-xs text-muted" title={input}>
              {input}
            </td>
            {parsed.ok ? (
              <>
                <td className="px-4 py-2.5 text-xs whitespace-nowrap text-muted">{parsed.unit ? unitLabels[parsed.unit] : "Date"}</td>
                <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap text-heading">{formatUtc(Math.floor(parsed.ms) / 1000)}</td>
                <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap text-heading">{formatZoned(parsed.ms)}</td>
                <td className="px-4 py-2.5 text-xs whitespace-nowrap text-muted">{now === null ? "—" : relativeTime(Math.floor(parsed.ms / 1000), now)}</td>
              </>
            ) : (
              <td colSpan={4} className="px-4 py-2.5 text-xs text-danger">
                {parsed.error}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
