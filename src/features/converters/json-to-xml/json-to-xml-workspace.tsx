"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput } from "@/features/converters/shared/converter";
import { defaultXmlOptions, jsonToXml, type XmlOptions } from "./json-to-xml";
import { XmlCodeView } from "./xml-code-view";
import { XmlOptionsMenu } from "./xml-options-menu";
import { XmlRenamesMenu } from "./xml-renames-menu";

export function JsonToXmlWorkspace() {
  const [input, setInput] = useState("");
  const [stored, setOptions] = useStoredState<XmlOptions>("json-toolkit:xml-options", defaultXmlOptions);
  // Stored options are re-read each render, so memoise on their JSON to keep the XML cached.
  const storedKey = JSON.stringify(stored);
  const options = useMemo<XmlOptions>(() => ({ ...defaultXmlOptions, ...(JSON.parse(storedKey) as Partial<XmlOptions>) }), [storedKey]);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => parseInput(text), [text]);
  const result = useMemo(() => (parsed.status === "valid" ? jsonToXml(parsed.value, options) : null), [parsed, options]);
  const first = result?.renamed[0];

  return (
    <div className="flex flex-col gap-8">
      {result && (result.renamed.length > 0 || result.notes.length > 0) && (
        <div role="status" className="flex flex-col gap-2 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-3 text-sm text-tint-amber">
          {first && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2">
                <ShieldAlertIcon className="size-3.5 shrink-0" />
                {result.renamed.length} {result.renamed.length === 1 ? "key needs" : "keys need"} renaming for valid XML (e.g. {JSON.stringify(first.from)} → {first.to}).
              </p>
              <XmlRenamesMenu renamed={result.renamed} />
            </div>
          )}
          {result.notes.map((n) => (
            <p key={n} className="flex items-center gap-2">
              <ShieldAlertIcon className="size-3.5 shrink-0" /> {n}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title="Input JSON"
          label="JSON input"
          value={input}
          onChange={setInput}
          extraActions={
            <Button variant="soft" size="tiny" onClick={() => parsed.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed.status !== "valid"}>
              <AlignLeftIcon className="h-[11px] w-auto" /> Format
            </Button>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title="XML Output"
            output={result?.xml ?? ""}
            error={parsed.status === "invalid" ? parsed.error : undefined}
            filename="converted.xml"
            mime="application/xml"
            options={<XmlOptionsMenu options={options} onChange={setOptions} />}
          >
            {result && <XmlCodeView xml={result.xml} />}
          </ConverterOutputPanel>
        </div>
      </div>

      {parsed.status !== "empty" && (
        <ConverterStats
          stats={[
            { label: "Input Size", value: byteSize(text) },
            { label: "Output Size", value: result ? byteSize(result.xml) : "—" },
            { label: "Elements", value: result ? result.elements.toLocaleString() : "—" },
            { label: "Attributes", value: result ? result.attributes.toLocaleString() : "—" },
            parsed.status === "valid" ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: "Invalid JSON", tone: "danger" },
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
