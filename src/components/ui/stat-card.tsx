import { Card } from "./card";

export function StatCard({ label, value, highlight = false }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <Card tone="base" className="flex w-40 flex-col-reverse gap-1 p-6">
      <dt className="font-mono text-xs leading-4 tracking-[-0.3px] text-subtle uppercase">{label}</dt>
      <dd className={`text-3xl leading-9 font-bold ${highlight ? "text-brand" : "text-foreground"}`}>{value}</dd>
    </Card>
  );
}
