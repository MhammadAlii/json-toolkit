import { Card } from "@/components/ui/card";
import type { UrlParts } from "./url";

// A full URL split into its parts, with the query string as decoded key/value pairs.
export function UrlPartsCard({ parts }: { parts: UrlParts }) {
  const th = "border-b border-border px-4 py-3 text-left text-[10px] font-bold tracking-[0.6px] whitespace-nowrap text-muted uppercase";
  const rows = [
    ["Protocol", parts.protocol],
    ["Host", parts.host],
    ["Port", parts.port],
    ["Path", parts.path],
    ["Fragment", parts.hash],
  ].filter(([, v]) => v);
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card as="section" tone="surface" aria-label="URL parts" className="overflow-hidden">
        <h3 className="border-b border-border px-5 py-4 text-sm font-bold text-heading">URL parts</h3>
        <dl className="divide-y divide-border/50">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 px-5 py-2.5 text-sm">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-mono text-xs break-all text-heading">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card as="section" tone="surface" aria-label="Query parameters" className="overflow-hidden">
        <h3 className="border-b border-border px-5 py-4 text-sm font-bold text-heading">
          Query parameters <span className="font-normal text-muted">({parts.params.length})</span>
        </h3>
        {parts.params.length === 0 ? (
          <p className="p-5 text-sm text-muted">The URL has no query string.</p>
        ) : (
          <div className="max-h-[360px] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className={th}>
                    Key
                  </th>
                  <th scope="col" className={th}>
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {parts.params.map(([k, v], i) => (
                  <tr key={i} className="border-b border-border/50 align-top">
                    <td className="px-4 py-2.5 font-mono text-xs break-all text-json-key">{k}</td>
                    <td className="px-4 py-2.5 font-mono text-xs break-all text-heading">{v || <span className="text-muted/40">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
