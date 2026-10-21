import { Card } from "@/components/ui/card";

export type ConverterStat = { label: string; value: string; tone?: "success" | "danger" | "brand" };

const tones = { success: "text-success", danger: "text-danger", brand: "text-tint-blue" };

export function ConverterStats({ stats }: { stats: ConverterStat[] }) {
  return (
    <dl className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${stats.length > 5 ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
      {stats.map((s) => (
        <Card key={s.label} tone="surface" className="flex flex-col-reverse gap-1 p-4">
          <dt className="text-[10px] leading-[15px] font-bold tracking-[0.6px] text-muted uppercase">{s.label}</dt>
          <dd className={`flex items-center gap-1.5 text-lg leading-7 font-bold ${s.tone ? tones[s.tone] : "text-heading"}`}>
            {s.tone === "success" && <span aria-hidden className="size-2 rounded-full bg-success" />}
            {s.value}
          </dd>
        </Card>
      ))}
    </dl>
  );
}

/** The Status card: "Successful", or why the input couldn't be converted. */
export const statusStat = (ok: boolean, failure: string): ConverterStat => (ok ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: failure, tone: "danger" });
