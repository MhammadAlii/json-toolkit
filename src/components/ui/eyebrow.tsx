export function Eyebrow({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-mono text-xs leading-4 font-bold tracking-[1.2px] text-brand uppercase">
      {icon ?? <span aria-hidden className="size-2 rounded-full bg-brand" />}
      {children}
    </p>
  );
}
