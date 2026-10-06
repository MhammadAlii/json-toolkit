import type { TransformResult } from "@/core/json/parse";

export type WorkbenchOption =
  | { kind: "select"; key: string; label: string; choices: { value: string; label: string }[]; initial: string }
  | { kind: "checkbox"; key: string; label: string; initial: boolean }
  | { kind: "text"; key: string; label: string; initial: string };

export type WorkbenchOptions = Record<string, string | boolean>;

export type WorkbenchConfig = {
  inputLabel: string;
  outputLabel: string;
  options: WorkbenchOption[];
  run: (input: string, opts: WorkbenchOptions) => TransformResult;
  sample: string;
  download: { filename: string; mime: string };
  accept: string;
};

export const jsonAccept = ".json,application/json,text/plain";
