import { Kbd } from "@/components/ui/kbd";

export function SearchHints({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between border-t border-border bg-background/50 px-4 py-4 text-[10px] leading-[15px]">
      <div className="flex gap-4 text-muted">
        <span className="flex items-center gap-1">
          <Kbd tone="solid">↑↓</Kbd> Navigate
        </span>
        <span className="flex items-center gap-1">
          <Kbd tone="solid">Enter</Kbd> Select
        </span>
      </div>
      <span className="font-medium text-brand/60">{total} tools available</span>
    </div>
  );
}
