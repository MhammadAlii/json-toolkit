import { Card } from "@/components/ui/card";

export function MinifierStatCard({ label, value, unit, note }: { label: string; value: string; unit: string; note?: string }) {
  return (
    <Card as="section" tone="surface" aria-label={label} className="flex flex-col gap-2 p-6">
      <h3 className="text-sm leading-[17px] text-muted">{label}</h3>
      <p className="flex items-baseline gap-2">
        <span className="text-3xl leading-9 font-bold text-heading">{value}</span>
        <span className="text-sm font-semibold text-muted">{unit}</span>
      </p>
      {note && <p className="text-xs text-muted">{note}</p>}
    </Card>
  );
}
