"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { MenuSelect } from "@/components/ui/menu-select";
import { PanelTitle } from "@/components/ui/panel-title";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredOptions } from "@/hooks/use-stored-options";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats, statusStat } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput, positionedError } from "@/features/converters/shared/converter";
import { SwapButton } from "@/features/converters/shared/swap-button";
import { defaultTsOptions, jsonToTypeScript, type TsOptions } from "./json-to-typescript";
import { TsCodeView } from "./ts-code-view";
import { TsOptionsMenu } from "./ts-options-menu";
import { TsToJsonOptionsMenu } from "./ts-to-json-options-menu";
import { TsTypeMap } from "./ts-type-map";
import { defaultTsToJsonOptions, typeScriptToJson, type TsToJsonOptions } from "./typescript-to-json";

type View = "code" | "map";

const views = [
  { value: "code", label: "Code" },
  { value: "map", label: "Type Map" },
] as const;

// One page for both directions: JSON → TypeScript types, and TypeScript types → sample JSON. Swap flips
// the direction and carries the current result over as the new input.
export function JsonToTypeScriptWorkspace() {
  const [input, setInput] = useState("");
  const [toTs, setToTs] = useState(true);
  const [view, setView] = useState<View>("code");
  const [root, setRoot] = useState<string>();
  const [options, setOptions] = useStoredOptions<TsOptions>("json-toolkit:ts-options", defaultTsOptions);
  const [jsonOptions, setJsonOptions] = useStoredOptions<TsToJsonOptions>("json-toolkit:ts-json-options", defaultTsToJsonOptions);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => (toTs ? parseInput(text) : null), [toTs, text]);
  const result = useMemo(() => (parsed?.status === "valid" ? jsonToTypeScript(parsed.value, options) : null), [parsed, options]);
  const json = useMemo(() => (!toTs && text.trim() ? typeScriptToJson(text, jsonOptions, root) : null), [toTs, text, jsonOptions, root]);

  const swap = () => {
    setToTs(!toTs);
    setRoot(undefined);
    if (toTs && result) setInput(result.code);
    else if (!toTs && json?.ok) setInput(json.json);
  };

  if (!toTs) {
    const types = json?.types ?? [];
    return (
      <div className="flex flex-col gap-8">
        {json?.ok && json.notes.length > 0 && (
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
            title="Input TypeScript"
            label="TypeScript input"
            placeholder="Paste interfaces, type aliases or enums…"
            value={input}
            onChange={(next) => {
              setInput(next);
              setRoot(undefined);
            }}
            extraActions={<SwapButton to="JSON → TypeScript" onClick={swap} />}
          />
          <div style={colors.style} className="min-w-0">
            <ConverterOutputPanel
              title="JSON Output"
              header={
                json?.ok && types.length > 1 ? (
                  <span className="flex items-center gap-2">
                    <PanelTitle>Type</PanelTitle>
                    <MenuSelect value={json.root} onChange={(e) => setRoot(e.target.value)} aria-label="Type to generate">
                      {types.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </MenuSelect>
                  </span>
                ) : undefined
              }
              output={json?.ok ? json.json : ""}
              error={json && !json.ok ? positionedError(json) : undefined}
              fixLinks={false}
              filename={`${json?.ok ? json.root : "sample"}.json`}
              mime="application/json"
              options={<TsToJsonOptionsMenu options={jsonOptions} onChange={setJsonOptions} />}
            >
              {json?.ok && <JsonCodeView text={json.json} />}
            </ConverterOutputPanel>
          </div>
        </div>
        {text.trim() !== "" && (
          <ConverterStats
            stats={[
              { label: "Types Found", value: json ? types.length.toLocaleString() : "—" },
              { label: "Generated From", value: json?.ok ? json.root : "—" },
              { label: "Input Size", value: byteSize(text) },
              { label: "Output Size", value: json?.ok ? byteSize(json.json) : "—" },
              statusStat(!!json?.ok, "Can't read types"),
              { label: "Processing", value: "Local (Client)", tone: "brand" },
            ]}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title="Input JSON"
          label="JSON input"
          value={input}
          onChange={setInput}
          extraActions={
            <>
              <SwapButton to="TypeScript → JSON" onClick={swap} />
              <Button variant="soft" size="tiny" onClick={() => parsed?.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed?.status !== "valid"}>
                <AlignLeftIcon className="h-[11px] w-auto" /> Format
              </Button>
            </>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title="TypeScript Output"
            header={<SegmentedControl label="Output view" options={views} value={view} onChange={setView} />}
            output={result?.code ?? ""}
            error={parsed?.status === "invalid" ? parsed.error : undefined}
            filename="types.ts"
            mime="text/plain"
            options={<TsOptionsMenu options={options} onChange={setOptions} />}
          >
            {result && (view === "code" ? <TsCodeView code={result.code} /> : <TsTypeMap rows={result.typeMap} />)}
          </ConverterOutputPanel>
        </div>
      </div>

      {parsed && parsed.status !== "empty" && (
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
