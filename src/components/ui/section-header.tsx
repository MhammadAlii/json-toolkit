import { SectionTitle } from "./section-title";
import { Text } from "./text";

export function SectionHeader({
  id,
  title,
  description,
  align = "start",
  className = "",
}: {
  /** For aria-labelledby on the section the header belongs to. */
  id?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${align === "center" ? "items-center text-center" : ""} ${className}`}>
      <SectionTitle id={id}>{title}</SectionTitle>
      {description && <Text variant="caption">{description}</Text>}
    </div>
  );
}
