"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { SchemaResultCard } from "./schema-result-card";
import { SchemaTemplateMenu } from "./schema-template-menu";
import { checkAgainstSchema } from "./schema-validator";

export function SchemaWorkspace() {
  const [data, setData] = useState("");
  const [schema, setSchema] = useState("");
  const [notice, setNotice] = useState("");

  const deferredData = useDeferredValue(data);
  const deferredSchema = useDeferredValue(schema);
  const ready = deferredData.trim() !== "" && deferredSchema.trim() !== "";
  const check = useMemo(() => (ready ? checkAgainstSchema(deferredData, deferredSchema) : null), [ready, deferredData, deferredSchema]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel title="Target JSON" label="Target JSON" value={data} onChange={setData} />
        <JsonInputPanel
          title="JSON Schema"
          label="JSON Schema"
          value={schema}
          onChange={setSchema}
          extraActions={
            <SchemaTemplateMenu
              onPick={(t) => {
                const built = t.build(data);
                setNotice(built ? "" : "Fix the target JSON first to infer a schema from it.");
                if (built) setSchema(built);
              }}
            />
          }
        />
      </div>
      {notice && (
        <p role="alert" className="-mt-4 text-xs text-tint-amber">
          {notice}
        </p>
      )}
      {check && <SchemaResultCard check={check} />}
    </div>
  );
}
