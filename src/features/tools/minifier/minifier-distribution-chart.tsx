import { Card } from "@/components/ui/card";
import { formatBytes } from "@/core/text/format-bytes";
import type { Bin } from "./minifier";

const width = 1000;
const height = 100;
const ticks = 8;

// Stacked columns across the original file: how much of each slice is content vs whitespace.
export function MinifierDistributionChart({ bins, totalBytes }: { bins: Bin[]; totalBytes: number }) {
  const max = Math.max(1, ...bins.map((b) => b.content + b.whitespace));
  const slot = width / Math.max(bins.length, 1);
  const bar = slot * 0.7;
  const whitespace = bins.reduce((n, b) => n + b.whitespace, 0);
  return (
    <Card as="section" tone="surface" aria-label="Byte distribution" className="flex flex-col gap-6 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg leading-7 font-bold text-heading">Byte Distribution</h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-sm bg-brand" /> Content
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-sm bg-tint-amber/70" /> Whitespace/Formatting
          </span>
        </div>
      </div>
      <figure>
          <svg viewBox={`0 0 ${width} ${height + 20}`} className="h-[140px] w-full" preserveAspectRatio="none" role="img" aria-label={`${formatBytes(whitespace)} of ${formatBytes(totalBytes)} is whitespace`}>
            {bins.map((b, i) => {
              const x = i * slot + (slot - bar) / 2;
              const ch = (b.content / max) * height;
              const wh = (b.whitespace / max) * height;
              return (
                <g key={i}>
                  <rect x={x} y={height - ch} width={bar} height={ch} rx={1.5} className="fill-brand" />
                  <rect x={x} y={height - ch - wh} width={bar} height={wh} rx={1.5} className="fill-tint-amber/70" />
                </g>
              );
            })}
            <line x1={0} x2={width} y1={height} y2={height} className="stroke-border" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </svg>
          <div aria-hidden className="flex justify-between pt-1 font-mono text-[11px] text-muted">
            {Array.from({ length: ticks + 1 }, (_, i) => (
              <span key={i}>{formatBytes(Math.round((totalBytes * i) / ticks))}</span>
            ))}
          </div>
          <figcaption className="pt-3 text-xs text-muted">
            Position in the original file, left to right. {formatBytes(whitespace)} of {formatBytes(totalBytes)} is whitespace that minifying removes.
          </figcaption>
      </figure>
    </Card>
  );
}
