"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { RightLeftIcon } from "@/components/icons/right-left";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { decodeUrl, defaultUrlOptions, encodeUrl, escapeCount, urlParts, type UrlOptions } from "./url";
import { UrlCodeView } from "./url-code-view";
import { UrlOptionsMenu } from "./url-options-menu";
import { UrlPartsCard } from "./url-parts-card";

type Direction = "encode" | "decode";

// Encode and decode on one page; Swap flips the direction and carries the result over as the new input.
export function UrlEncoderWorkspace() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");
  const [stored, setOptions] = useStoredState<UrlOptions>("json-toolkit:url-options", defaultUrlOptions);
  const storedKey = JSON.stringify(stored);
  const options = useMemo<UrlOptions>(() => ({ ...defaultUrlOptions, ...(JSON.parse(storedKey) as Partial<UrlOptions>) }), [storedKey]);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const encoding = direction === "encode";
  const result = useMemo(() => (text ? (encoding ? encodeUrl(text, options) : decodeUrl(text, options)) : null), [text, encoding, options]);
  const output = result?.ok ? result.value : "";
  // The breakdown reads the plain (decoded) side: the input when encoding, the result when decoding.
  const parts = useMemo(() => urlParts(encoding ? text : output), [encoding, text, output]);

  const swap = () => {
    setDirection(encoding ? "decode" : "encode");
    if (output) setInput(output);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title={encoding ? "Text to Encode" : "Text to Decode"}
          label={encoding ? "Text to encode" : "Encoded text to decode"}
          placeholder={encoding ? "Paste text or a URL to encode…" : "Paste an encoded URL or text, e.g. hello%20world…"}
          value={input}
          onChange={setInput}
          wrap
          extraActions={
            <Button variant="soft" size="tiny" onClick={swap} title={encoding ? "Switch to decoding" : "Switch to encoding"}>
              <RightLeftIcon className="h-[11px] w-auto" /> Swap
            </Button>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title={encoding ? "Encoded Output" : "Decoded Output"}
            output={output}
            error={result && !result.ok ? result.error : undefined}
            fixLinks={false}
            filename={encoding ? "encoded.txt" : "decoded.txt"}
            mime="text/plain"
            options={<UrlOptionsMenu encoding={encoding} options={options} onChange={setOptions} />}
          >
            {output && (encoding ? <UrlCodeView text={output} /> : <pre className="p-4 font-mono text-sm leading-5 break-all whitespace-pre-wrap text-heading">{output}</pre>)}
          </ConverterOutputPanel>
        </div>
      </div>

      {parts && <UrlPartsCard parts={parts} />}

      {text && (
        <ConverterStats
          stats={[
            { label: "Input Length", value: text.length.toLocaleString() },
            { label: "Output Length", value: output ? output.length.toLocaleString() : "—" },
            { label: "Escape Sequences", value: (encoding ? escapeCount(output) : escapeCount(text)).toLocaleString() },
            result?.ok ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: encoding ? "Can't encode" : "Can't decode", tone: "danger" },
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
