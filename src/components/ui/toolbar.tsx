export function Toolbar({ children, actions, label }: { children: React.ReactNode; actions?: React.ReactNode; label: string }) {
  return (
    <div
      role="toolbar"
      aria-label={label}
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-3 sm:px-4"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">{children}</div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
