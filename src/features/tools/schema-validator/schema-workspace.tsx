"use client";

import { useState } from "react";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SchemaResultCard } from "./schema-result-card";
import { SchemaTemplateMenu } from "./schema-template-menu";
import { checkAgainstSchema, type SchemaCheck } from "./schema-validator";

const panelHeight = "h-[360px] lg:h-[480px]";

export function SchemaWorkspace() {
  const [data, setData] = useState("");
  const [schema, setSchema] = useState("");
  const [checked, setChecked] = useState<{ data: string; schema: string; result: SchemaCheck }>();
  const [notice, setNotice] = useState("");

  const canValidate = data.trim() !== "" && schema.trim() !== "";
  const validate = () => setChecked({ data, schema, result: checkAgainstSchema(data, schema) });
  const stale = !!checked && (checked.data !== data || checked.schema !== schema);

  return (
    <Card
      tone="surface"
      className="grid gap-6 p-4 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_360px]"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canValidate) {
          e.preventDefault();
          validate();
        }
      }}
    >
      <JsonInputPanel
        title="Target JSON"
        label="Target JSON"
        value={data}
        onChange={setData}
        className={panelHeight}
      />
      <JsonInputPanel
        title="JSON Schema"
        label="JSON Schema"
        value={schema}
        onChange={setSchema}
        className={panelHeight}
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
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-2 xl:col-span-1">
        <SchemaResultCard check={checked?.result ?? null} stale={stale} />
        {notice && (
          <p role="alert" className="-mt-3 text-xs text-tint-amber">
            {notice}
          </p>
        )}
        <Button size="lg" className="w-full" onClick={validate} disabled={!canValidate} aria-keyshortcuts="Meta+Enter">
          {checked ? "Re-Validate" : "Validate"}
        </Button>
      </div>
    </Card>
  );
}
