"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons/search";
import { Kbd } from "@/components/ui/kbd";
import { matchesQuery } from "@/core/text/matches-query";
import type { ToolCategory } from "@/core/tool/types";
import { useShortcutLabel } from "@/hooks/use-shortcut-label";
import type { SearchItem } from "./search-item";
import { SearchHints } from "./search-hints";
import { SearchResult } from "./search-result";

type Group = { category: ToolCategory; label: string; items: SearchItem[] };

export function SearchPalette({
  items,
  categoryLabels,
}: {
  items: SearchItem[];
  categoryLabels: Record<ToolCategory, string>;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const shortcut = useShortcutLabel();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const groups = useMemo<Group[]>(() => {
    const filtered = items.filter((i) => matchesQuery(`${i.name} ${i.tagline} ${i.keywords.join(" ")}`, query));
    return (Object.keys(categoryLabels) as ToolCategory[])
      .map((category) => ({ category, label: categoryLabels[category], items: filtered.filter((i) => i.category === category) }))
      .filter((g) => g.items.length > 0);
  }, [items, categoryLabels, query]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    const desktop = window.matchMedia("(min-width: 48rem)").matches;
    (desktop ? desktopInputRef : mobileInputRef).current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    mobileInputRef.current?.focus({ preventScroll: true });
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, close]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) close();
        else open();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, open, close]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function select(item: SearchItem | undefined) {
    if (!item) return;
    close();
    desktopInputRef.current?.blur();
    router.push(`/${item.slug}`);
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(flat[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
      desktopInputRef.current?.blur();
      if (e.currentTarget === mobileInputRef.current) mobileTriggerRef.current?.focus();
    }
  }

  const inputProps = {
    type: "text",
    role: "combobox",
    "aria-label": "Search tools",
    "aria-expanded": isOpen,
    "aria-controls": listboxId,
    "aria-activedescendant": isOpen && flat[active] ? `${listboxId}-${active}` : undefined,
    "aria-autocomplete": "list" as const,
    autoComplete: "off",
    spellCheck: false,
    placeholder: "Search tools...",
    value: query,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setActive(0);
      setIsOpen(true);
    },
    onKeyDown: onInputKey,
  };

  let index = -1;

  return (
    <div ref={rootRef} className="relative">
      <label className="relative hidden h-[30px] w-48 items-center md:flex">
        <SearchIcon className="pointer-events-none absolute left-3 size-3 text-muted" />
        <input
          ref={desktopInputRef}
          {...inputProps}
          aria-keyshortcuts="Meta+K Control+K"
          onFocus={() => setIsOpen(true)}
          className="h-full w-full rounded-lg border border-border bg-surface pr-12 pl-9 text-xs text-foreground outline-none transition-colors placeholder:text-secondary hover:border-muted/40 focus:border-brand/60"
        />
        {!query && <Kbd className="pointer-events-none absolute right-3">{shortcut}</Kbd>}
      </label>
      <button
        ref={mobileTriggerRef}
        type="button"
        onClick={() => (isOpen ? close() : open())}
        aria-label="Search tools"
        aria-expanded={isOpen}
        className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-muted md:hidden"
      >
        <SearchIcon className="size-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-[min(343px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
          <div className="border-b border-border bg-background/50 p-4 md:hidden">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand" />
              <input
                ref={mobileInputRef}
                {...inputProps}
                className="w-full rounded-xl border border-border bg-surface py-3 pr-4 pl-10 text-sm leading-5 text-foreground outline-none placeholder:text-muted/60 focus:border-brand/60"
              />
            </div>
          </div>

          <div ref={listRef} id={listboxId} role="listbox" aria-label="Tools" className="max-h-[min(390px,60vh)] overflow-y-auto py-2">
            {groups.map((g, gi) => (
              <div key={g.category} role="group" aria-labelledby={`${listboxId}-g-${g.category}`} className={gi > 0 ? "mt-2 border-t border-border/50 pt-2" : ""}>
                <p id={`${listboxId}-g-${g.category}`} className="px-4 py-2 text-[10px] leading-[15px] font-bold tracking-[1px] text-muted/40 uppercase">
                  {g.label}
                </p>
                {g.items.map((item) => {
                  index += 1;
                  const i = index;
                  return (
                    <SearchResult
                      key={item.slug}
                      item={item}
                      id={`${listboxId}-${i}`}
                      index={i}
                      active={i === active}
                      onHover={() => setActive(i)}
                      onSelect={close}
                    />
                  );
                })}
              </div>
            ))}
            {flat.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-muted">
                No tools match &ldquo;{query}&rdquo;
              </p>
            )}
          </div>

          <SearchHints total={items.length} />
        </div>
      )}
    </div>
  );
}
