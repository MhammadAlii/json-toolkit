const sizes = {
  lg: "text-4xl leading-tight sm:text-5xl sm:leading-[48px]",
  md: "text-3xl leading-10 sm:text-4xl",
  display: "text-4xl leading-tight sm:text-5xl sm:leading-[60px]",
};

export function PageTitle({
  size = "lg",
  weight = "bold",
  className = "",
  children,
}: {
  size?: keyof typeof sizes;
  weight?: "bold" | "extrabold";
  className?: string;
  children: React.ReactNode;
}) {
  return <h1 className={`${sizes[size]} ${weight === "bold" ? "font-bold" : "font-extrabold"} text-foreground ${className}`}>{children}</h1>;
}
