"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AlignLeftIcon } from "@/components/icons/align-left";
import { ShieldAlertIcon } from "@/components/icons/shield-alert";
import { JsonCodeView } from "@/components/json/json-code-view";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { useJsonColors } from "@/hooks/use-json-colors";
import { useStoredOptions } from "@/hooks/use-stored-options";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats, statusStat } from "@/features/converters/shared/converter-stats";
import { byteSize, parseInput, positionedError } from "@/features/converters/shared/converter";
import { SwapButton } from "@/features/converters/shared/swap-button";
import { defaultSqlOptions, jsonToSql, type SqlOptions } from "./json-to-sql";
import { SqlCodeView } from "./sql-code-view";
import { SqlColumnsCard } from "./sql-columns-card";
import { SqlOptionsMenu } from "./sql-options-menu";
import { defaultSqlToJsonOptions, sqlToJson, type SqlToJsonOptions } from "./sql-to-json";
import { SqlToJsonOptionsMenu } from "./sql-to-json-options-menu";

// One page for both directions: JSON → SQL, and SQL → JSON. Swap flips the direction and carries the
// current result over as the new input.
export function JsonToSqlWorkspace() {
  const [input, setInput] = useState("");
  const [toSql, setToSql] = useState(true);
  const [rootKey, setRootKey] = useState<string>();
  const [names, setNames] = useState<Record<string, string>>({});
  const [options, setOptions] = useStoredOptions<SqlOptions>("json-toolkit:sql-options", defaultSqlOptions);
  const [jsonOptions, setJsonOptions] = useStoredOptions<SqlToJsonOptions>("json-toolkit:sql-json-options", defaultSqlToJsonOptions);
  const colors = useJsonColors();

  const text = useDeferredValue(input);
  const parsed = useMemo(() => (toSql ? parseInput(text) : null), [toSql, text]);
  const result = useMemo(() => (parsed?.status === "valid" ? jsonToSql(parsed.value, options, names, rootKey) : null), [parsed, options, names, rootKey]);
  const ok = result?.ok ? result : null;
  const suggestions = result && !rootKey ? result.suggestions : [];
  const json = useMemo(() => (!toSql && text.trim() ? sqlToJson(text, jsonOptions) : null), [toSql, text, jsonOptions]);

  const swap = () => {
    setToSql(!toSql);
    setRootKey(undefined);
    if (toSql && ok) setInput(ok.sql);
    else if (!toSql && json?.ok) setInput(json.json);
  };

  if (!toSql) {
    return (
      <div className="flex flex-col gap-8">
        {json?.ok && json.notes.length > 0 && (
          <div role="status" className="flex flex-col gap-2 rounded-xl border border-tint-amber/30 bg-tint-amber/5 px-4 py-3 text-sm text-tint-amber">
            {json.notes.map((n) => (
              <p key={n} className="flex items-center gap-2">
                <ShieldAlertIcon className="size-3.5 shrink-0" /> {n}
              </p>
            ))}
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          <JsonInputPanel
            title="Input SQL"
            label="SQL input"
            placeholder="Paste INSERT statements or a database dump…"
            value={input}
            onChange={setInput}
            extraActions={<SwapButton to="JSON → SQL" onClick={swap} />}
          />
          <div style={colors.style} className="min-w-0">
            <ConverterOutputPanel
              title="JSON Output"
              output={json?.ok ? json.json : ""}
              error={json && !json.ok ? positionedError(json) : undefined}
              fixLinks={false}
              filename="converted.json"
              mime="application/json"
              options={<SqlToJsonOptionsMenu options={jsonOptions} onChange={setJsonOptions} />}
            >
              {json?.ok && <JsonCodeView text={json.json} />}
            </ConverterOutputPanel>
          </div>
        </div>
        {text.trim() !== "" && (
          <ConverterStats
            stats={[
              { label: "Rows", value: json?.ok ? json.rows.toLocaleString() : "—" },
              { label: "Tables", value: json?.ok ? json.tables.length.toLocaleString() : "—" },
              { label: "Statements", value: json?.ok ? json.statements.toLocaleString() : "—" },
              { label: "Input Size", value: byteSize(text) },
              { label: "Output Size", value: json?.ok ? byteSize(json.json) : "—" },
              statusStat(!!json?.ok, "Can't read SQL"),
            ]}
          />
        )}
      </div>
    );
  }

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
            <>
              <SwapButton to="SQL → JSON" onClick={swap} />
              <Button variant="soft" size="tiny" onClick={() => parsed?.status === "valid" && setInput(JSON.stringify(parsed.value, null, 2))} disabled={parsed?.status !== "valid"}>
                <AlignLeftIcon className="h-[11px] w-auto" /> Format
              </Button>
            </>
          }
        />
        <div style={colors.style} className="min-w-0">
          <ConverterOutputPanel
            title="SQL Output"
            output={ok?.sql ?? ""}
            error={parsed?.status === "invalid" ? parsed.error : undefined}
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

      {parsed && parsed.status !== "empty" && (
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
