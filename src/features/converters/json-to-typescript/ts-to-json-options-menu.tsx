"use client";

import { JsonOutputOptionsMenu } from "@/features/converters/shared/json-output-options-menu";
import { OptionSelect } from "@/features/converters/shared/option-select";
import { defaultTsToJsonOptions, type TsToJsonOptions } from "./typescript-to-json";

export function TsToJsonOptionsMenu({ options, onChange }: { options: TsToJsonOptions; onChange: (options: TsToJsonOptions) => void }) {
  const set = <K extends keyof TsToJsonOptions>(key: K) => (value: TsToJsonOptions[K]) => onChange({ ...options, [key]: value });
  return (
    <JsonOutputOptionsMenu options={options} onChange={onChange} defaults={defaultTsToJsonOptions}>
      <div className="grid grid-cols-2 gap-2">
        <OptionSelect<TsToJsonOptions["values"]>
          label="Values"
          value={options.values}
          onChange={set("values")}
          choices={[
            ["examples", "Realistic examples"],
            ["placeholders", "Placeholders"],
          ]}
        />
        <OptionSelect<TsToJsonOptions["optional"]>
          label="Optional fields"
          value={options.optional}
          onChange={set("optional")}
          choices={[
            ["include", "Include"],
            ["omit", "Leave out"],
          ]}
        />
        <OptionSelect<TsToJsonOptions["arrayItems"]>
          label="Array items"
          value={options.arrayItems}
          onChange={set("arrayItems")}
          choices={[
            [1, "1"],
            [2, "2"],
            [3, "3"],
          ]}
        />
      </div>
    </JsonOutputOptionsMenu>
  );
}
