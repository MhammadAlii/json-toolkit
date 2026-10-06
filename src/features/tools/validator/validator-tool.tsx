"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { validateJson } from "./validator";

const config: WorkbenchConfig = {
  inputLabel: "JSON to validate",
  outputLabel: "Parsed result",
  options: [],
  run: (input) => validateJson(input),
  sample: '{\n  "name": "Ada",\n  "tags": ["math", "computing"],\n}',
  download: { filename: "valid.json", mime: "application/json" },
  accept: jsonAccept,
};

export function ValidatorTool() {
  return <ToolWorkbench config={config} />;
}
