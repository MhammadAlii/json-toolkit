"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterCodeView } from "@/features/converters/shared/converter-code-view";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput } from "@/features/converters/shared/converter";
import { CsvOptionsMenu } from "./csv-options-menu";
import { CsvPreviewTable } from "./csv-preview-table";
import { convertToCsv, defaultCsvConverterOptions, withBom, type CsvConverterOptions } from "./json-to-csv";

type View = "csv" | "preview";

const views = [
  { value: "csv", label: "CSV" },
  { value: "preview", label: "Preview" },
] as const;

export function JsonToCsvWorkspace() {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>("csv");
  const [rootKey, setRootKey] = useState<string>();
  const [stored, setOptions] = useStoredState<CsvConverterOptions>("json-toolkit:csv-options", defaultCsvConverterOptions);
  // Stored options are re-read each render, so memoise on their JSON to keep the conversion cached.
  const storedKey = JSON.stringify(stored);
  const options = useMemo<CsvConverterOptions>(() => ({ ...defaultCsvConverterOptions, ...(JSON.parse(storedKey) as Partial<CsvConverterOptions>) }), [storedKey]);

  const text = useDeferredValue(input);
  const parsed = useMemo(() => parseInput(text), [text]);
  const result = useMemo(() => (parsed.status === "valid" ? convertToCsv(parsed.value, options, rootKey) : null), [parsed, options, rootKey]);
  const csv = result && result.columns > 0 ? result.csv : "";

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
                Use “{s.key}” ({s.rows.toLocaleString()} rows)
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
            <Button variant="soft" size="tiny" onClick={() => parsed.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed.status !== "valid"}>
              <AlignLeftIcon className="h-[11px] w-auto" /> Format
            </Button>
          }
        />
        <ConverterOutputPanel
          title="CSV Output"
          header={<SegmentedControl label="Output view" options={views} value={view} onChange={setView} />}
          output={withBom(csv, options.bom)}
          error={parsed.status === "invalid" ? parsed.error : undefined}
          filename="converted.csv"
          mime="text/csv"
          options={<CsvOptionsMenu options={options} onChange={setOptions} />}
        >
          {result && result.columns === 0 && <p className="p-4 text-sm text-muted">There are no columns to write; the rows are empty objects.</p>}
          {csv &&
            (view === "csv" ? (
              <ConverterCodeView text={csv.replace(/\r\n/g, "\n")} firstLineClassName={options.headers ? "font-semibold text-json-key" : ""} />
            ) : (
              result && <CsvPreviewTable headers={result.headers} cells={result.cells} />
            ))}
        </ConverterOutputPanel>
      </div>

      {parsed.status !== "empty" && (
        <ConverterStats
          stats={[
            { label: "Rows", value: result ? result.rows.toLocaleString() : "—" },
            { label: "Columns", value: result ? result.columns.toLocaleString() : "—" },
            { label: "Input Size", value: byteSize(text) },
            { label: "Output Size", value: csv ? byteSize(withBom(csv, options.bom)) : "—" },
            parsed.status === "valid" ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: "Invalid JSON", tone: "danger" },
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
