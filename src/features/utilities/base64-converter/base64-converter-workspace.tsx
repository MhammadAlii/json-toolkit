"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import { FileLinesIcon } from "@/components/icons/file-lines";
import { RightLeftIcon } from "@/components/icons/right-left";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/core/text/format-bytes";
import { useDownload } from "@/hooks/use-download";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { decodeBase64, defaultBase64Options, describeBytes, encodeBase64, type Base64Options, type Content } from "./base64";
import { Base64DecodedView } from "./base64-decoded-view";
import { Base64FileCard, type LoadedFile } from "./base64-file-card";
import { Base64OptionsMenu } from "./base64-options-menu";

type Direction = "encode" | "decode";

const contentLabel = (c: Content) => (c.kind === "json" ? "JSON" : c.kind === "text" ? "Text" : c.kind === "image" ? `${c.ext.toUpperCase()} image` : c.label);

// Encode text or a file, or decode Base64 back; Swap flips the direction and carries the result over.
export function Base64ConverterWorkspace() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [direction, setDirection] = useState<Direction>("encode");
  const [stored, setOptions] = useStoredState<Base64Options>("json-toolkit:base64-options", defaultBase64Options);
  const storedKey = JSON.stringify(stored);
  const options = useMemo<Base64Options>(() => ({ ...defaultBase64Options, ...(JSON.parse(storedKey) as Partial<Base64Options>) }), [storedKey]);
  const picker = useRef<HTMLInputElement>(null);
  const download = useDownload();
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const encoding = direction === "encode";
  const source = useMemo(() => (file ? file.bytes : text ? new TextEncoder().encode(text) : null), [file, text]);
  const encoded = useMemo(() => (encoding && source ? encodeBase64(source, options, file ? file.type || "application/octet-stream" : undefined) : ""), [encoding, source, options, file]);
  const decoded = useMemo(() => (!encoding && text.trim() ? decodeBase64(text) : null), [encoding, text]);
  const bytes = decoded?.ok ? decoded.bytes : null;
  const content = useMemo(() => (bytes ? describeBytes(bytes, decoded?.ok ? decoded.mime : undefined) : null), [bytes, decoded]);
  const imageUrl = useMemo(
    () => (bytes && content?.kind === "image" ? encodeBase64(bytes, { ...defaultBase64Options, dataUri: true }, content.mime) : undefined),
    [bytes, content],
  );
  const decodedText = content?.kind === "json" || content?.kind === "text" ? content.text : "";
  const output = encoding ? encoded : decodedText;

  const loadFile = async (f: File) => {
    setFile({ name: f.name, type: f.type, bytes: new Uint8Array(await f.arrayBuffer()) });
    setInput("");
  };

  const swap = () => {
    setDirection(encoding ? "decode" : "encode");
    if (encoding) {
      if (encoded) setInput(encoded);
      setFile(null);
    } else if (bytes && content) {
      if (decodedText) setInput(decodedText);
      else setFile({ name: `decoded.${content.kind === "image" || content.kind === "binary" ? content.ext : "bin"}`, type: content.kind === "image" || content.kind === "binary" ? content.mime : "", bytes });
    }
  };

  const downloadDecoded = () => {
    if (!bytes || !content) return;
    const ext = content.kind === "json" ? "json" : content.kind === "text" ? "txt" : content.ext;
    const mime = content.kind === "json" ? "application/json" : content.kind === "text" ? "text/plain" : content.mime;
    download(bytes, `decoded.${ext}`, mime);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title={encoding ? (file ? "File to Encode" : "Text to Encode") : "Base64 to Decode"}
          label={encoding ? "Text to encode" : "Base64 to decode"}
          placeholder={encoding ? "Type or paste text, or drop a file…" : "Paste Base64 or a data: URI…"}
          value={input}
          onChange={(next) => {
            setInput(next);
            setFile(null);
          }}
          wrap
          onFile={encoding ? loadFile : undefined}
          content={file && encoding ? <Base64FileCard file={file} onRemove={() => setFile(null)} /> : undefined}
          extraActions={
            <>
              <Button variant="soft" size="tiny" onClick={swap} title={encoding ? "Switch to decoding" : "Switch to encoding"}>
                <RightLeftIcon className="h-[11px] w-auto" /> Swap
              </Button>
              {encoding && (
                <>
                  <Button variant="soft" size="tiny" onClick={() => picker.current?.click()}>
                    <FileLinesIcon className="h-[11px] w-auto" /> File
                  </Button>
                  <input
                    ref={picker}
                    type="file"
                    hidden
                    aria-label="Choose a file to encode"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void loadFile(f);
                      e.target.value = "";
                    }}
                  />
                </>
              )}
            </>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title={encoding ? "Base64 Output" : "Decoded Output"}
            output={output}
            error={decoded && !decoded.ok ? decoded.error : undefined}
            fixLinks={false}
            filename={encoding ? "encoded.txt" : "decoded"}
            mime="text/plain"
            onDownload={encoding ? undefined : downloadDecoded}
            options={encoding ? <Base64OptionsMenu options={options} onChange={setOptions} /> : undefined}
          >
            {encoding && encoded && <pre className="p-4 font-mono text-sm leading-5 break-all whitespace-pre-wrap text-json-string">{encoded}</pre>}
            {!encoding && bytes && content && <Base64DecodedView content={content} bytes={bytes} imageUrl={imageUrl} />}
          </ConverterOutputPanel>
        </div>
      </div>

      {(source || decoded) && (
        <ConverterStats
          stats={[
            { label: "Input Size", value: encoding ? formatBytes(source?.length ?? 0) : formatBytes(new TextEncoder().encode(text).length) },
            { label: "Output Size", value: encoding ? formatBytes(encoded.length) : bytes ? formatBytes(bytes.length) : "—" },
            { label: "Variant", value: encoding ? (options.urlSafe ? "URL-safe" : "Standard") : decoded?.ok ? (decoded.urlSafe ? "URL-safe" : "Standard") : "—" },
            { label: "Content", value: encoding ? (file ? file.type || "File" : "Text") : content ? contentLabel(content) : "—" },
            encoding || decoded?.ok ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: "Invalid Base64", tone: "danger" },
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
