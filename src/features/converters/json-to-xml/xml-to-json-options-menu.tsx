"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { JsonOutputOptionsMenu } from "@/features/converters/shared/json-output-options-menu";
import { OptionSelect } from "@/features/converters/shared/option-select";
import { defaultXmlToJsonOptions, type XmlToJsonOptions } from "./xml-to-json";

export function XmlToJsonOptionsMenu({ options, onChange }: { options: XmlToJsonOptions; onChange: (options: XmlToJsonOptions) => void }) {
  const set = <K extends keyof XmlToJsonOptions>(key: K) => (value: XmlToJsonOptions[K]) => onChange({ ...options, [key]: value });
  return (
    <JsonOutputOptionsMenu options={options} onChange={onChange} defaults={defaultXmlToJsonOptions}>
      <div className="grid grid-cols-2 gap-2">
        <OptionSelect label="Attributes" value={options.attributes} onChange={set("attributes")} choices={[["prefixed", "@name keys"], ["merged", "Plain keys"], ["omit", "Leave out"]]} />
        <OptionSelect label="Arrays" value={options.arrays} onChange={set("arrays")} choices={[["repeated", "Repeated elements"], ["always", "Always"]]} />
        <OptionSelect label="Values" value={options.values} onChange={set("values")} choices={[["typed", "Numbers & booleans"], ["strings", "All strings"]]} />
        <OptionSelect label="CDATA" value={options.cdata} onChange={set("cdata")} choices={[["text", "Merge into text"], ["key", "Keep as #cdata"]]} />
        <OptionSelect label="Namespaces" value={options.namespaces} onChange={set("namespaces")} choices={[["keep", "Keep prefixes"], ["strip", "Remove"]]} />
      </div>
      <Checkbox label="Keep the root element" checked={options.keepRoot} onChange={set("keepRoot")} />
    </JsonOutputOptionsMenu>
  );
}
