import { ChevronRightIcon } from "@/components/icons/chevron-right";
import { inputClasses } from "./input-styles";

export type SelectOption = { value: string; label: string };

export function Select({
  options,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly SelectOption[] }) {
  return (
    <div className="relative">
      <select className={`${inputClasses} cursor-pointer appearance-none py-2.5 pr-10 ${className}`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronRightIcon className="pointer-events-none absolute top-1/2 right-4 h-2.5 w-auto -translate-y-1/2 rotate-90 text-muted" />
    </div>
  );
}
