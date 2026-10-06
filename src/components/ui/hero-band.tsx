export function HeroBand({
  children,
  className = "py-12 sm:py-16",
  innerClassName = "",
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section className={`border-b border-border bg-surface ${className}`}>
      <div className={`container-page ${innerClassName}`}>{children}</div>
    </section>
  );
}
