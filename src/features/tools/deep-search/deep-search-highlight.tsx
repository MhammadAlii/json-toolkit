import type { Range } from "./deep-search";

/** Text with the matched ranges marked. */
export function DeepSearchHighlight({ text, ranges, max = 400 }: { text: string; ranges: Range[]; max?: number }) {
  const shown = text.length > max ? `${text.slice(0, max)}…` : text;
  const parts: React.ReactNode[] = [];
  let at = 0;
  ranges.forEach(([start, end], i) => {
    if (start >= shown.length || end <= start) return;
    if (start > at) parts.push(shown.slice(at, start));
    parts.push(
      <mark key={i} className="rounded-sm bg-brand/25 px-px text-heading">
        {shown.slice(start, Math.min(end, shown.length))}
      </mark>,
    );
    at = Math.min(end, shown.length);
  });
  if (at < shown.length) parts.push(shown.slice(at));
  return <>{parts}</>;
}
