import { BoltIcon } from "@/components/icons/bolt";
import { CircleCheckIcon } from "@/components/icons/circle-check";
import { DatabaseIcon } from "@/components/icons/database";
import { ListOrderedIcon } from "@/components/icons/list-ordered";
import { StatCard } from "@/components/ui/stat-card";

export type FormatterValidity = "valid" | "invalid" | "empty";

type Shown = Exclude<FormatterValidity, "empty">;

const validityLabel: Record<Shown, string> = { valid: "Valid JSON", invalid: "Invalid JSON" };
const validityTint: Record<Shown, string> = {
  valid: "bg-tint-green/20 text-tint-green",
  invalid: "bg-tint-red/20 text-tint-red",
};

export function FormatterStats({ size, lines, validity }: { size: string; lines: number; validity: Shown }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Size" value={size} icon={<DatabaseIcon className="h-4 w-auto" />} iconClassName="bg-brand/20 text-brand" />
      <StatCard label="Lines" value={lines} icon={<ListOrderedIcon className="size-4" />} iconClassName="bg-tint-blue/20 text-tint-blue" />
      <StatCard label="Validity" value={validityLabel[validity]} icon={<CircleCheckIcon className="size-4" />} iconClassName={validityTint[validity]} />
      <StatCard label="Processing" value="Local (Client)" icon={<BoltIcon className="h-4 w-auto" />} iconClassName="bg-tint-orange/20 text-tint-orange" />
    </dl>
  );
}
