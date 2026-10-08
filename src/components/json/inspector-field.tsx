export function InspectorField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <span className="text-[10px] leading-[15px] font-bold tracking-[0.6px] text-subtle uppercase">{label}</span>
      {children}
    </div>
  );
}
