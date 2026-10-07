"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { matchesQuery } from "@/core/text/matches-query";
import { useUrlHash } from "@/hooks/use-url-hash";
import { LicenseCard } from "./license-card";
import { LicenseDetail } from "./license-detail";
import { LicenseFilterBar, type LicenseFilter } from "./license-filter-bar";
import type { Credit } from "./licenses";

export function LicenseExplorer({ credits }: { credits: Credit[] }) {
  const [hash, setHash] = useUrlHash();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<LicenseFilter>("All");

  const filtered = useMemo(() => {
    return credits.filter((c) => (family === "All" || c.family === family) && matchesQuery(`${c.name} ${c.license} ${c.copyright}`, query));
  }, [credits, query, family]);

  const selected = credits.find((c) => c.id === hash) ?? credits[0];

  return (
    <div className="flex flex-col items-start gap-10 lg:flex-row">
      <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
        <LicenseFilterBar query={query} onQueryChange={setQuery} family={family} onFamilyChange={setFamily} />
        {filtered.length === 0 ? (
          <Card className="border-dashed p-10 text-center text-sm text-muted">No packages match.</Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((c) => (
              <li key={c.id}>
                <LicenseCard credit={c} selected={c.id === selected.id} onSelect={() => setHash(c.id)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <LicenseDetail credit={selected} />
    </div>
  );
}
