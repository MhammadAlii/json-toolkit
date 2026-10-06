import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons/chevron-right";
import { ToolGlyph } from "@/components/tool/tool-glyph";
import type { SearchItem } from "./search-item";

export function SearchResult({
  item,
  id,
  index,
  active,
  onHover,
  onSelect,
}: {
  item: SearchItem;
  id: string;
  index: number;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <Link
      id={id}
      data-index={index}
      role="option"
      aria-selected={active}
      href={`/${item.slug}`}
      tabIndex={-1}
      onClick={onSelect}
      onMouseMove={onHover}
      className={`flex items-center gap-3 border-l-2 px-4 py-3 ${active ? "border-brand bg-brand/5" : "border-transparent"}`}
    >
      <ToolGlyph icon={item.icon} tint={item.tint} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-5 font-semibold text-foreground">{item.name}</span>
        <span className="block truncate text-[10px] leading-[15px] text-muted">{item.tagline}</span>
      </span>
      {active && <ChevronRightIcon className="h-3 w-auto text-muted/30" />}
    </Link>
  );
}
