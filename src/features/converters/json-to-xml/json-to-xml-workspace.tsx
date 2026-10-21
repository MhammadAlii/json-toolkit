"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { RightLeftIcon } from "@/components/icons/right-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats, type ConverterStat } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput } from "@/features/converters/shared/converter";
import { defaultXmlOptions, jsonToXml, type XmlOptions } from "./json-to-xml";
import { XmlCodeView } from "./xml-code-view";
import { XmlOptionsMenu } from "./xml-options-menu";
import { XmlRenamesMenu } from "./xml-renames-menu";
import { defaultXmlToJsonOptions, xmlToJson, type XmlToJsonOptions } from "./xml-to-json";
import { XmlToJsonOptionsMenu } from "./xml-to-json-options-menu";

type Direction = "toXml" | "toJson";

const status = (ok: boolean, failure: string): ConverterStat => (ok ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: failure, tone: "danger" });
const count = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString());

// One page for both directions: JSON → XML, and XML → JSON. Swap flips the direction and carries the
// current result over as the new input.
export function JsonToXmlWorkspace() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("toXml");
  const [stored, setOptions] = useStoredState<XmlOptions>("json-toolkit:xml-options", defaultXmlOptions);
  const [storedJson, setJsonOptions] = useStoredState<XmlToJsonOptions>("json-toolkit:xml-json-options", defaultXmlToJsonOptions);
  // Stored options are re-read each render, so memoise on their JSON to keep the results cached.
  const storedKey = JSON.stringify(stored);
  const jsonKey = JSON.stringify(storedJson);
  const options = useMemo<XmlOptions>(() => ({ ...defaultXmlOptions, ...(JSON.parse(storedKey) as Partial<XmlOptions>) }), [storedKey]);
  const jsonOptions = useMemo<XmlToJsonOptions>(() => ({ ...defaultXmlToJsonOptions, ...(JSON.parse(jsonKey) as Partial<XmlToJsonOptions>) }), [jsonKey]);
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
      ? `Line ${json.line}, column ${json.column}: ${json.error}`
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
              <Button variant="soft" size="tiny" onClick={swap} title={toXml ? "Switch to XML → JSON" : "Switch to JSON → XML"}>
                <RightLeftIcon className="h-[11px] w-auto" /> Swap
              </Button>
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
                  status(!!result, "Invalid JSON"),
                  { label: "Processing", value: "Local (Client)", tone: "brand" },
                ]
              : [
                  { label: "Input Size", value: byteSize(text) },
                  { label: "Output Size", value: output ? byteSize(output) : "—" },
                  { label: "Elements", value: count(json?.ok ? json.elements : undefined) },
                  { label: "Attributes", value: count(json?.ok ? json.attributes : undefined) },
                  status(!!json?.ok, "Invalid XML"),
                  { label: "Processing", value: "Local (Client)", tone: "brand" },
                ]
          }
        />
      )}
    </div>
  );
}
