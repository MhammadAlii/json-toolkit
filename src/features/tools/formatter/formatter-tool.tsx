"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { formatJson, type Indent } from "./formatter";

const config: WorkbenchConfig = {
  inputLabel: "JSON input",
  outputLabel: "Formatted JSON",
  options: [
    {
      kind: "select",
      key: "indent",
      label: "Indent",
      initial: "2",
      choices: [
        { value: "2", label: "2 spaces" },
        { value: "4", label: "4 spaces" },
        { value: "tab", label: "Tabs" },
      ],
    },
    { kind: "checkbox", key: "sortKeys", label: "Sort keys", initial: false },
  ],
  run: (input, o) => formatJson(input, o.indent as Indent, o.sortKeys as boolean),
  sample: '{"id":1042,"name":"Ada Lovelace","email":"ada@example.com","active":true,"roles":["admin","editor"],"address":{"city":"London","postcode":"W1A 1AA"},"lastLogin":null}',
  download: { filename: "formatted.json", mime: "application/json" },
  accept: jsonAccept,
};

export function FormatterTool() {
  return <ToolWorkbench config={config} />;
}
