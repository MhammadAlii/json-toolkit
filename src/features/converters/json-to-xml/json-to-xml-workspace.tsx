"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredOptions } from "@/hooks/use-stored-options";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { SwapButton } from "@/features/converters/shared/swap-button";
import { ConverterStats, statusStat } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput, positionedError } from "@/features/converters/shared/converter";
import { defaultXmlOptions, jsonToXml, type XmlOptions } from "./json-to-xml";
import { XmlCodeView } from "./xml-code-view";
import { XmlOptionsMenu } from "./xml-options-menu";
import { XmlRenamesMenu } from "./xml-renames-menu";
import { defaultXmlToJsonOptions, xmlToJson, type XmlToJsonOptions } from "./xml-to-json";
import { XmlToJsonOptionsMenu } from "./xml-to-json-options-menu";

type Direction = "toXml" | "toJson";

const count = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString());

// One page for both directions: JSON → XML, and XML → JSON. Swap flips the direction and carries the
// current result over as the new input.
export function JsonToXmlWorkspace() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("toXml");
  const [options, setOptions] = useStoredOptions<XmlOptions>("json-toolkit:xml-options", defaultXmlOptions);
  const [jsonOptions, setJsonOptions] = useStoredOptions<XmlToJsonOptions>("json-toolkit:xml-json-options", defaultXmlToJsonOptions);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const toXml = direction === "toXml";
  const parsed = useMemo(() => (toXml ? parseInput(text) : null), [toXml, text]);
  const result = useMemo(() => (parsed?.status === "valid" ? jsonToXml(parsed.value, options) : null), [parsed, options]);
  const json = useMemo(() => (!toXml && text.trim() ? xmlToJson(text, jsonOptions) : null), [toXml, text, jsonOptions]);
  const first = result?.renamed[0];

  const output = toXml ? (result?.xml ?? "") : json?.ok ? json.json : "";
  const error = toXml
    ? parsed?.status === "invalid"
      ? parsed.error
      : undefined
    : json && !json.ok
      ? positionedError(json)
      : undefined;
  const notes = toXml ? (result?.notes ?? []) : json?.ok ? json.notes : [];

  const swap = () => {
    setDirection(toXml ? "toJson" : "toXml");
    if (!output) return;
    setInput(output);
    // JSON read from XML uses @name and #text keys and one top-level key for the root, so writing it
    // back as XML needs the matching options to give the same document.
    if (!toXml && jsonOptions.attributes === "prefixed" && jsonOptions.keepRoot) {
      setOptions({ ...options, attributes: "prefixed", omitRoot: true });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {((result && result.renamed.length > 0) || notes.length > 0) && (
        <div role="status" className="flex flex-col gap-2 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-3 text-sm text-tint-amber">
          {toXml && first && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2">
                <ShieldAlertIcon className="size-3.5 shrink-0" />
                {result.renamed.length} {result.renamed.length === 1 ? "key needs" : "keys need"} renaming for valid XML (e.g. {JSON.stringify(first.from)} → {first.to}).
              </p>
              <XmlRenamesMenu renamed={result.renamed} />
            </div>
          )}
          {notes.map((n) => (
            <p key={n} className="flex items-center gap-2">
              <ShieldAlertIcon className="size-3.5 shrink-0" /> {n}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title={toXml ? "Input JSON" : "Input XML"}
          label={toXml ? "JSON input" : "XML input"}
          placeholder={toXml ? "Paste your JSON here…" : "Paste your XML here…"}
          value={input}
          onChange={setInput}
          extraActions={
            <>
              <SwapButton to={toXml ? "XML → JSON" : "JSON → XML"} onClick={swap} />
              {toXml && (
                <Button variant="soft" size="tiny" onClick={() => parsed?.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed?.status !== "valid"}>
                  <AlignLeftIcon className="h-[11px] w-auto" /> Format
                </Button>
              )}
            </>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title={toXml ? "XML Output" : "JSON Output"}
            output={output}
            error={error}
            fixLinks={toXml}
            filename={toXml ? "converted.xml" : "converted.json"}
            mime={toXml ? "application/xml" : "application/json"}
            options={toXml ? <XmlOptionsMenu options={options} onChange={setOptions} /> : <XmlToJsonOptionsMenu options={jsonOptions} onChange={setJsonOptions} />}
          >
            {output && (toXml ? <XmlCodeView xml={output} /> : <JsonCodeView text={output} />)}
          </ConverterOutputPanel>
        </div>
      </div>

      {text.trim() !== "" && (
        <ConverterStats
          stats={
            toXml
              ? [
                  { label: "Input Size", value: byteSize(text) },
                  { label: "Output Size", value: output ? byteSize(output) : "—" },
                  { label: "Elements", value: count(result?.elements) },
                  { label: "Attributes", value: count(result?.attributes) },
                  statusStat(!!result, "Invalid JSON"),
                  { label: "Processing", value: "Local (Client)", tone: "brand" },
                ]
              : [
                  { label: "Input Size", value: byteSize(text) },
                  { label: "Output Size", value: output ? byteSize(output) : "—" },
                  { label: "Elements", value: count(json?.ok ? json.elements : undefined) },
                  { label: "Attributes", value: count(json?.ok ? json.attributes : undefined) },
                  statusStat(!!json?.ok, "Invalid XML"),
                  { label: "Processing", value: "Local (Client)", tone: "brand" },
                ]
          }
        />
      )}
    </div>
  );
}
