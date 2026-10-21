"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { Delimiter } from "@/core/json/csv";
import { JsonOutputOptionsMenu } from "@/features/converters/shared/json-output-options-menu";
import { OptionSelect } from "@/features/converters/shared/option-select";
import { defaultCsvToJsonOptions, type CsvToJsonOptions } from "./csv-to-json";

export function CsvToJsonOptionsMenu({ options, onChange }: { options: CsvToJsonOptions; onChange: (options: CsvToJsonOptions) => void }) {
  const set = <K extends keyof CsvToJsonOptions>(key: K) => (value: CsvToJsonOptions[K]) => onChange({ ...options, [key]: value });
  return (
    <JsonOutputOptionsMenu options={options} onChange={onChange} defaults={defaultCsvToJsonOptions}>
      <div className="grid grid-cols-2 gap-2">
        <OptionSelect<Delimiter | "auto">
          label="Delimiter"
          value={options.delimiter}
          onChange={set("delimiter")}
          choices={[
            ["auto", "Detect"],
            [",", "Comma"],
            [";", "Semicolon"],
            ["\t", "Tab"],
            ["|", "Pipe"],
          ]}
        />
        <OptionSelect<CsvToJsonOptions["empty"]>
          label="Empty cells"
          value={options.empty}
          onChange={set("empty")}
          choices={[
            ["null", "null"],
            ["string", "Empty string"],
            ["omit", "Leave out"],
          ]}
        />
      </div>
      <Checkbox label="First row is headers" checked={options.headers} onChange={set("headers")} />
      <Checkbox label="Detect numbers, booleans and JSON" checked={options.typed} onChange={set("typed")} />
      <Checkbox label="Nest dotted headers (address.city)" checked={options.nested} onChange={set("nested")} />
      <Checkbox label="Trim spaces around cells" checked={options.trim} onChange={set("trim")} />
    </JsonOutputOptionsMenu>
  );
}
