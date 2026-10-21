"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { MenuSelect } from "@/components/ui/menu-select";
import { PanelTitle } from "@/components/ui/panel-title";
import { useDownload } from "@/hooks/use-download";
import { useStoredOptions } from "@/hooks/use-stored-options";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterPreviewTable } from "@/features/converters/shared/converter-preview-table";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { SwapButton } from "@/features/converters/shared/swap-button";
import { byteSize, parseInput } from "@/features/converters/shared/converter";
import { formatBytes } from "@/core/text/format-bytes";
import { ExcelOptionsMenu } from "./excel-options-menu";
import { cellLabel, defaultExcelOptions, excelFile, jsonToExcel, sheetTsv, type ExcelOptions, type ExcelSource } from "./json-to-excel";

export const xlsxMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// JSON → Excel. `onSwap` receives the workbook it would download, so Excel → JSON can read it back.
export function JsonToExcelPane({ input, setInput, onSwap }: { input: string; setInput: (text: string) => void; onSwap: (workbook?: Uint8Array) => void }) {
  const [source, setSource] = useState<ExcelSource>({ kind: "all" });
  const [sheetIndex, setSheetIndex] = useState(0);
  const [options, setOptions] = useStoredOptions<ExcelOptions>("json-toolkit:excel-options", defaultExcelOptions);
  const download = useDownload();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => parseInput(text), [text]);
  const result = useMemo(() => (parsed.status === "valid" ? jsonToExcel(parsed.value, options, source) : null), [parsed, options, source]);
  const sheet = result?.sheets[Math.min(sheetIndex, result.sheets.length - 1)];
  const hasColumns = !!result && result.columns > 0;
  const tsv = useMemo(() => (sheet && hasColumns ? sheetTsv(sheet, options.headers) : ""), [sheet, hasColumns, options.headers]);
  const fileSize = useMemo(() => (result && hasColumns ? excelFile(result.sheets, options).length : 0), [result, hasColumns, options]);
  // Only the rows the preview shows are turned into text.
  const preview = useMemo(() => sheet?.rows.slice(0, 200).map((r) => r.map(cellLabel)) ?? [], [sheet]);

  const pick = (next: ExcelSource) => {
    setSource(next);
    setSheetIndex(0);
  };

  const sheetPicker =
    result && result.sheets.length > 1 ? (
      <span className="flex items-center gap-2">
        <PanelTitle>Sheet</PanelTitle>
        <MenuSelect value={sheetIndex} onChange={(e) => setSheetIndex(Number(e.target.value))} aria-label="Sheet to preview">
          {result.sheets.map((s, i) => (
            <option key={s.name} value={i}>
              {s.name} ({s.rows.length.toLocaleString()})
            </option>
          ))}
        </MenuSelect>
      </span>
    ) : undefined;

  return (
    <div className="flex flex-col gap-8">
      {result?.warning && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-tint-amber">
            <ShieldAlertIcon className="size-3.5 shrink-0" /> {result.warning}
          </p>
          <div className="flex flex-wrap gap-2">
            {result.suggestions.map((s) => (
              <Button key={s.key} variant="secondary" size="xs" onClick={() => pick({ kind: "key", key: s.key })}>
                Use “{s.key}” ({s.rows.toLocaleString()} {s.rows === 1 ? "row" : "rows"})
              </Button>
            ))}
            {result.suggestions.length > 1 && (
              <Button variant="secondary" size="xs" onClick={() => pick({ kind: "sheets" })}>
                All {result.suggestions.length} as sheets
              </Button>
            )}
          </div>
        </div>
      )}
      {source.kind !== "all" && result && !result.warning && (
        <p className="-mb-4 flex items-center gap-2 text-xs text-muted">
          {source.kind === "key" ? `Converting the “${source.key}” array.` : `Converting ${result.sheets.length} arrays, one sheet each.`}
          <button type="button" onClick={() => pick({ kind: "all" })} className="font-semibold text-brand">
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
            pick({ kind: "all" });
          }}
          extraActions={
            <>
              <SwapButton to="Excel → JSON" onClick={() => onSwap(result && hasColumns ? excelFile(result.sheets, options) : undefined)} />
              <Button variant="soft" size="tiny" onClick={() => parsed.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed.status !== "valid"}>
                <AlignLeftIcon className="h-[11px] w-auto" /> Format
              </Button>
            </>
          }
        />
        <ConverterOutputPanel
          title="Excel Preview"
          header={sheetPicker}
          output={tsv}
          error={parsed.status === "invalid" ? parsed.error : undefined}
          filename="converted.xlsx"
          mime={xlsxMime}
          onDownload={() => result && download(excelFile(result.sheets, options), "converted.xlsx", xlsxMime)}
          options={<ExcelOptionsMenu options={options} onChange={setOptions} />}
        >
          {result && !hasColumns && <p className="p-4 text-sm text-muted">There are no columns to write; the rows are empty objects.</p>}
          {sheet && hasColumns && <ConverterPreviewTable headers={sheet.headers} cells={preview} total={sheet.rows.length} complete="The download includes" />}
          {result && result.notes.length > 0 && (
            <ul className="flex flex-col gap-1 border-t border-border px-4 py-3 text-xs text-tint-amber">
              {result.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </ConverterOutputPanel>
      </div>

      {parsed.status !== "empty" && (
        <ConverterStats
          stats={[
            { label: "Rows", value: result ? result.rows.toLocaleString() : "—" },
            { label: "Columns", value: result ? result.columns.toLocaleString() : "—" },
            { label: "Sheets", value: result ? result.sheets.length.toLocaleString() : "—" },
            { label: "Input Size", value: byteSize(text) },
            { label: "File Size", value: fileSize ? formatBytes(fileSize) : "—" },
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
