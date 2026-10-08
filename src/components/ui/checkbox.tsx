import { CheckDoubleIcon } from "@/components/icons/check-double";

export function Checkbox({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm leading-5 text-heading select-none">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="flex size-4 items-center justify-center rounded border border-border bg-background text-brand transition-colors peer-checked:border-brand/60 peer-checked:bg-brand/15 peer-focus-visible:ring-2 peer-focus-visible:ring-brand/50"
      >
        {checked && <CheckDoubleIcon className="h-2.5 w-auto" />}
      </span>
      {label}
    </label>
  );
}
