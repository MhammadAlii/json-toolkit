"use client";

import { TrashIcon } from "@/components/icons/trash";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { DropZone } from "@/components/ui/drop-zone";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";

// Same panel height as the home page formatter.
export const toolPanelHeight = "h-[360px] lg:h-[600px]";

// Editable JSON panel styled like the home formatter's input; files can be dropped onto it.
export function JsonInputPanel({
  title,
  label,
  value,
  onChange,
  extraActions,
  placeholder = "Paste your JSON here…",
  wrap,
  onFile,
  content,
  className = toolPanelHeight,
}: {
  title: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Tool-specific buttons shown before Clear, e.g. Format or a template picker. */
  extraActions?: React.ReactNode;
  placeholder?: string;
  /** Soft-wraps long lines instead of scrolling sideways. */
  wrap?: boolean;
  /** Receives dropped files instead of their text being pasted in, e.g. to read binary files. */
  onFile?: (file: File) => void;
  /** Shown in place of the editor, e.g. a card for a loaded file. */
  content?: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel
      className={className}
      header={<PanelTitle>{title}</PanelTitle>}
      actions={
        <>
          {extraActions}
          <Button variant="soft" size="tiny" onClick={() => onChange("")} disabled={!value && !content}>
            <TrashIcon className="h-[11px] w-auto" /> Clear
          </Button>
        </>
      }
    >
      <DropZone onText={onChange} onFile={onFile} label={onFile ? "Drop a file" : undefined} className="h-full">
        {content ?? (
          <CodeEditor aria-label={label} value={value} onChange={onChange} placeholder={placeholder} wrap={wrap} className="text-muted/80 placeholder:text-muted/40" />
        )}
      </DropZone>
    </Panel>
  );
}
