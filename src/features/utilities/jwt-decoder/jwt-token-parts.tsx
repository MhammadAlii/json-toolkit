import { Card } from "@/components/ui/card";

const parts = [
  { name: "Header", tone: "text-json-key" },
  { name: "Payload", tone: "text-json-string" },
  { name: "Signature", tone: "text-json-number" },
];

// The token with its three parts coloured, so it's clear which part is which.
export function JwtTokenParts({ token }: { token: [string, string, string] }) {
  return (
    <Card as="section" tone="surface" aria-label="Token parts" className="overflow-hidden">
      <h3 className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-5 py-4 text-sm font-bold text-heading">
        Token parts
        <span className="flex gap-3 text-[10px] font-bold tracking-[0.6px] uppercase">
          {parts.map((p) => (
            <span key={p.name} className={p.tone}>
              {p.name}
            </span>
          ))}
        </span>
      </h3>
      <p className="max-h-[220px] overflow-auto p-5 font-mono text-xs leading-5 break-all">
        {token.map((t, i) => (
          <span key={i}>
            {i > 0 && <span className="text-muted">.</span>}
            <span className={parts[i].tone}>{t}</span>
          </span>
        ))}
      </p>
    </Card>
  );
}
