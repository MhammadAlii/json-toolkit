import { CompressIcon } from "@/components/icons/compress";
import { Card } from "@/components/ui/card";

export function MinifierReductionCard({ percent }: { percent: number }) {
  const shown = `${percent.toFixed(1)}% Saved`;
  return (
    <Card as="section" tone="surface" aria-label="Reduction percentage" className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm leading-[17px] text-muted">Reduction Percentage</h3>
          <p className="pt-1 text-3xl leading-8 font-bold text-success">{shown}</p>
        </div>
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
          <CompressIcon className="h-5 w-auto" />
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Size saved"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        className="h-3 overflow-hidden rounded-full border border-border bg-background"
      >
        <div className="h-full rounded-full bg-gradient-to-r from-success/70 to-success transition-[width] duration-500" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </Card>
  );
}
