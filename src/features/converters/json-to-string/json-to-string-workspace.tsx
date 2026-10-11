"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { RightLeftIcon } from "@/components/icons/right-left";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats, type ConverterStat } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput } from "@/features/converters/shared/converter";
import { JsonOutputOptionsMenu } from "./json-output-options-menu";
import { defaultStringOptions, jsonToString, type StringOptions } from "./json-to-string";
import { StringCodeView } from "./string-code-view";
import { StringOptionsMenu } from "./string-options-menu";
import { defaultJsonOutputOptions, formatJson, stringToJson, type JsonOutputOptions } from "./string-to-json";

type Direction = "escape" | "unescape";

const status = (ok: boolean, failure: string): ConverterStat => (ok ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: failure, tone: "danger" });

// One page for both directions: JSON → escaped string, and escaped string → JSON. Swap flips the
// direction and carries the current result over as the new input.
export function JsonToStringWorkspace() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("escape");
  const [storedString, setStringOptions] = useStoredState<StringOptions>("json-toolkit:string-options", defaultStringOptions);
  const [storedJson, setJsonOptions] = useStoredState<JsonOutputOptions>("json-toolkit:string-json-options", defaultJsonOutputOptions);
  const stringKey = JSON.stringify(storedString);
  const jsonKey = JSON.stringify(storedJson);
  const stringOptions = useMemo<StringOptions>(() => ({ ...defaultStringOptions, ...(JSON.parse(stringKey) as Partial<StringOptions>) }), [stringKey]);
  const jsonOptions = useMemo<JsonOutputOptions>(() => ({ ...defaultJsonOutputOptions, ...(JSON.parse(jsonKey) as Partial<JsonOutputOptions>) }), [jsonKey]);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const escaping = direction === "escape";
  const parsed = useMemo(() => (escaping ? parseInput(text) : null), [escaping, text]);
  const escaped = useMemo(() => (parsed?.status === "valid" ? jsonToString(parsed.value, text, stringOptions) : null), [parsed, text, stringOptions]);
  const unescaped = useMemo(() => (!escaping && text.trim() ? stringToJson(text) : null), [escaping, text]);
  const json = useMemo(() => (unescaped?.ok ? formatJson(unescaped.value, jsonOptions) : ""), [unescaped, jsonOptions]);

  const output = escaping ? (escaped?.output ?? "") : json;
  const error = escaping ? (parsed?.status === "invalid" ? parsed.error : undefined) : unescaped && !unescaped.ok ? unescaped.error : undefined;

  const swap = () => {
    setDirection(escaping ? "unescape" : "escape");
    // When unescaping gives JSON, the result is shown formatted, so it's carried over formatted too.
    if (output) setInput(escaping || !unescaped?.ok ? output : JSON.stringify(unescaped.value, null, 2));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title={escaping ? "Input JSON" : "Input String"}
          label={escaping ? "JSON input" : "Escaped string input"}
          placeholder={escaping ? "Paste your JSON here…" : 'Paste an escaped string, e.g. "{\\"id\\":1}"'}
          value={input}
          onChange={setInput}
          extraActions={
            <>
              <Button variant="soft" size="tiny" onClick={swap} title={escaping ? "Switch to String → JSON" : "Switch to JSON → String"}>
                <RightLeftIcon className="h-[11px] w-auto" /> Swap
              </Button>
              {escaping && (
                <Button variant="soft" size="tiny" onClick={() => parsed?.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed?.status !== "valid"}>
                  <AlignLeftIcon className="h-[11px] w-auto" /> Format
                </Button>
              )}
            </>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title={escaping ? "String Output" : "JSON Output"}
            output={output}
            error={error}
            filename={escaping ? "escaped.txt" : "unescaped.json"}
            mime={escaping ? "text/plain" : "application/json"}
            options={escaping ? <StringOptionsMenu options={stringOptions} onChange={setStringOptions} /> : <JsonOutputOptionsMenu options={jsonOptions} onChange={setJsonOptions} />}
          >
            {output && (escaping ? <StringCodeView text={output} /> : <JsonCodeView text={output} />)}
          </ConverterOutputPanel>
        </div>
      </div>

      {unescaped?.ok && unescaped.note && <p className="-mt-4 text-xs text-muted">{unescaped.note}</p>}

      {text.trim() !== "" && (
        <ConverterStats
          stats={[
            { label: "Input Size", value: byteSize(text) },
            { label: "Output Size", value: output ? byteSize(output) : "—" },
            escaping
              ? { label: "Escapes", value: escaped ? escaped.escapes.toLocaleString() : "—" }
              : { label: "Levels Unwrapped", value: unescaped?.ok ? unescaped.levels.toLocaleString() : "—" },
            escaping ? status(!!escaped, "Invalid JSON") : status(!!unescaped?.ok, "Can't unescape"),
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
