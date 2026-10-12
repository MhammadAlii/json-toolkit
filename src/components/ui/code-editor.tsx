"use client";

import { useLayoutEffect, useRef } from "react";
import { LineGutter } from "./line-gutter";

type CodeEditorProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "wrap"> & {
  value: string;
  onChange: (value: string) => void;
  /** 1-based line to mark, e.g. where a parse error is. */
  highlightLine?: number;
  /** `danger` for errors, `brand` for a selected search match. */
  highlightTone?: "danger" | "brand";
  /** Soft-wraps long lines, for single-line text such as tokens; line numbers are hidden since they'd no longer match. */
  wrap?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
};

// Matches the textarea's p-4 and leading-5, so the band lines up with the text.
const padTop = 16;
const lineHeight = 20;

export function CodeEditor({ value, onChange, highlightLine, highlightTone = "danger", wrap = false, className = "", ...props }: CodeEditorProps) {
  const gutter = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const top = (scrollTop: number) => `translateY(${padTop + ((highlightLine ?? 1) - 1) * lineHeight - scrollTop}px)`;

  // The gutter scrolls with the textarea, so its offset places the band without a re-render.
  useLayoutEffect(() => {
    if (band.current) band.current.style.transform = top(gutter.current?.scrollTop ?? 0);
  });

  return (
    <div className="relative flex h-full min-h-0">
      {highlightLine !== undefined && (
        <div
          ref={band}
          aria-hidden
          style={{ height: lineHeight }}
          className={`pointer-events-none absolute inset-x-0 top-0 border-l-2 ${highlightTone === "brand" ? "border-brand bg-brand/10" : "border-danger bg-danger/10"}`}
        />
      )}
      {!wrap && <LineGutter ref={gutter} count={value.split("\n").length} highlight={highlightLine} highlightTone={highlightTone} />}
      <textarea
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
          if (band.current) band.current.style.transform = top(e.currentTarget.scrollTop);
          props.onScroll?.(e);
        }}
        wrap={wrap ? "soft" : "off"}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`relative h-full min-w-0 flex-1 resize-none overflow-auto bg-transparent p-4 font-mono text-sm leading-5 outline-none ${wrap ? "break-all whitespace-pre-wrap" : "whitespace-pre"} ${className}`}
      />
    </div>
  );
}
