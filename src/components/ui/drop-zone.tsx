"use client";

import { useState } from "react";

/** Accepts a dropped file anywhere over its children: its text goes to `onText`, or the file itself to `onFile` when given. */
export function DropZone({
  onText,
  onFile,
  label = "Drop a JSON file",
  className = "",
  children,
}: {
  onText: (text: string, file: File) => void;
  onFile?: (file: File) => void;
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`relative ${className}`}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={async (e) => {
        const file = e.dataTransfer.files[0];
        setOver(false);
        if (!file) return;
        e.preventDefault();
        if (onFile) onFile(file);
        else onText(await file.text(), file);
      }}
    >
      {children}
      {over && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] border-2 border-dashed border-brand/60 bg-brand/10 text-sm font-semibold text-brand">
          {label}
        </div>
      )}
    </div>
  );
}
