const tones = {
  muted: "bg-border/50 px-1.5 text-muted/50 tracking-[0.05em]",
  solid: "bg-border/60 px-1 font-sans text-foreground",
};

export function Kbd({ tone = "muted", className = "", children }: { tone?: keyof typeof tones; className?: string; children: React.ReactNode }) {
  return <kbd className={`rounded py-0.5 text-[10px] leading-[15px] ${tones[tone]} ${className}`}>{children}</kbd>;
}
