"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { JsonOutputOptionsMenu } from "@/features/converters/shared/json-output-options-menu";
import { OptionSelect } from "@/features/converters/shared/option-select";
import { defaultSqlToJsonOptions, type SqlToJsonOptions } from "./sql-to-json";

export function SqlToJsonOptionsMenu({ options, onChange }: { options: SqlToJsonOptions; onChange: (options: SqlToJsonOptions) => void }) {
  const set = <K extends keyof SqlToJsonOptions>(key: K) => (value: SqlToJsonOptions[K]) => onChange({ ...options, [key]: value });
  return (
    <JsonOutputOptionsMenu options={options} onChange={onChange} defaults={defaultSqlToJsonOptions}>
      <div className="grid grid-cols-2 gap-2">
        <OptionSelect<SqlToJsonOptions["tables"]>
          label="Tables"
          value={options.tables}
          onChange={set("tables")}
          choices={[
            ["auto", "Array for one table"],
            ["object", "Always keyed by name"],
          ]}
        />
        <OptionSelect<SqlToJsonOptions["backslashes"]>
          label="Backslashes"
          value={options.backslashes}
          onChange={set("backslashes")}
          choices={[
            ["auto", "Detect (MySQL)"],
            ["escape", "Escapes"],
            ["literal", "Literal"],
          ]}
        />
      </div>
      <Checkbox label="Read JSON in text values" checked={options.jsonStrings} onChange={set("jsonStrings")} />
    </JsonOutputOptionsMenu>
  );
}
