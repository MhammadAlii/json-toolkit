import { ChevronRightIcon } from "@/components/icons/chevron-right";
import { inputClasses } from "./input-styles";

export type SelectOption = { value: string; label: string };

const compactClasses =
  "rounded-md border border-border bg-background py-1.5 pr-8 pl-3 text-sm text-heading outline-none focus:border-brand/60";

export function Select({
  options,
  size = "md",
  className = "",
  ...props
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & { options: readonly SelectOption[]; size?: "sm" | "md" }) {
  const base = size === "sm" ? compactClasses : `${inputClasses} py-2.5 pr-10`;
  return (
    <div className="relative">
      <select className={`${base} cursor-pointer appearance-none ${className}`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronRightIcon className={`pointer-events-none absolute top-1/2 h-2.5 w-auto -translate-y-1/2 rotate-90 text-muted ${size === "sm" ? "right-3" : "right-4"}`} />
    </div>
  );
}
