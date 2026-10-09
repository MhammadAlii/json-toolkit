"use client";

import { useEffect, useMemo, useRef } from "react";
import { jsonTokenClasses } from "@/components/json/json-token-classes";
import type { OutputSegment } from "./repair";

type Line = { number: number; parts: OutputSegment[] };

function toLines(segments: OutputSegment[]): Line[] {
  const lines: Line[] = [{ number: 1, parts: [] }];
  for (const seg of segments) {
    const pieces = seg.text.split("\n");
    pieces.forEach((text, i) => {
      if (i > 0) lines.push({ number: lines.length + 1, parts: [] });
      if (text) lines[lines.length - 1].parts.push({ ...seg, text });
    });
  }
  return lines;
}

const tone = (type: OutputSegment["type"]) => (type === "space" ? "" : jsonTokenClasses[type]);

// Rendering every line of a huge result is slow, so long output is capped with a note.
const maxLines = 5000;

export function RepairOutputView({ segments, focusLine }: { segments: OutputSegment[]; focusLine?: number }) {
  const lines = useMemo(() => toLines(segments), [segments]);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusLine === undefined || !root.current) return;
    // The panel body around this view is the scroll container.
    const scroller = root.current.parentElement;
    const row = root.current.querySelector<HTMLElement>(`[data-line="${focusLine}"]`);
    if (scroller && row) scroller.scrollTo({ top: row.offsetTop - scroller.clientHeight / 3, behavior: "smooth" });
  }, [focusLine]);

  return (
    <div ref={root} className="relative min-w-max py-4 font-mono text-sm leading-5">
      {lines.slice(0, maxLines).map((l) => (
        <div key={l.number} data-line={l.number} className={`flex ${l.number === focusLine ? "bg-success/10" : ""}`}>
          <span aria-hidden className="w-12 shrink-0 pr-3 text-right text-muted/40 select-none">
            {l.number}
          </span>
          <span className="pr-4 pl-3 whitespace-pre">
            {l.parts.map((p, i) =>
              p.changed ? (
                <mark key={i} className={`rounded-sm bg-success/20 px-px ring-1 ring-success/40 ${tone(p.type)}`}>
                  {p.text}
                </mark>
              ) : (
                <span key={i} className={tone(p.type)}>
                  {p.text}
                </span>
              ),
            )}
          </span>
        </div>
      ))}
      {lines.length > maxLines && (
        <p className="px-4 pt-3 text-xs text-muted">Showing the first {maxLines.toLocaleString()} of {lines.length.toLocaleString()} lines. Copy or download the result to get all of it.</p>
      )}
    </div>
  );
}
