const sizes = {
  sm: "size-8 rounded-lg",
  md: "size-10 rounded-lg",
  lg: "size-12 rounded-xl",
};

export function IconTile({
  size = "md",
  round = false,
  className = "bg-brand/10 text-brand",
  children,
}: {
  size?: keyof typeof sizes;
  round?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={`flex shrink-0 items-center justify-center ${sizes[size]} ${round ? "rounded-full" : ""} ${className}`}>
      {children}
    </span>
  );
}
