import { Card } from "./card";
import { IconTile } from "./icon-tile";

export function FeatureCard({
  icon,
  iconClassName,
  iconSize = "md",
  title,
  headingLevel: Heading = "h3",
  children,
  className = "p-6",
}: {
  icon: React.ReactNode;
  iconClassName?: string;
  iconSize?: "sm" | "md";
  title: string;
  headingLevel?: "h2" | "h3";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`flex flex-col gap-2 ${className}`}>
      <IconTile size={iconSize} className={iconClassName}>
        {icon}
      </IconTile>
      <Heading className={`pt-2 font-bold text-heading ${iconSize === "sm" ? "text-sm leading-5" : "text-base leading-6"}`}>{title}</Heading>
      {children}
    </Card>
  );
}
