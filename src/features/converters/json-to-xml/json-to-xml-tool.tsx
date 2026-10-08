"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { jsonToXml } from "./json-to-xml";

const config: WorkbenchConfig = {
  inputLabel: "JSON input",
  outputLabel: "XML",
  options: [{ kind: "text", key: "root", label: "Root element", initial: "root" }],
  run: (input, o) => jsonToXml(input, o.root as string),
  download: { filename: "output.xml", mime: "application/xml" },
  accept: jsonAccept,
};

export function JsonToXmlTool() {
  return <ToolWorkbench config={config} />;
}
