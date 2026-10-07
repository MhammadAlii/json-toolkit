import { SectionTitle } from "./section-title";
import { Text } from "./text";

export function SectionHeader({
  title,
  description,
  align = "start",
  className = "",
}: {
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${align === "center" ? "items-center text-center" : ""} ${className}`}>
      <SectionTitle>{title}</SectionTitle>
      {description && <Text variant="caption">{description}</Text>}
    </div>
  );
}
