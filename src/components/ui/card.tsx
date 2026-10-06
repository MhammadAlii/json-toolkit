const tones = {
  surface: "bg-surface",
  raised: "bg-surface-2",
  inset: "bg-surface-3",
  base: "bg-background",
  faint: "bg-surface/50",
};

type CardProps = {
  as?: "div" | "section" | "article" | "li";
  tone?: keyof typeof tones;
  radius?: "lg" | "xl" | "2xl";
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">;

const radii = { lg: "rounded-lg", xl: "rounded-xl", "2xl": "rounded-2xl" };

export function Card({ as: Tag = "div", tone = "surface", radius = "xl", className = "", children, ...props }: CardProps) {
  return (
    <Tag className={`border border-border ${radii[radius]} ${tones[tone]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
