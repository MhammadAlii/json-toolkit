import { Card } from "@/components/ui/card";
import { formatUtc } from "@/core/text/format-date";
import { relativeTime } from "@/core/text/relative-time";
import type { JwtClaim } from "./jwt";

// Every payload claim; registered ones get their meaning and time claims a readable date.
export function JwtClaimsCard({ claims, now }: { claims: JwtClaim[]; now: number | null }) {
  const th = "border-b border-border px-4 py-3 text-left text-[10px] font-bold tracking-[0.6px] whitespace-nowrap text-muted uppercase";
  return (
    <Card as="section" tone="surface" aria-label="Claims" className="overflow-hidden">
      <h3 className="border-b border-border px-5 py-4 text-sm font-bold text-heading">Claims</h3>
      {claims.length === 0 ? (
        <p className="p-5 text-sm text-muted">The payload has no claims.</p>
      ) : (
        <div className="max-h-[360px] overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th scope="col" className={th}>
                  Claim
                </th>
                <th scope="col" className={th}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.key} className="border-b border-border/50 align-top">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="font-mono text-xs text-json-key">{c.key}</span>
                    {c.label && <span className="block text-[11px] text-muted">{c.label}</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs break-all text-heading">{c.value}</span>
                    {c.time !== undefined && (
                      <span className="block text-[11px] text-muted">
                        {formatUtc(c.time)}
                        {now !== null && ` · ${relativeTime(c.time, now)}`}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
