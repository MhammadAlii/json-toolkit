"use client";

import { useMemo, useRef, useState } from "react";
import { FileLinesIcon } from "@/components/icons/file-lines";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { MenuSelect } from "@/components/ui/menu-select";
import { PanelTitle } from "@/components/ui/panel-title";
import { formatBytes } from "@/core/text/format-bytes";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredOptions } from "@/hooks/use-stored-options";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats, statusStat } from "@/features/converters/shared/converter-stats";
import { byteSize } from "@/features/converters/shared/converter";
import { SwapButton } from "@/features/converters/shared/swap-button";
import { ExcelFileCard, type LoadedWorkbook } from "./excel-file-card";
import { defaultExcelToJsonOptions, workbookToJson, type ExcelToJsonOptions, type ReadWorkbook } from "./excel-to-json";
import { ExcelToJsonOptionsMenu } from "./excel-to-json-options-menu";

// Excel → JSON. The workbook is read by the workspace, so Swap can hand over a file made by JSON → Excel.
export function ExcelToJsonPane({
  file,
  workbook,
  onFile,
  onRemove,
  onSwap,
}: {
  file: LoadedWorkbook | null;
  /** Undefined while the file is being read. */
  workbook?: ReadWorkbook;
  onFile: (file: File) => void;
  onRemove: () => void;
  onSwap: (json: string) => void;
}) {
  const [sheetIndex, setSheetIndex] = useState(0);
  const [options, setOptions] = useStoredOptions<ExcelToJsonOptions>("json-toolkit:excel-json-options", defaultExcelToJsonOptions);
  const picker = useRef<HTMLInputElement>(null);
  const colors = useJsonColors();

  const book = workbook?.ok ? workbook.book : undefined;
  const index = book ? Math.min(sheetIndex, book.sheets.length - 1) : 0;
  const result = useMemo(() => (book ? workbookToJson(book, options, index) : null), [book, options, index]);

  const sheetPicker =
    book && book.sheets.length > 1 && options.sheets === "one" ? (
      <span className="flex items-center gap-2">
        <PanelTitle>Sheet</PanelTitle>
        <MenuSelect value={index} onChange={(e) => setSheetIndex(Number(e.target.value))} aria-label="Sheet to convert">
          {book.sheets.map((s, i) => (
            <option key={s.name} value={i}>
              {s.name}
              {s.hidden ? " (hidden)" : ""}
            </option>
          ))}
        </MenuSelect>
      </span>
    ) : undefined;

  return (
    <div className="flex flex-col gap-8">
      {result && result.notes.length > 0 && (
        <div role="status" className="flex flex-col gap-2 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-3 text-sm text-tint-amber">
          {result.notes.map((n) => (
            <p key={n} className="flex items-center gap-2">
              <ShieldAlertIcon className="size-3.5 shrink-0" /> {n}
            </p>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title="Input Excel"
          label="Excel file"
          value=""
          onChange={() => onRemove()}
          onFile={(f) => {
            setSheetIndex(0);
            onFile(f);
          }}
          content={<ExcelFileCard file={file} sheets={book?.sheets.length} onChoose={() => picker.current?.click()} onRemove={onRemove} />}
          extraActions={
            <>
              <SwapButton to="JSON → Excel" onClick={() => onSwap(result?.json ?? "")} />
              <Button variant="soft" size="tiny" onClick={() => picker.current?.click()}>
                <FileLinesIcon className="h-[11px] w-auto" /> File
              </Button>
              <input
                ref={picker}
                type="file"
                hidden
                accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                aria-label="Choose an Excel file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setSheetIndex(0);
                    onFile(f);
                  }
                  e.target.value = "";
                }}
              />
            </>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title="JSON Output"
            header={sheetPicker}
            output={result?.json ?? ""}
            error={workbook && !workbook.ok ? workbook.error : undefined}
            fixLinks={false}
            filename={`${file?.name.replace(/\.[^.]+$/, "") || "converted"}.json`}
            mime="application/json"
            options={<ExcelToJsonOptionsMenu options={options} onChange={setOptions} />}
          >
            {file && !workbook && <p className="p-4 text-sm text-muted">Reading the workbook…</p>}
            {result && <JsonCodeView text={result.json} />}
          </ConverterOutputPanel>
        </div>
      </div>

      {file && (
        <ConverterStats
          stats={[
            { label: "Rows", value: result ? result.rows.toLocaleString() : "—" },
            { label: "Columns", value: result ? result.columns.toLocaleString() : "—" },
            { label: "Sheets", value: book ? book.sheets.length.toLocaleString() : "—" },
            { label: "File Size", value: formatBytes(file.size) },
            { label: "Output Size", value: result ? byteSize(result.json) : "—" },
            workbook ? statusStat(workbook.ok, "Can't read file") : { label: "Status", value: "Reading…" },
          ]}
        />
      )}
    </div>
  );
}
