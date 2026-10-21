"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredOptions } from "@/hooks/use-stored-options";
import { ConverterCodeView } from "@/features/converters/shared/converter-code-view";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterPreviewTable } from "@/features/converters/shared/converter-preview-table";
import { ConverterStats, statusStat } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput, positionedError } from "@/features/converters/shared/converter";
import { SwapButton } from "@/features/converters/shared/swap-button";
import { CsvOptionsMenu } from "./csv-options-menu";
import { csvToJson, defaultCsvToJsonOptions, type CsvToJsonOptions } from "./csv-to-json";
import { CsvToJsonOptionsMenu } from "./csv-to-json-options-menu";
import { convertToCsv, defaultCsvConverterOptions, withBom, type CsvConverterOptions } from "./json-to-csv";

type View = "csv" | "preview";

const views = [
  { value: "csv", label: "CSV" },
  { value: "preview", label: "Preview" },
] as const;

// One page for both directions: JSON → CSV, and CSV → JSON. Swap flips the direction and carries the
// current result over as the new input.
export function JsonToCsvWorkspace() {
  const [input, setInput] = useState("");
  const [toCsv, setToCsv] = useState(true);
  const [view, setView] = useState<View>("csv");
  const [rootKey, setRootKey] = useState<string>();
  const [options, setOptions] = useStoredOptions<CsvConverterOptions>("json-toolkit:csv-options", defaultCsvConverterOptions);
  const [jsonOptions, setJsonOptions] = useStoredOptions<CsvToJsonOptions>("json-toolkit:csv-json-options", defaultCsvToJsonOptions);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => (toCsv ? parseInput(text) : null), [toCsv, text]);
  const result = useMemo(() => (parsed?.status === "valid" ? convertToCsv(parsed.value, options, rootKey) : null), [parsed, options, rootKey]);
  const csv = result && result.columns > 0 ? result.csv : "";
  const json = useMemo(() => (!toCsv && text.trim() ? csvToJson(text, jsonOptions) : null), [toCsv, text, jsonOptions]);

  const swap = () => {
    setToCsv(!toCsv);
    setRootKey(undefined);
    if (toCsv && csv) setInput(csv.replace(/\r\n/g, "\n"));
    else if (!toCsv && json?.ok) setInput(json.json);
  };

  if (!toCsv) {
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
            title="Input CSV"
            label="CSV input"
            placeholder="Paste your CSV here, with a header row…"
            value={input}
            onChange={setInput}
            extraActions={<SwapButton to="JSON → CSV" onClick={swap} />}
          />
          <div style={colors.style} className="min-w-0">
            <ConverterOutputPanel
              title="JSON Output"
              output={json?.ok ? json.json : ""}
              error={json && !json.ok ? positionedError(json) : undefined}
              fixLinks={false}
              filename="converted.json"
              mime="application/json"
              options={<CsvToJsonOptionsMenu options={jsonOptions} onChange={setJsonOptions} />}
            >
              {json?.ok && <JsonCodeView text={json.json} />}
            </ConverterOutputPanel>
          </div>
        </div>
        {text.trim() !== "" && (
          <ConverterStats
            stats={[
              { label: "Rows", value: json?.ok ? json.rows.toLocaleString() : "—" },
              { label: "Columns", value: json?.ok ? json.columns.toLocaleString() : "—" },
              { label: "Input Size", value: byteSize(text) },
              { label: "Output Size", value: json?.ok ? byteSize(json.json) : "—" },
              statusStat(!!json?.ok, "Invalid CSV"),
              { label: "Processing", value: "Local (Client)", tone: "brand" },
            ]}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {result?.warning && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-tint-amber">
            <ShieldAlertIcon className="size-3.5 shrink-0" /> {result.warning}
          </p>
          <div className="flex flex-wrap gap-2">
            {result.suggestions.map((s) => (
              <Button key={s.key} variant="secondary" size="xs" onClick={() => setRootKey(s.key)}>
                Use “{s.key}” ({s.rows.toLocaleString()} {s.rows === 1 ? "row" : "rows"})
              </Button>
            ))}
          </div>
        </div>
      )}
      {rootKey && result && !result.warning && (
        <p className="-mb-4 flex items-center gap-2 text-xs text-muted">
          Converting the “{rootKey}” array.
          <button type="button" onClick={() => setRootKey(undefined)} className="font-semibold text-brand">
            Use the whole JSON
          </button>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title="Input JSON"
          label="JSON input"
          value={input}
          onChange={(next) => {
            setInput(next);
            setRootKey(undefined);
          }}
          extraActions={
            <>
              <SwapButton to="CSV → JSON" onClick={swap} />
              <Button variant="soft" size="tiny" onClick={() => parsed?.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed?.status !== "valid"}>
                <AlignLeftIcon className="h-[11px] w-auto" /> Format
              </Button>
            </>
          }
        />
        <ConverterOutputPanel
          title="CSV Output"
          header={<SegmentedControl label="Output view" options={views} value={view} onChange={setView} />}
          output={withBom(csv, options.bom)}
          error={parsed?.status === "invalid" ? parsed.error : undefined}
          filename="converted.csv"
          mime="text/csv"
          options={<CsvOptionsMenu options={options} onChange={setOptions} />}
        >
          {result && result.columns === 0 && <p className="p-4 text-sm text-muted">There are no columns to write; the rows are empty objects.</p>}
          {csv &&
            (view === "csv" ? (
              <ConverterCodeView text={csv.replace(/\r\n/g, "\n")} firstLineClassName={options.headers ? "font-semibold text-json-key" : ""} />
            ) : (
              result && <ConverterPreviewTable headers={result.headers} cells={result.cells} complete="The CSV tab and download include" />
            ))}
        </ConverterOutputPanel>
      </div>

      {parsed && parsed.status !== "empty" && (
        <ConverterStats
          stats={[
            { label: "Rows", value: result ? result.rows.toLocaleString() : "—" },
            { label: "Columns", value: result ? result.columns.toLocaleString() : "—" },
            { label: "Input Size", value: byteSize(text) },
            { label: "Output Size", value: csv ? byteSize(withBom(csv, options.bom)) : "—" },
            statusStat(parsed.status === "valid", "Invalid JSON"),
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
