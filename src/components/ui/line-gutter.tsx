import { forwardRef } from "react";

export const LineGutter = forwardRef<HTMLDivElement, { count: number; highlight?: number; className?: string }>(function LineGutter(
  { count, highlight, className = "" },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden
      className={`shrink-0 overflow-hidden border-r border-border/60 py-4 pr-3 pl-4 text-right font-mono text-sm leading-5 text-muted/40 select-none ${className}`}
    >
      {Array.from({ length: Math.max(count, 1) }, (_, i) => (
        <div key={i} className={i + 1 === highlight ? "font-semibold text-danger" : undefined}>
          {i + 1}
        </div>
      ))}
    </div>
  );
});
