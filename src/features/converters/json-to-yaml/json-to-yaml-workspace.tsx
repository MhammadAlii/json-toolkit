"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { jsonStats } from "@/core/json/stats";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput } from "@/features/converters/shared/converter";
import { defaultYamlOptions, toYaml, type YamlOptions } from "./json-to-yaml";
import { YamlCodeView } from "./yaml-code-view";
import { YamlOptionsMenu } from "./yaml-options-menu";

export function JsonToYamlWorkspace() {
  const [input, setInput] = useState("");
  const [stored, setOptions] = useStoredState<YamlOptions>("json-toolkit:yaml-options", defaultYamlOptions);
  const options = { ...defaultYamlOptions, ...stored };
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => parseInput(text), [text]);
  const optionsKey = JSON.stringify(options);
  const output = useMemo(() => (parsed.status === "valid" ? toYaml(parsed.value, JSON.parse(optionsKey) as YamlOptions) : ""), [parsed, optionsKey]);

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
            title="YAML Output"
            output={output}
            error={parsed.status === "invalid" ? parsed.error : undefined}
            filename="converted.yaml"
            mime="application/yaml"
            options={<YamlOptionsMenu options={options} onChange={setOptions} />}
          >
            {output && <YamlCodeView text={output} />}
          </ConverterOutputPanel>
        </div>
      </div>

      {parsed.status !== "empty" && (
        <ConverterStats
          stats={[
            { label: "Input Size", value: byteSize(text) },
            { label: "Output Size", value: output ? byteSize(output) : "—" },
            { label: "Total Keys", value: parsed.status === "valid" ? jsonStats(parsed.value).keys.toLocaleString() : "—" },
            parsed.status === "valid" ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: "Invalid JSON", tone: "danger" },
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
