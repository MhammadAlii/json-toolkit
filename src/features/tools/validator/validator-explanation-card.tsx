import { CircleCheckIcon } from "@/components/icons/circle-check";
import { LightbulbIcon } from "@/components/icons/lightbulb";
import { Card } from "@/components/ui/card";
import type { LintError } from "@/core/json/lint";
import { excerpt, type Explanation } from "./validator";
import { ValidatorExcerpt } from "./validator-excerpt";

export function ValidatorExplanationCard({ text, error, explanation }: { text: string; error: LintError; explanation: Explanation }) {
  return (
    <Card as="section" tone="surface" aria-label="What happened" className="flex flex-col gap-6 p-6 sm:p-8">
      <h3 className="flex items-center gap-2 text-lg leading-7 font-bold text-heading">
        <LightbulbIcon className="h-4 w-auto text-tint-amber" /> What happened?
      </h3>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="text-[15px] leading-[23px] text-muted">{explanation.what}</p>
          {error.code !== "EMPTY_INPUT" && <ValidatorExcerpt lines={excerpt(text, error.line)} errorLine={error.line} column={error.column} />}
        </div>
        <div className="rounded-lg border border-border bg-surface-3 p-5">
          <h4 className="pb-3 text-[10px] leading-[15px] font-bold tracking-[0.6px] text-muted uppercase">What you can try:</h4>
          <ul className="flex flex-col gap-3">
            {explanation.tips.map((tip) => (
              <li key={tip} className="flex gap-3 text-sm leading-5 text-heading">
                <CircleCheckIcon className="mt-[3px] h-3.5 w-auto shrink-0 text-success" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
