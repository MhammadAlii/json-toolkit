const sizes = {
  lg: "text-lg leading-8 text-muted sm:text-xl sm:leading-[32.5px]",
  md: "text-lg leading-[29.25px] text-secondary",
  sm: "text-lg leading-7 text-muted",
};

export function Lead({ size = "lg", className = "", children }: { size?: keyof typeof sizes; className?: string; children: React.ReactNode }) {
  return <p className={`${sizes[size]} ${className}`}>{children}</p>;
}
