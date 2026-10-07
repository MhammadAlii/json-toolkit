import { BoltIcon } from "@/components/icons/bolt";
import { CircleCheckIcon } from "@/components/icons/circle-check";
import { DatabaseIcon } from "@/components/icons/database";
import { ListOrderedIcon } from "@/components/icons/list-ordered";
import { StatCard } from "@/components/ui/stat-card";

export type FormatterValidity = "valid" | "invalid" | "empty";

const validityLabel: Record<FormatterValidity, string> = { valid: "Valid JSON", invalid: "Invalid JSON", empty: "No input" };
const validityTint: Record<FormatterValidity, string> = {
  valid: "bg-tint-green/20 text-tint-green",
  invalid: "bg-tint-red/20 text-tint-red",
  empty: "bg-border/40 text-muted",
};

export function FormatterStats({ size, lines, validity }: { size: string; lines: number; validity: FormatterValidity }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Size" value={size} icon={<DatabaseIcon className="h-4 w-auto" />} iconClassName="bg-brand/20 text-brand" />
      <StatCard label="Lines" value={lines} icon={<ListOrderedIcon className="size-4" />} iconClassName="bg-tint-blue/20 text-tint-blue" />
      <StatCard label="Validity" value={validityLabel[validity]} icon={<CircleCheckIcon className="size-4" />} iconClassName={validityTint[validity]} />
      <StatCard label="Processing" value="Local (Client)" icon={<BoltIcon className="h-4 w-auto" />} iconClassName="bg-tint-orange/20 text-tint-orange" />
    </dl>
  );
}
