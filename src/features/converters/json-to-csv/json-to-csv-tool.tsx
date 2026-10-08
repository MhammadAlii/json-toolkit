"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { jsonToCsv, type Delimiter } from "./json-to-csv";

const config: WorkbenchConfig = {
  inputLabel: "JSON array",
  outputLabel: "CSV",
  options: [
    {
      kind: "select",
      key: "delimiter",
      label: "Delimiter",
      initial: ",",
      choices: [
        { value: ",", label: "Comma (,)" },
        { value: ";", label: "Semicolon (;)" },
        { value: "\t", label: "Tab" },
      ],
    },
  ],
  run: (input, o) => jsonToCsv(input, o.delimiter as Delimiter),
  download: { filename: "output.csv", mime: "text/csv" },
  accept: jsonAccept,
};

export function JsonToCsvTool() {
  return <ToolWorkbench config={config} />;
}
