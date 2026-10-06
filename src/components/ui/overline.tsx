export function Overline({ as: Tag = "h3", className = "", children }: { as?: "h2" | "h3" | "p"; className?: string; children: React.ReactNode }) {
  return <Tag className={`text-xs leading-4 font-bold tracking-[1.2px] text-brand uppercase ${className}`}>{children}</Tag>;
}
