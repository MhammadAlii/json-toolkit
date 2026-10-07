const tones = {
  brand: "border-brand/20 bg-brand/10 text-brand",
  success: "border-success/20 bg-success/10 text-success",
};

const sizes = {
  pill: "gap-2 rounded-full px-3 py-1 text-[10px] leading-[15px] font-bold tracking-[1px] uppercase",
  note: "gap-2 rounded-lg px-3 py-1.5 text-xs leading-4 font-medium",
};

export function Badge({
  tone = "brand",
  size = "pill",
  icon,
  children,
}: {
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center border ${sizes[size]} ${tones[tone]}`}>
      {icon}
      {children}
    </span>
  );
}
