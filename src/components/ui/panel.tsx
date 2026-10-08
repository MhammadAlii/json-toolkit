export function Panel({
  header,
  actions,
  className = "",
  bodyClassName = "",
  bodyStyle,
  children,
}: {
  header: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  bodyStyle?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ${className}`}
    >
      <div className="flex min-h-[41px] flex-wrap items-center justify-between gap-2 border-b border-border bg-background/50 px-4 py-2">
        {header}
        {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
      </div>
      <div className={`min-h-0 flex-1 overflow-auto bg-code-bg ${bodyClassName}`} style={bodyStyle}>
        {children}
      </div>
    </section>
  );
}
