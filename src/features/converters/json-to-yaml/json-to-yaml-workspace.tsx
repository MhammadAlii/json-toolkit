"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { jsonStats } from "@/core/json/stats";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredOptions } from "@/hooks/use-stored-options";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats, statusStat } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput, positionedError } from "@/features/converters/shared/converter";
import { JsonOutputOptionsMenu } from "@/features/converters/shared/json-output-options-menu";
import { OptionSelect } from "@/features/converters/shared/option-select";
import { SwapButton } from "@/features/converters/shared/swap-button";
import { defaultYamlOptions, toYaml, type YamlOptions } from "./json-to-yaml";
import { YamlCodeView } from "./yaml-code-view";
import { YamlOptionsMenu } from "./yaml-options-menu";
import { defaultYamlToJsonOptions, yamlToJson, type YamlToJsonOptions } from "./yaml-to-json";

// One page for both directions: JSON → YAML, and YAML → JSON. Swap flips the direction and carries the
// current result over as the new input.
export function JsonToYamlWorkspace() {
  const [input, setInput] = useState("");
  const [toYamlOut, setToYamlOut] = useState(true);
  const [options, setOptions] = useStoredOptions<YamlOptions>("json-toolkit:yaml-options", defaultYamlOptions);
  const [jsonOptions, setJsonOptions] = useStoredOptions<YamlToJsonOptions>("json-toolkit:yaml-json-options", defaultYamlToJsonOptions);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => (toYamlOut ? parseInput(text) : null), [toYamlOut, text]);
  const yaml = useMemo(() => (parsed?.status === "valid" ? toYaml(parsed.value, options) : ""), [parsed, options]);
  const json = useMemo(() => (!toYamlOut && text.trim() ? yamlToJson(text, jsonOptions) : null), [toYamlOut, text, jsonOptions]);

  const output = toYamlOut ? yaml : json?.ok ? json.json : "";
  const error = toYamlOut ? (parsed?.status === "invalid" ? parsed.error : undefined) : json && !json.ok ? positionedError(json) : undefined;
  const keys = toYamlOut ? (parsed?.status === "valid" ? jsonStats(parsed.value).keys : undefined) : json?.ok ? jsonStats(json.value).keys : undefined;

  const swap = () => {
    setToYamlOut(!toYamlOut);
    if (output) setInput(output);
  };

  return (
    <div className="flex flex-col gap-8">
      {!toYamlOut && json?.ok && json.notes.length > 0 && (
        <div role="status" className="flex flex-col gap-2 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-3 text-sm text-tint-amber">
          {json.notes.map((n) => (
            <p key={n} className="flex items-center gap-2">
              <ShieldAlertIcon className="size-3.5 shrink-0" /> {n}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title={toYamlOut ? "Input JSON" : "Input YAML"}
          label={toYamlOut ? "JSON input" : "YAML input"}
          placeholder={toYamlOut ? "Paste your JSON here…" : "Paste your YAML here…"}
          value={input}
          onChange={setInput}
          extraActions={
            <>
              <SwapButton to={toYamlOut ? "YAML → JSON" : "JSON → YAML"} onClick={swap} />
              {toYamlOut && (
                <Button variant="soft" size="tiny" onClick={() => parsed?.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed?.status !== "valid"}>
                  <AlignLeftIcon className="h-[11px] w-auto" /> Format
                </Button>
              )}
            </>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title={toYamlOut ? "YAML Output" : "JSON Output"}
            output={output}
            error={error}
            fixLinks={toYamlOut}
            filename={toYamlOut ? "converted.yaml" : "converted.json"}
            mime={toYamlOut ? "application/yaml" : "application/json"}
            options={
              toYamlOut ? (
                <YamlOptionsMenu options={options} onChange={setOptions} />
              ) : (
                <JsonOutputOptionsMenu options={jsonOptions} onChange={setJsonOptions} defaults={defaultYamlToJsonOptions}>
                  <OptionSelect<YamlToJsonOptions["schema"]>
                    label="YAML version"
                    value={jsonOptions.schema}
                    onChange={(schema) => setJsonOptions({ ...jsonOptions, schema })}
                    choices={[
                      ["1.2", "1.2 (yes/no are strings)"],
                      ["1.1", "1.1 (yes/no are booleans)"],
                    ]}
                  />
                </JsonOutputOptionsMenu>
              )
            }
          >
            {output && (toYamlOut ? <YamlCodeView text={output} /> : <JsonCodeView text={output} />)}
          </ConverterOutputPanel>
        </div>
      </div>

      {text.trim() !== "" && (
        <ConverterStats
          stats={[
            { label: "Input Size", value: byteSize(text) },
            { label: "Output Size", value: output ? byteSize(output) : "—" },
            { label: "Total Keys", value: keys === undefined ? "—" : keys.toLocaleString() },
            ...(toYamlOut ? [] : [{ label: "Documents", value: json?.ok ? json.documents.toLocaleString() : "—" }]),
            toYamlOut ? statusStat(!!output, "Invalid JSON") : statusStat(!!json?.ok, "Invalid YAML"),
            { label: "Processing", value: "Local (Client)", tone: "brand" as const },
          ]}
        />
      )}
    </div>
  );
}
