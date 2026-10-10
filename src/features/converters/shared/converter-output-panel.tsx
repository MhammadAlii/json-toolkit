"use client";

import { DownloadIcon } from "@/components/icons/download";
import { toolPanelHeight } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { CopyIconButton } from "@/components/ui/copy-icon-button";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import { useDownload } from "@/hooks/use-download";

// The output half of every converter: title, tool-specific options, copy and download, then the result
// or why there isn't one.
export function ConverterOutputPanel({
  title,
  output,
  error,
  filename,
  mime,
  options,
  header,
  children,
}: {
  title: string;
  output: string;
  error?: string;
  filename: string;
  mime: string;
  /** Usually the converter's options menu. */
  options?: React.ReactNode;
  /** Replaces the plain title, e.g. with view tabs. */
  header?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const download = useDownload();
  return (
    <Panel
      className={toolPanelHeight}
      header={header ?? <PanelTitle>{title}</PanelTitle>}
      actions={
        <>
          {options}
          {options && <span aria-hidden className="mx-1 h-4 w-px bg-border" />}
          <CopyIconButton text={output} label={`Copy ${title.toLowerCase()}`} />
          <Button variant="soft" size="tiny" onClick={() => download(output, filename, mime)} disabled={!output} aria-label={`Download ${filename}`}>
            <DownloadIcon className="size-[11px]" />
          </Button>
        </>
      }
    >
      {error ? (
        <div role="alert" className="flex flex-col items-start gap-3 p-4">
          <p className="text-sm leading-5 text-danger">{error}</p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/json-validator" variant="secondary" size="xs">
              Explain in Validator
            </ButtonLink>
            <ButtonLink href="/json-repair" variant="secondary" size="xs">
              Fix in Repair
            </ButtonLink>
          </div>
        </div>
      ) : (
        children
      )}
    </Panel>
  );
}
