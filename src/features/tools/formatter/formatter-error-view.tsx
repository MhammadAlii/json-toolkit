"use client";

import { useEffect, useRef } from "react";
import { looseFormat } from "@/core/json/loose-format";
import type { LintError } from "@/core/json/lint";
import { explain } from "@/features/tools/validator/validator";

// Lines rendered either side of the error when the formatted text is very long.
const windowSize = 400;

// Shows invalid JSON indented anyway, with the line and character where parsing failed highlighted, so an
// error in a one-line paste is easy to find. The panel scrolls to it whenever it moves.
export function FormatterErrorView({ input, error }: { input: string; error: LintError }) {
  const { text, mark } = looseFormat(input, error.offset);
  const e = explain(error);
  const lines = text.split("\n");
  const errorLine = mark?.line ?? 1;
  const from = lines.length > windowSize * 2 ? Math.max(errorLine - windowSize, 1) : 1;
  const to = lines.length > windowSize * 2 ? Math.min(errorLine + windowSize, lines.length) : lines.length;
  const target = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = target.current;
    const box = row?.closest<HTMLElement>(".overflow-auto");
    if (!row || !box) return;
    // An absolute position (rather than adding to the current one) gives the same result however often it runs.
    const rowInBox = row.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    box.scrollTop = rowInBox - box.clientHeight / 2;
  }, [errorLine, text]);

  return (
    <div className="flex min-h-full flex-col">
      <div role="alert" className="sticky top-0 z-10 flex flex-col gap-1 border-b border-danger/30 bg-danger/10 px-4 py-3 backdrop-blur">
        <p className="text-sm leading-5 font-semibold text-danger">
          {e.lead}
          {e.token && <code className="rounded bg-danger/15 px-1 font-mono">{e.token}</code>}
          {e.trail}
        </p>
        <p className="text-xs leading-5 text-muted">
          {e.what} It&apos;s highlighted below on line {errorLine} of the formatted view.
        </p>
      </div>
      <pre className="min-w-max flex-1 py-4 font-mono text-sm leading-5 text-muted/90">
        {from > 1 && <div className="px-4 pb-2 text-xs text-muted/60">… {from - 1} lines above</div>}
        {lines.slice(from - 1, to).map((line, i) => {
          const n = from + i;
          const isError = n === errorLine;
          const col = (mark?.column ?? 1) - 1;
          return (
            <div key={n} ref={isError ? target : undefined} className={`flex ${isError ? "bg-danger/10 shadow-[inset_2px_0_0_var(--color-danger)]" : ""}`}>
              <span aria-hidden className={`w-14 shrink-0 pr-3 text-right select-none ${isError ? "font-semibold text-danger" : "text-muted/40"}`}>
                {n}
              </span>
              <span className="pr-4 whitespace-pre">
                {isError ? (
                  <>
                    {line.slice(0, col)}
                    <span className="rounded-sm bg-danger/25 text-danger underline decoration-danger decoration-wavy underline-offset-4">
                      {line[col] ?? " "}
                    </span>
                    {line.slice(col + 1)}
                  </>
                ) : (
                  line || " "
                )}
              </span>
            </div>
          );
        })}
        {to < lines.length && <div className="px-4 pt-2 text-xs text-muted/60">… {lines.length - to} lines below</div>}
      </pre>
    </div>
  );
}
