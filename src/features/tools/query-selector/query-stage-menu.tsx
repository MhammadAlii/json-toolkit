"use client";

import { Popover } from "@/components/ui/popover";
import { stageInfo, type StageKind } from "./query-selector";

export function QueryStageMenu({
  onAdd,
  trigger,
}: {
  onAdd: (kind: StageKind) => void;
  trigger: (props: { open: boolean; toggle: () => void; id: string }) => React.ReactNode;
}) {
  return (
    <Popover label="Add a stage" align="start" trigger={trigger}>
      {({ close }) => (
        <ul className="flex flex-col gap-1">
        {(Object.keys(stageInfo) as StageKind[]).map((kind) => (
          <li key={kind}>
            <button
              type="button"
              onClick={() => {
                onAdd(kind);
                close();
              }}
              className="flex w-full flex-col items-start rounded-md px-2.5 py-2 text-left hover:bg-border/40"
            >
              <span className="text-[11px] font-bold tracking-[0.6px] text-brand">{stageInfo[kind].label}</span>
              <span className="text-xs text-muted">{stageInfo[kind].hint}</span>
            </button>
          </li>
        ))}
        </ul>
      )}
    </Popover>
  );
}
