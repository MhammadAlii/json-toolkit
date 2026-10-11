"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput } from "@/features/converters/shared/converter";
import { defaultSqlOptions, jsonToSql, type SqlOptions } from "./json-to-sql";
import { SqlCodeView } from "./sql-code-view";
import { SqlColumnsCard } from "./sql-columns-card";
import { SqlOptionsMenu } from "./sql-options-menu";

export function JsonToSqlWorkspace() {
  const [input, setInput] = useState("");
  const [rootKey, setRootKey] = useState<string>();
  const [names, setNames] = useState<Record<string, string>>({});
  const [stored, setOptions] = useStoredState<SqlOptions>("json-toolkit:sql-options", defaultSqlOptions);
  // Stored options are re-read each render, so memoise on their JSON to keep the SQL cached.
  const storedKey = JSON.stringify(stored);
  const options = useMemo<SqlOptions>(() => ({ ...defaultSqlOptions, ...(JSON.parse(storedKey) as Partial<SqlOptions>) }), [storedKey]);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => parseInput(text), [text]);
  const result = useMemo(() => (parsed.status === "valid" ? jsonToSql(parsed.value, options, names, rootKey) : null), [parsed, options, names, rootKey]);
  const ok = result?.ok ? result : null;
  const suggestions = result && !rootKey ? result.suggestions : [];

  return (
    <div className="flex flex-col gap-8">
      {suggestions.length > 0 && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-tint-amber">
            <ShieldAlertIcon className="size-3.5 shrink-0" /> This object holds a list of records; each record can become a row.
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Button key={s.key} variant="secondary" size="xs" onClick={() => setRootKey(s.key)}>
                Use “{s.key}” ({s.rows.toLocaleString()} {s.rows === 1 ? "row" : "rows"})
              </Button>
            ))}
          </div>
        </div>
      )}
      {rootKey && (
        <p className="-mb-4 flex items-center gap-2 text-xs text-muted">
          Converting the “{rootKey}” array.
          <button type="button" onClick={() => setRootKey(undefined)} className="font-semibold text-brand">
            Use the whole JSON
          </button>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title="Input JSON"
          label="JSON input"
          value={input}
          onChange={(next) => {
            setInput(next);
            setRootKey(undefined);
          }}
          extraActions={
            <Button variant="soft" size="tiny" onClick={() => parsed.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed.status !== "valid"}>
              <AlignLeftIcon className="h-[11px] w-auto" /> Format
            </Button>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title="SQL Output"
            output={ok?.sql ?? ""}
            error={parsed.status === "invalid" ? parsed.error : undefined}
            filename={`${options.table || "data"}.sql`}
            mime="application/sql"
            options={<SqlOptionsMenu options={options} keys={ok?.columns.map((c) => c.key) ?? []} onChange={setOptions} />}
          >
            {result && !result.ok && <p className="p-4 text-sm text-muted">{result.error}</p>}
            {ok && <SqlCodeView sql={ok.sql} />}
          </ConverterOutputPanel>
        </div>
      </div>

      {ok && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <SqlColumnsCard columns={ok.columns} names={names} onRename={(key, name) => setNames((n) => ({ ...n, [key]: name }))} />
          <div className="flex flex-col gap-4">
            {ok.notes.map((n) => (
              <p key={n} className="flex gap-2 rounded-xl border border-tint-amber/30 bg-tint-amber/5 p-4 text-xs leading-5 text-tint-amber">
                <ShieldAlertIcon className="mt-0.5 size-3.5 shrink-0" /> {n}
              </p>
            ))}
            <p className="flex gap-2 rounded-xl border border-tint-amber/30 bg-tint-amber/5 p-4 text-xs leading-5 text-muted">
              <ShieldAlertIcon className="mt-0.5 size-3.5 shrink-0 text-tint-amber" />
              <span>
                <strong className="block text-tint-amber">Review before running</strong>
                Check the generated SQL before running it against a production database. Column types are best-effort guesses from your data.
              </span>
            </p>
          </div>
        </div>
      )}

      {parsed.status !== "empty" && (
        <ConverterStats
          stats={[
            { label: "Rows", value: ok ? ok.rows.toLocaleString() : "—" },
            { label: "Columns", value: ok ? ok.columns.length.toLocaleString() : "—" },
            { label: "Statements", value: ok ? ok.statements.toLocaleString() : "—" },
            { label: "Input Size", value: byteSize(text) },
            { label: "Output Size", value: ok ? byteSize(ok.sql) : "—" },
            parsed.status === "valid" ? { label: "Processing", value: "Local (Client)", tone: "brand" } : { label: "Status", value: "Invalid JSON", tone: "danger" },
          ]}
        />
      )}
    </div>
  );
}
