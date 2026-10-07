const sizes = {
  lg: "text-2xl leading-8",
  md: "text-xl leading-7",
  sm: "text-sm leading-5",
};

export function SectionTitle({
  as: Tag = "h2",
  size = "lg",
  id,
  className = "",
  children,
}: {
  as?: "h2" | "h3";
  size?: keyof typeof sizes;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag id={id} className={`${sizes[size]} font-bold text-heading ${className}`}>
      {children}
    </Tag>
  );
}
