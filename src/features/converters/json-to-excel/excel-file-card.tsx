import { FileLinesIcon } from "@/components/icons/file-lines";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/core/text/format-bytes";

export type LoadedWorkbook = { name: string; size: number };

// Stands in for the editor: the loaded workbook, or how to load one.
export function ExcelFileCard({ file, sheets, onChoose, onRemove }: { file: LoadedWorkbook | null; sheets?: number; onChoose: () => void; onRemove: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <FileLinesIcon className="h-8 w-auto text-tint-blue" />
      {file ? (
        <>
          <p className="max-w-full font-mono text-sm break-all text-heading">{file.name}</p>
          <p className="text-xs text-muted">
            {formatBytes(file.size)}
            {sheets !== undefined && ` · ${sheets.toLocaleString()} ${sheets === 1 ? "sheet" : "sheets"}`}
          </p>
          <Button variant="secondary" size="xs" onClick={onRemove}>
            Remove file
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-heading">Drop an Excel workbook (.xlsx) here</p>
          <p className="text-xs text-muted">It&apos;s read in your browser and never uploaded.</p>
          <Button variant="secondary" size="xs" onClick={onChoose}>
            Choose a file
          </Button>
        </>
      )}
    </div>
  );
}
