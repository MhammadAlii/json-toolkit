export type ButtonVariant = "primary" | "secondary" | "outline" | "subtle" | "chip" | "soft" | "accent";
export type ButtonSize = "tiny" | "xs" | "compact" | "sm" | "md" | "lg";

const base = "inline-flex items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand font-bold text-brand-foreground hover:bg-brand/90",
  secondary: "border border-border bg-surface font-semibold text-heading hover:border-brand/50",
  outline: "border border-border text-muted hover:text-foreground",
  subtle: "bg-border font-semibold text-heading hover:bg-border/70",
  chip: "border border-border bg-surface text-muted hover:border-brand/50 hover:text-foreground",
  soft: "bg-border/40 font-semibold text-foreground hover:bg-border/70",
  accent: "bg-brand/20 font-semibold text-brand hover:bg-brand/30",
};

const sizes: Record<ButtonSize, string> = {
  tiny: "gap-1.5 rounded px-2.5 py-1 text-[11px] leading-[16.5px]",
  xs: "gap-2 rounded-md px-2 py-1 text-xs leading-4",
  compact: "gap-2 rounded-lg px-4 py-2 text-xs leading-4",
  sm: "gap-2 rounded-lg px-4 py-2 text-sm leading-5",
  md: "gap-2 rounded-xl px-6 py-3 text-base leading-6",
  lg: "gap-2 rounded-xl px-8 py-3 text-base leading-6",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className = "",
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}
