export type ButtonVariant = "primary" | "secondary" | "outline" | "subtle" | "chip";
export type ButtonSize = "xs" | "compact" | "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand font-bold text-brand-foreground hover:bg-brand/90",
  secondary: "border border-border bg-surface font-semibold text-heading hover:border-brand/50",
  outline: "border border-border text-muted hover:text-foreground",
  subtle: "bg-border font-semibold text-heading hover:bg-border/70",
  chip: "border border-border bg-surface text-muted hover:border-brand/50 hover:text-foreground",
};

const sizes: Record<ButtonSize, string> = {
  xs: "rounded-md px-2 py-1 text-xs leading-4",
  compact: "rounded-lg px-4 py-2 text-xs leading-4",
  sm: "rounded-lg px-4 py-2 text-sm leading-5",
  md: "rounded-xl px-6 py-3 text-base leading-6",
  lg: "rounded-xl px-8 py-3 text-base leading-6",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}
