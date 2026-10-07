import { Card } from "./card";
import { IconTile } from "./icon-tile";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  icon?: React.ReactNode;
  iconClassName?: string;
  className?: string;
};

// Renders dt/dd, so place it inside a <dl>.
export function StatCard({ label, value, highlight = false, icon, iconClassName, className = "" }: StatCardProps) {
  if (icon) {
    return (
      <Card tone="faint" className={`flex items-center gap-4 p-4 ${className}`}>
        <IconTile className={iconClassName}>{icon}</IconTile>
        <div className="flex min-w-0 flex-col-reverse">
          <dt className="text-xs leading-4 text-secondary uppercase">{label}</dt>
          <dd className="truncate text-lg leading-7 font-bold text-heading">{value}</dd>
        </div>
      </Card>
    );
  }
  return (
    <Card tone="base" className={`flex w-40 flex-col-reverse gap-1 p-6 ${className}`}>
      <dt className="font-mono text-xs leading-4 tracking-[-0.3px] text-subtle uppercase">{label}</dt>
      <dd className={`text-3xl leading-9 font-bold ${highlight ? "text-brand" : "text-foreground"}`}>{value}</dd>
    </Card>
  );
}
