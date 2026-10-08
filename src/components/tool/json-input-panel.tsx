"use client";

import { TrashIcon } from "@/components/icons/trash";
import { UploadIcon } from "@/components/icons/upload";
import { jsonAccept } from "./workbench-types";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { DropZone } from "@/components/ui/drop-zone";
import { FileButton } from "@/components/ui/file-button";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";

// Editable JSON panel with Load File, Clear and drag-and-drop loading.
export function JsonInputPanel({
  title,
  label,
  value,
  onChange,
  loadLabel = "Load File",
  className = "h-[320px] lg:h-[500px]",
}: {
  title: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  loadLabel?: string;
  className?: string;
}) {
  return (
    <Panel
      className={className}
      header={<PanelTitle>{title}</PanelTitle>}
      actions={
        <>
          <FileButton accept={jsonAccept} onText={onChange} variant="soft" size="tiny">
            <UploadIcon className="h-[11px] w-auto" /> {loadLabel}
          </FileButton>
          <Button variant="soft" size="tiny" onClick={() => onChange("")} disabled={!value}>
            <TrashIcon className="h-[11px] w-auto" /> Clear
          </Button>
        </>
      }
    >
      <DropZone onText={onChange} className="h-full">
        <CodeEditor
          aria-label={label}
          value={value}
          onChange={onChange}
          placeholder="Paste JSON here, or drop a file…"
          className="text-muted/80 placeholder:text-muted/40"
        />
      </DropZone>
    </Panel>
  );
}
