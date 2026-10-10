"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const gap = 8;
const margin = 8;
// Below this much room under the trigger, the panel opens upwards if there's more space there.
const minBelow = 240;

export function Popover({
  trigger,
  label,
  align = "end",
  children,
}: {
  trigger: (props: { open: boolean; toggle: () => void; id: string }) => React.ReactNode;
  label: string;
  align?: "start" | "end";
  /** A function child receives `close`, for menus that should shut after a choice. */
  children: React.ReactNode | ((api: { close: () => void }) => React.ReactNode);
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!root.current?.contains(target) && !panel.current?.contains(target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The panel is portalled to <body> so containers with overflow-hidden (tool panels) can't clip it,
  // and it's placed next to the trigger, flipping upwards and scrolling when space is short.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = root.current?.getBoundingClientRect();
      const el = panel.current;
      if (!anchor || !el) return;
      const below = window.innerHeight - anchor.bottom - gap - margin;
      const above = anchor.top - gap - margin;
      const up = below < minBelow && above > below;
      el.style.maxHeight = `${Math.max(up ? above : below, 120)}px`;
      el.style.top = up ? "" : `${anchor.bottom + gap}px`;
      el.style.bottom = up ? `${window.innerHeight - anchor.top + gap}px` : "";
      const width = el.offsetWidth;
      const left = align === "end" ? anchor.right - width : anchor.left;
      el.style.left = `${Math.min(Math.max(left, margin), window.innerWidth - width - margin)}px`;
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, align]);

  return (
    <span ref={root} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o), id })}
      {open &&
        createPortal(
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-label={label}
            className="fixed z-50 w-64 overflow-auto rounded-xl border border-border bg-surface-2 p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
          >
            {typeof children === "function" ? children({ close: () => setOpen(false) }) : children}
          </div>,
          document.body,
        )}
    </span>
  );
}
