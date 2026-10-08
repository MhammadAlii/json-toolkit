"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { minifyJson } from "./minifier";

const config: WorkbenchConfig = {
  inputLabel: "JSON input",
  outputLabel: "Minified JSON",
  options: [],
  run: (input) => minifyJson(input),
  download: { filename: "minified.json", mime: "application/json" },
  accept: jsonAccept,
};

export function MinifierTool() {
  return <ToolWorkbench config={config} />;
}
