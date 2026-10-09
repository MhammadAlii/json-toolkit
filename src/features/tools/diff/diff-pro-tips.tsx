import { KeyboardIcon } from "@/components/icons/keyboard";
import { LightbulbIcon } from "@/components/icons/lightbulb";
import { Card } from "@/components/ui/card";
import { Kbd } from "@/components/ui/kbd";

export function DiffProTips() {
  return (
    <Card as="section" tone="surface" className="flex flex-col gap-4 p-5" aria-label="Pro tips">
      <h3 className="text-xs leading-4 font-bold tracking-[0.6px] text-heading uppercase">Pro Tips</h3>
      <ul className="flex flex-col gap-3 text-xs leading-[17px] text-muted">
        <li className="flex gap-2.5">
          <KeyboardIcon className="mt-0.5 h-[11px] w-auto shrink-0 text-brand" />
          <span>
            Use <Kbd tone="solid">Cmd + \</Kbd> to swap A and B inputs instantly and <Kbd tone="solid">n</Kbd> / <Kbd tone="solid">p</Kbd> to jump between
            changes.
          </span>
        </li>
        <li className="flex gap-2.5">
          <LightbulbIcon className="mt-0.5 h-[11px] w-auto shrink-0 text-brand" />
          <span>Hover a changed line to see its JSON path, or drop a file onto either input to load it.</span>
        </li>
      </ul>
    </Card>
  );
}
