import { CodeBracketsIcon } from "@/components/icons/code-brackets";
import { FileLinesIcon } from "@/components/icons/file-lines";
import { FolderTreeIcon } from "@/components/icons/folder-tree";
import { KeyIcon } from "@/components/icons/key";
import { ListOrderedIcon } from "@/components/icons/list-ordered";
import { Card } from "@/components/ui/card";
import type { JsonStats } from "@/core/json/stats";
import { ValidatorStatRow } from "./validator-stat-row";

export function ValidatorStructureCard({ size, stats }: { size: string; stats: JsonStats }) {
  const show = (n: number) => n.toLocaleString();
  return (
    <Card as="section" tone="surface" aria-label="Structure overview" className="flex flex-col gap-5 p-6">
      <h2 className="text-xs leading-4 font-bold tracking-[0.6px] text-heading uppercase">Structure Overview</h2>
      <dl>
        <ValidatorStatRow icon={<FileLinesIcon className="h-3.5 w-auto" />} label="File Size" value={size} />
        <ValidatorStatRow icon={<KeyIcon className="h-3.5 w-auto" />} label="Keys Count" value={show(stats.keys)} />
        <ValidatorStatRow
          icon={<FolderTreeIcon className="h-3.5 w-auto" />}
          label="Nesting Depth"
          value={`${stats.depth} ${stats.depth === 1 ? "Level" : "Levels"}`}
        />
        <ValidatorStatRow icon={<ListOrderedIcon className="h-3.5 w-auto" />} label="Arrays" value={show(stats.arrays)} />
        <ValidatorStatRow icon={<CodeBracketsIcon className="h-3.5 w-auto" />} label="Objects" value={show(stats.objects)} />
      </dl>
    </Card>
  );
}
