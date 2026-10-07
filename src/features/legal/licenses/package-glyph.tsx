import { NpmIcon } from "@/components/icons/npm";
import type { Credit } from "./licenses";

export function PackageGlyph({ credit, selected }: { credit: Credit; selected: boolean }) {
  const tone = selected ? "text-tint-red" : "text-secondary";
  if (credit.kind === "font") return <span className={`text-sm font-bold ${tone}`}>Aa</span>;
  return <NpmIcon className={`h-5 w-auto ${tone}`} />;
}
