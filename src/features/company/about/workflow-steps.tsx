export function WorkflowSteps({ steps, current = 0 }: { steps: string[]; current?: number }) {
  return (
    <ol className="relative flex items-start justify-between sm:px-10">
      <span aria-hidden className="absolute inset-x-0 top-6 h-px bg-border" />
      {steps.map((step, i) => (
        <li key={step} className="relative flex flex-col items-center gap-3">
          <span
            className={`flex size-12 items-center justify-center rounded-full border-2 bg-background text-base leading-6 font-bold ${
              i === current ? "border-brand text-brand drop-shadow-[0_0_7.5px_rgba(124,92,255,0.3)]" : "border-border text-muted"
            }`}
          >
            {i + 1}
          </span>
          <span className="text-[10px] leading-4 font-bold tracking-[0.6px] text-muted uppercase sm:text-xs">{step}</span>
        </li>
      ))}
    </ol>
  );
}
