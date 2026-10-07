"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { jsonToYaml } from "./json-to-yaml";

const config: WorkbenchConfig = {
  inputLabel: "JSON input",
  outputLabel: "YAML",
  options: [],
  run: (input) => jsonToYaml(input),
  sample: '{"apiVersion":"v1","kind":"Service","metadata":{"name":"web","labels":{"app":"web"}},"spec":{"ports":[{"port":80,"targetPort":8080}],"selector":{"app":"web"}}}',
  download: { filename: "output.yaml", mime: "application/yaml" },
  accept: jsonAccept,
};

export function JsonToYamlTool() {
  return <ToolWorkbench config={config} />;
}
