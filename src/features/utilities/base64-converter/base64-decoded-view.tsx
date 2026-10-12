import { JsonCodeView } from "@/components/json/json-code-view";
import { formatBytes } from "@/core/text/format-bytes";
import { hexDump, type Content } from "./base64";

// The decoded bytes shown the best way for what they are: formatted JSON, text, an image preview or a hex dump.
export function Base64DecodedView({ content, bytes, imageUrl }: { content: Content; bytes: Uint8Array; imageUrl?: string }) {
  if (content.kind === "json") return <JsonCodeView text={content.text} />;
  if (content.kind === "text") return <pre className="p-4 font-mono text-sm leading-5 break-all whitespace-pre-wrap text-heading">{content.text}</pre>;
  if (content.kind === "image")
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element -- a local data: URI, which next/image can't optimise */}
        <img src={imageUrl} alt="Decoded image" className="max-h-[80%] max-w-full rounded-lg border border-border object-contain" />
        <p className="text-xs text-muted">
          {content.mime} · {formatBytes(bytes.length)}
        </p>
      </div>
    );
  return (
    <div>
      <p className="border-b border-border px-4 py-3 text-xs text-muted">
        {content.label} · {formatBytes(bytes.length)}. Download it to open the file{bytes.length > 1024 ? "; the preview shows the first 1 KB" : ""}.
      </p>
      <pre className="p-4 font-mono text-xs leading-5 whitespace-pre text-muted/90">{hexDump(bytes)}</pre>
    </div>
  );
}
