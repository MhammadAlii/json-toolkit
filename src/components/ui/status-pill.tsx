const tones = {
  muted: { dot: "bg-muted/50", text: "text-muted" },
  success: { dot: "bg-success", text: "text-success" },
  danger: { dot: "bg-danger", text: "text-danger" },
  warning: { dot: "bg-tint-amber", text: "text-tint-amber" },
};

/** Live status shown in a tool's top bar, e.g. "Valid JSON" or "Invalid JSON · line 9". */
export function StatusPill({ tone, children }: { tone: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span role="status" className={`inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold ${tones[tone].text}`}>
      <span aria-hidden className={`size-2 rounded-full ${tones[tone].dot}`} />
      {children}
    </span>
  );
}
