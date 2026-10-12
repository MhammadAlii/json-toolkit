import { FileLinesIcon } from "@/components/icons/file-lines";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/core/text/format-bytes";

export type LoadedFile = { name: string; type: string; bytes: Uint8Array<ArrayBuffer> };

// Stands in for the editor while a file is being encoded.
export function Base64FileCard({ file, onRemove }: { file: LoadedFile; onRemove: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <FileLinesIcon className="h-8 w-auto text-tint-blue" />
      <p className="max-w-full font-mono text-sm break-all text-heading">{file.name}</p>
      <p className="text-xs text-muted">
        {formatBytes(file.bytes.length)} · {file.type || "unknown type"}
      </p>
      <Button variant="secondary" size="xs" onClick={onRemove}>
        Remove file
      </Button>
    </div>
  );
}
