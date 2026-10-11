"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput } from "@/features/converters/shared/converter";
import { defaultStringOptions, jsonToString, type StringOptions } from "./json-to-string";
import { StringCodeView } from "./string-code-view";
import { StringOptionsMenu } from "./string-options-menu";

export function JsonToStringWorkspace() {
  const [input, setInput] = useState("");
  const [stored, setOptions] = useStoredState<StringOptions>("json-toolkit:string-options", defaultStringOptions);
  const storedKey = JSON.stringify(stored);
  const options = useMemo<StringOptions>(() => ({ ...defaultStringOptions, ...(JSON.parse(storedKey) as Partial<StringOptions>) }), [storedKey]);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => parseInput(text), [text]);
  const result = useMemo(() => (parsed.status === "valid" ? jsonToString(parsed.value, text, options) : null), [parsed, text, options]);
  const output = result?.output ?? "";

  return (
    <div className="flex flex-col gap-8">
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
            title="String Output"
            output={output}
            error={parsed.status === "invalid" ? parsed.error : undefined}
            filename="escaped.txt"
            mime="text/plain"
            options={<StringOptionsMenu options={options} onChange={setOptions} />}
          >
            {output && <StringCodeView text={output} />}
          </ConverterOutputPanel>
        </div>
      </div>

      {parsed.status !== "empty" && (
        <ConverterStats
          stats={[
            { label: "Input Size", value: byteSize(text) },
            { label: "Output Size", value: output ? byteSize(output) : "—" },
            { label: "Escapes", value: result ? result.escapes.toLocaleString() : "—" },
            parsed.status === "valid" ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: "Invalid JSON", tone: "danger" },
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
