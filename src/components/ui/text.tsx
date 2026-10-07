const variants = {
  body: "text-base leading-[26px] text-muted",
  small: "text-sm leading-[22.75px] text-muted",
  caption: "text-base leading-6 text-muted",
};

export function Text({
  variant = "body",
  className = "",
  children,
}: {
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
}) {
  return <p className={`${variants[variant]} ${className}`}>{children}</p>;
}
