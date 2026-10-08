"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { jsonToTypeScript } from "./json-to-typescript";

const config: WorkbenchConfig = {
  inputLabel: "JSON sample",
  outputLabel: "TypeScript",
  options: [{ kind: "text", key: "rootName", label: "Root name", initial: "Root" }],
  run: (input, o) => jsonToTypeScript(input, (o.rootName as string) || "Root"),
  download: { filename: "types.ts", mime: "text/plain" },
  accept: jsonAccept,
};

export function JsonToTypeScriptTool() {
  return <ToolWorkbench config={config} />;
}
