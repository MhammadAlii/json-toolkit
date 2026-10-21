"use client";

import { useRef, useState } from "react";
import type { LoadedWorkbook } from "./excel-file-card";
import { readWorkbook, type ReadWorkbook } from "./excel-to-json";
import { ExcelToJsonPane } from "./excel-to-json-pane";
import { JsonToExcelPane } from "./json-to-excel-pane";

// One page for both directions: JSON → Excel, and Excel → JSON. Swap flips the direction and carries the
// current result over: the workbook JSON → Excel would download, or the JSON read from a workbook.
export function JsonToExcelWorkspace() {
  const [toExcel, setToExcel] = useState(true);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<LoadedWorkbook | null>(null);
  const [workbook, setWorkbook] = useState<ReadWorkbook>();
  // Only the latest file's result is kept if a slow read finishes after a newer one started.
  const latest = useRef(0);

  const load = async (name: string, bytes: Uint8Array) => {
    const id = ++latest.current;
    setFile({ name, size: bytes.length });
    setWorkbook(undefined);
    const read = await readWorkbook(bytes);
    if (id === latest.current) setWorkbook(read);
  };
  const remove = () => {
    latest.current++;
    setFile(null);
    setWorkbook(undefined);
  };

  if (toExcel) {
    return (
      <JsonToExcelPane
        input={input}
        setInput={setInput}
        onSwap={(bytes) => {
          setToExcel(false);
          if (bytes) void load("converted.xlsx", bytes);
        }}
      />
    );
  }
  return (
    <ExcelToJsonPane
      file={file}
      workbook={workbook}
      onFile={(f) => void f.arrayBuffer().then((buffer) => load(f.name, new Uint8Array(buffer)))}
      onRemove={remove}
      onSwap={(json) => {
        setToExcel(true);
        if (json) setInput(json);
      }}
    />
  );
}
