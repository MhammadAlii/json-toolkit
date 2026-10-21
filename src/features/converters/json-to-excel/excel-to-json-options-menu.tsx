"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { JsonOutputOptionsMenu } from "@/features/converters/shared/json-output-options-menu";
import { OptionSelect } from "@/features/converters/shared/option-select";
import { defaultExcelToJsonOptions, type ExcelToJsonOptions } from "./excel-to-json";

export function ExcelToJsonOptionsMenu({ options, onChange }: { options: ExcelToJsonOptions; onChange: (options: ExcelToJsonOptions) => void }) {
  const set = <K extends keyof ExcelToJsonOptions>(key: K) => (value: ExcelToJsonOptions[K]) => onChange({ ...options, [key]: value });
  return (
    <JsonOutputOptionsMenu options={options} onChange={onChange} defaults={defaultExcelToJsonOptions}>
      <div className="grid grid-cols-2 gap-2">
        <OptionSelect<ExcelToJsonOptions["sheets"]>
          label="Sheets"
          value={options.sheets}
          onChange={set("sheets")}
          choices={[
            ["one", "One at a time"],
            ["all", "All, by name"],
          ]}
        />
        <OptionSelect<ExcelToJsonOptions["dates"]>
          label="Dates"
          value={options.dates}
          onChange={set("dates")}
          choices={[
            ["iso", "ISO 8601 text"],
            ["serial", "Excel numbers"],
          ]}
        />
        <OptionSelect<ExcelToJsonOptions["empty"]>
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
      <Checkbox label="Nest dotted headers (address.city)" checked={options.nested} onChange={set("nested")} />
      <Checkbox label="Read JSON in cells" checked={options.json} onChange={set("json")} />
    </JsonOutputOptionsMenu>
  );
}
