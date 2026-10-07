"use client";

import { useRef } from "react";
import { LineGutter } from "./line-gutter";

type CodeEditorProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export function CodeEditor({ value, onChange, className = "", ...props }: CodeEditorProps) {
  const gutter = useRef<HTMLDivElement>(null);
  return (
    <div className="flex h-full min-h-0">
      <LineGutter ref={gutter} count={value.split("\n").length} />
      <textarea
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
        }}
        wrap="off"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`h-full min-w-0 flex-1 resize-none overflow-auto bg-transparent p-4 font-mono text-sm leading-5 whitespace-pre outline-none ${className}`}
      />
    </div>
  );
}
