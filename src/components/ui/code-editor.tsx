"use client";

import { useLayoutEffect, useRef } from "react";
import { LineGutter } from "./line-gutter";

type CodeEditorProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  /** 1-based line to mark, e.g. where a parse error is. */
  highlightLine?: number;
  ref?: React.Ref<HTMLTextAreaElement>;
};

// Matches the textarea's p-4 and leading-5, so the band lines up with the text.
const padTop = 16;
const lineHeight = 20;

export function CodeEditor({ value, onChange, highlightLine, className = "", ...props }: CodeEditorProps) {
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
          className="pointer-events-none absolute inset-x-0 top-0 border-l-2 border-danger bg-danger/10"
        />
      )}
      <LineGutter ref={gutter} count={value.split("\n").length} highlight={highlightLine} />
      <textarea
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
          if (band.current) band.current.style.transform = top(e.currentTarget.scrollTop);
          props.onScroll?.(e);
        }}
        wrap="off"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`relative h-full min-w-0 flex-1 resize-none overflow-auto bg-transparent p-4 font-mono text-sm leading-5 whitespace-pre outline-none ${className}`}
      />
    </div>
  );
}
