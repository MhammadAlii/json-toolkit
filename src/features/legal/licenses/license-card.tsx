import { CertificateIcon } from "@/components/icons/certificate";
import { GithubIcon } from "@/components/icons/github";
import { IconTile } from "@/components/ui/icon-tile";
import type { Credit } from "./licenses";
import { PackageGlyph } from "./package-glyph";

export function LicenseCard({ credit, selected, onSelect }: { credit: Credit; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex w-full flex-col gap-4 rounded-xl p-5 text-left transition-colors ${
        selected ? "border-2 border-brand bg-surface-2 p-[19px]" : "border border-border bg-surface hover:border-brand/40"
      }`}
    >
      {selected && (
        <span className="absolute top-4 right-4 rounded bg-brand px-2 py-px font-mono text-[10px] leading-[15px] text-brand-foreground uppercase">
          Selected
        </span>
      )}
      <span className="flex items-start gap-4">
        <IconTile className={`border border-border ${selected ? "bg-surface" : "bg-surface-2"}`}>
          <PackageGlyph credit={credit} selected={selected} />
        </IconTile>
        <span className={`min-w-0 ${selected ? "pr-16" : ""}`}>
          <span className="block truncate text-lg leading-7 font-bold text-foreground">{credit.name}</span>
          <span className="block font-mono text-sm leading-5 text-subtle">{credit.version}</span>
        </span>
      </span>
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm leading-5 text-secondary">
          <CertificateIcon className={`size-3.5 ${selected ? "text-brand" : "text-subtle"}`} />
          {credit.license}
        </span>
        <GithubIcon className="size-3.5 text-subtle" />
      </span>
    </button>
  );
}
