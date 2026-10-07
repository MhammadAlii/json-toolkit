const tones = {
  danger: { box: "border-tint-red/20 bg-tint-red/5", accent: "text-tint-red" },
};

export function Callout({
  tone = "danger",
  icon,
  title,
  children,
}: {
  tone?: keyof typeof tones;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const t = tones[tone];
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${t.box}`}>
      <span className={`mt-1 shrink-0 ${t.accent}`}>{icon}</span>
      <div className="flex flex-col gap-1">
        <p className={`text-xs leading-4 font-bold ${t.accent}`}>{title}</p>
        <div className="text-[11px] leading-[16.5px] text-muted">{children}</div>
      </div>
    </div>
  );
}
