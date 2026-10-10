"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { parseInput } from "@/features/converters/shared/converter";
import { defaultTsOptions, jsonToTypeScript, type TsOptions } from "./json-to-typescript";
import { TsCodeView } from "./ts-code-view";
import { TsOptionsMenu } from "./ts-options-menu";
import { TsTypeMap } from "./ts-type-map";

type View = "code" | "map";

const views = [
  { value: "code", label: "Code" },
  { value: "map", label: "Type Map" },
] as const;

export function JsonToTypeScriptWorkspace() {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>("code");
  const [stored, setOptions] = useStoredState<TsOptions>("json-toolkit:ts-options", defaultTsOptions);
  // Stored options are re-read each render, so memoise on their JSON to keep the generated code cached.
  const storedKey = JSON.stringify(stored);
  const options = useMemo<TsOptions>(() => ({ ...defaultTsOptions, ...(JSON.parse(storedKey) as Partial<TsOptions>) }), [storedKey]);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => parseInput(text), [text]);
  const result = useMemo(() => (parsed.status === "valid" ? jsonToTypeScript(parsed.value, options) : null), [parsed, options]);

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
            title="TypeScript Output"
            header={<SegmentedControl label="Output view" options={views} value={view} onChange={setView} />}
            output={result?.code ?? ""}
            error={parsed.status === "invalid" ? parsed.error : undefined}
            filename="types.ts"
            mime="text/plain"
            options={<TsOptionsMenu options={options} onChange={setOptions} />}
          >
            {result && (view === "code" ? <TsCodeView code={result.code} /> : <TsTypeMap rows={result.typeMap} />)}
          </ConverterOutputPanel>
        </div>
      </div>

      {parsed.status !== "empty" && (
        <ConverterStats
          stats={[
            { label: "Types Generated", value: result ? String(result.types) : "—" },
            { label: "Properties", value: result ? String(result.properties) : "—" },
            { label: "Optional Fields", value: result ? String(result.optionalFields) : "—" },
            { label: "Union Types", value: result ? String(result.unionTypes) : "—" },
            parsed.status === "valid" ? { label: "Processing", value: "Local (Client)", tone: "brand" } : { label: "Status", value: "Invalid JSON", tone: "danger" },
          ]}
        />
      )}
    </div>
  );
}
