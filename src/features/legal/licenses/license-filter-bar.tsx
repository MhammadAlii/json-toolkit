import { SearchIcon } from "@/components/icons/search";
import { Card } from "@/components/ui/card";
import { licenseFamilies, type LicenseFamily } from "./licenses";

export type LicenseFilter = "All" | LicenseFamily;

export function LicenseFilterBar({
  query,
  onQueryChange,
  family,
  onFamilyChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  family: LicenseFilter;
  onFamilyChange: (f: LicenseFilter) => void;
}) {
  return (
    <Card radius="lg" className="flex flex-col gap-2 p-2 xl:flex-row xl:items-center xl:justify-between">
      <label className="flex flex-1 items-center px-4">
        <SearchIcon className="mr-3 size-4 shrink-0 text-subtle" />
        <span className="sr-only">Search packages</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search packages, authors, or licenses..."
          className="w-full bg-transparent pt-[9px] pb-2.5 text-sm text-foreground outline-none placeholder:text-secondary"
        />
      </label>
      <div role="group" aria-label="Filter by license" className="flex flex-wrap gap-1">
        {licenseFamilies.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={family === f}
            onClick={() => onFamilyChange(f)}
            className={`rounded-md px-4 py-2 text-sm leading-5 font-medium transition-colors ${
              family === f ? "bg-brand/10 text-brand" : "text-secondary hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </Card>
  );
}
