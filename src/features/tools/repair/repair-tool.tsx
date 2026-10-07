"use client";

import { ToolWorkbench } from "@/components/tool/tool-workbench";
import { jsonAccept, type WorkbenchConfig } from "@/components/tool/workbench-types";
import { repairJson } from "./repair";

const config: WorkbenchConfig = {
  inputLabel: "Broken JSON",
  outputLabel: "Repaired JSON",
  options: [],
  run: (input) => repairJson(input),
  sample: "{name: 'Ada', active: True, tags: ['math', 'computing',], // comment\n  address: {city: 'London'",
  download: { filename: "repaired.json", mime: "application/json" },
  accept: jsonAccept,
};

export function RepairTool() {
  return <ToolWorkbench config={config} />;
}
