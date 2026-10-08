export function DiffCount({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={`size-2 rounded-full ${tone}`} />
      {label}
    </span>
  );
}
