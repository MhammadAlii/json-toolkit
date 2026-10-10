import { BoltIcon } from "@/components/icons/bolt";
import { ClockIcon } from "@/components/icons/clock";
import { FolderTreeIcon } from "@/components/icons/folder-tree";
import { SearchIcon } from "@/components/icons/search";
import { StatCard } from "@/components/ui/stat-card";

export function DeepSearchStats({ matches, nodes, ms, depth }: { matches: number; nodes: number; ms: number; depth: number }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Matches" value={matches.toLocaleString()} icon={<SearchIcon className="size-4" />} iconClassName="bg-brand/20 text-brand" />
      <StatCard label="Nodes Scanned" value={nodes.toLocaleString()} icon={<FolderTreeIcon className="h-4 w-auto" />} iconClassName="bg-tint-blue/20 text-tint-blue" />
      <StatCard label="Search Time" value={ms < 0.1 ? "<0.1ms" : `${ms < 10 ? ms.toFixed(1) : Math.round(ms)}ms`} icon={<ClockIcon className="size-4" />} iconClassName="bg-tint-green/20 text-tint-green" />
      <StatCard label="Max Depth" value={depth} icon={<BoltIcon className="h-4 w-auto" />} iconClassName="bg-tint-orange/20 text-tint-orange" />
    </dl>
  );
}
