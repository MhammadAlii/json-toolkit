import { CheckDoubleIcon } from "@/components/icons/check-double";

export function Checkbox({
  label,
  checked,
  onChange,
  id,
  size = "md",
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  /** `sm` fits in panel headers next to tiny buttons. */
  size?: "sm" | "md";
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center select-none ${size === "sm" ? "gap-1.5 text-[11px] leading-4 font-semibold text-muted has-checked:text-heading" : "gap-2 text-sm leading-5 text-heading"}`}
    >
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className={`flex ${size === "sm" ? "size-3.5" : "size-4"} items-center justify-center rounded border border-border bg-background text-brand transition-colors peer-checked:border-brand/60 peer-checked:bg-brand/15 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/50`}
      >
        {checked && <CheckDoubleIcon className="h-2.5 w-auto" />}
      </span>
      {label}
    </label>
  );
}
