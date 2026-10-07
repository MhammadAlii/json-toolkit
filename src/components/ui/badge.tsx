const tones = {
  brand: "border-brand/20 bg-brand/10 text-brand",
  success: "border-success/20 bg-success/10 text-success",
};

export function Badge({ tone = "brand", icon, children }: { tone?: keyof typeof tones; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] leading-[15px] font-bold tracking-[1px] uppercase ${tones[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
