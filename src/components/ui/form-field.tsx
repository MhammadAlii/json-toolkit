export function FormField({
  label,
  htmlFor,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-[10.5px] pt-[5.5px] ${className}`}>
      <label htmlFor={htmlFor} className="text-xs leading-4 font-bold tracking-[0.6px] text-muted uppercase">
        {label} {hint && <span className="text-[10px] normal-case opacity-50">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
