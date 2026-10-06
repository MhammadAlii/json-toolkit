import type { WorkbenchOption } from "./workbench-types";

export function WorkbenchOptionControl({
  option,
  value,
  id,
  onChange,
}: {
  option: WorkbenchOption;
  value: string | boolean;
  id: string;
  onChange: (v: string | boolean) => void;
}) {
  if (option.kind === "checkbox") {
    return (
      <label htmlFor={id} className="flex items-center gap-2 text-sm">
        <input id={id} type="checkbox" checked={value as boolean} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-brand" />
        {option.label}
      </label>
    );
  }
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <span className="text-muted">{option.label}</span>
      {option.kind === "select" ? (
        <select id={id} value={value as string} onChange={(e) => onChange(e.target.value)} className="field">
          {option.choices.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} type="text" value={value as string} onChange={(e) => onChange(e.target.value)} className="field w-32" />
      )}
    </label>
  );
}
