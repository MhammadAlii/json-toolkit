import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { CircleCheckIcon } from "@/components/icons/circle-check";
import { CodeIcon } from "@/components/icons/code";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { WrenchIcon } from "@/components/icons/wrench";
import { Button } from "@/components/ui/button";
import type { Validation } from "./validator";

export function ValidatorResultCard({ validation, canRepair, onJump, onRepair }: { validation: Validation; canRepair: boolean; onJump: () => void; onRepair: () => void }) {
  if (validation.status === "empty") {
    return (
      <section aria-label="Validation result" className="flex items-center gap-5 rounded-xl border border-border bg-surface p-6 sm:p-8">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-border/40 text-muted">
          <CodeIcon className="h-6 w-auto" />
        </span>
        <div>
          <h2 className="text-xl leading-7 font-bold text-heading">Waiting for JSON</h2>
          <p className="text-sm leading-6 text-muted">Paste JSON or load a file. It&apos;s checked as you type.</p>
        </div>
      </section>
    );
  }
  if (validation.status === "valid") {
    return (
      <section aria-label="Validation result" aria-live="polite" className="flex items-center gap-5 rounded-xl border border-success/30 bg-success/5 p-6 sm:p-8">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
          <CircleCheckIcon className="h-6 w-auto" />
        </span>
        <div>
          <h2 className="text-xl leading-7 font-bold text-heading">Valid JSON</h2>
          <p className="text-sm leading-6 text-muted">Your JSON is valid and follows the RFC 8259 standard.</p>
        </div>
      </section>
    );
  }
  const { error, explanation } = validation;
  return (
    <section aria-label="Validation result" aria-live="polite" className="flex flex-col gap-5 rounded-xl border border-danger/30 bg-danger/5 p-6 sm:flex-row sm:p-8">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-danger/15 text-danger">
        <ShieldAlertIcon className="h-6 w-auto" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl leading-7 font-bold text-heading">Invalid JSON</h2>
          <span className="rounded-md bg-danger/10 px-2 py-1 font-mono text-[11px] leading-4 font-semibold text-danger">Error Code: {error.code}</span>
        </div>
        <p className="text-lg leading-7 break-words text-heading/90">
          {explanation.lead}
          {explanation.token && <code className="rounded-md bg-surface-3 px-1.5 py-0.5 font-mono text-base text-danger">{explanation.token}</code>}
          {explanation.trail}
        </p>
        {error.code !== "EMPTY_INPUT" && (
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="sm" onClick={onJump}>
              <ArrowRightIcon className="h-3.5 w-auto" /> Jump to Error
            </Button>
            <Button variant="secondary" size="sm" onClick={onRepair} disabled={!canRepair} title={canRepair ? "Fix common mistakes automatically" : "These errors can't be repaired automatically"}>
              <WrenchIcon className="h-3.5 w-auto" /> Auto-Repair
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
