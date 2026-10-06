"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { minifyJson } from "./minifier";

const config: WorkbenchConfig = {
  inputLabel: "JSON input",
  outputLabel: "Minified JSON",
  options: [],
  run: (input) => minifyJson(input),
  sample: JSON.stringify({"id":1042,"name":"Ada Lovelace","email":"ada@example.com","active":true,"roles":["admin","editor"],"address":{"city":"London","postcode":"W1A 1AA"},"lastLogin":null}, null, 2),
  download: { filename: "minified.json", mime: "application/json" },
  accept: jsonAccept,
};

export function MinifierTool() {
  return <ToolWorkbench config={config} />;
}
