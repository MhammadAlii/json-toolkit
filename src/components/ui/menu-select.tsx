import { ChevronRightIcon } from "@/components/icons/chevron-right";
import { menuFieldClasses } from "./input-styles";

const sizes = {
  sm: { select: `${menuFieldClasses} pr-7`, icon: "right-2.5 h-2" },
  md: {
    select:
      "rounded-lg border border-border bg-background py-2 pr-9 pl-3 text-sm text-heading outline-none focus:border-brand/60",
    icon: "right-3 h-2.5",
  },
};

/** A native select with its own chevron, so the arrow keeps a consistent inset from the edge. */
export function MenuSelect({
  size = "sm",
  children,
  ...props
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size" | "className"> & {
  size?: keyof typeof sizes;
}) {
  return (
    <div className={`relative ${size === "sm" ? "w-full" : ""}`}>
      <select
        className={`${sizes[size].select} cursor-pointer appearance-none`}
        {...props}
      >
        {children}
      </select>
      <ChevronRightIcon
        className={`pointer-events-none absolute top-1/2 w-auto -translate-y-1/2 rotate-90 text-muted ${sizes[size].icon}`}
      />
    </div>
  );
}
