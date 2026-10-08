export function DiffGapRow({ count, onExpand }: { count: number; onExpand: () => void }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="block w-full border-b border-border/40 bg-surface-3/60 py-1.5 pl-16 text-left text-xs text-brand hover:bg-border/30"
    >
      Show {count} unchanged lines
    </button>
  );
}
