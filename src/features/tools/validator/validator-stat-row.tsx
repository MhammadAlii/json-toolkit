export function ValidatorStatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 last:border-b-0">
      <dt className="flex items-center gap-2 text-sm leading-5 text-muted">
        <span aria-hidden className="flex w-4 justify-center text-brand">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="font-mono text-sm leading-5 font-semibold text-heading">{value}</dd>
    </div>
  );
}
