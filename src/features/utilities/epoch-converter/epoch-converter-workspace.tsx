"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ClockIcon } from "@/components/icons/clock";
import { JsonInputPanel } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { formatUtc } from "@/core/text/format-date";
import { useNow } from "@/hooks/use-now";
import { useStoredState } from "@/hooks/use-stored-state";
import { ConverterOutputPanel } from "@/features/converters/shared/converter-output-panel";
import { ConverterStats } from "@/features/converters/shared/converter-stats";
import { defaultEpochOptions, formatZoned, parseTime, timeFormats, unitLabels, type EpochOptions } from "./epoch";
import { EpochFormatsList } from "./epoch-formats-list";
import { EpochOptionsMenu } from "./epoch-options-menu";
import { EpochResultsTable, type EpochRow } from "./epoch-results-table";

// "+03:00" for the browser's current offset from UTC.
function utcOffset(): string {
  const minutes = -new Date().getTimezoneOffset();
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

export function EpochConverterWorkspace() {
  const [input, setInput] = useState("");
  const [stored, setOptions] = useStoredState<EpochOptions>("json-toolkit:epoch-options", defaultEpochOptions);
  const storedKey = JSON.stringify(stored);
  const options = useMemo<EpochOptions>(() => ({ ...defaultEpochOptions, ...(JSON.parse(storedKey) as Partial<EpochOptions>) }), [storedKey]);
  const now = useNow();

  const text = useDeferredValue(input);
  const rows = useMemo<EpochRow[]>(
    () =>
      text
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => ({ input: line.trim(), parsed: parseTime(line, options) })),
    [text, options],
  );
  const single = rows.length === 1 ? rows[0].parsed : null;
  const formats = single?.ok ? timeFormats(single.ms, now) : null;
  const converted = rows.filter((r) => r.parsed.ok).length;

  // Copying gives every format for one value, or a tab-separated table for several.
  const output = formats
    ? formats.map((f) => `${f.label}: ${f.value}`).join("\n")
    : rows.length > 1
      ? ["Input\tUTC\tYour time zone", ...rows.map((r) => (r.parsed.ok ? `${r.input}\t${formatUtc(Math.floor(r.parsed.ms) / 1000)}\t${formatZoned(r.parsed.ms)}` : `${r.input}\t${r.parsed.error}`))].join("\n")
      : "";

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <JsonInputPanel
          title="Timestamps or Dates"
          label="Timestamps or dates, one per line"
          placeholder={"Paste a Unix timestamp or a date, one per line…\n1704447015\n2024-01-05T09:30:15Z"}
          value={input}
          onChange={setInput}
          extraActions={
            <Button variant="soft" size="tiny" onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}>
              <ClockIcon className="h-[11px] w-auto" /> Now
            </Button>
          }
        />
        <ConverterOutputPanel
          title="Converted Time"
          output={output}
          error={single && !single.ok ? single.error : undefined}
          fixLinks={false}
          filename="timestamps.txt"
          mime="text/plain"
          options={<EpochOptionsMenu options={options} onChange={setOptions} />}
        >
          {formats && single?.ok && (
            <EpochFormatsList formats={formats} note={single.unit ? `Read as a Unix timestamp in ${unitLabels[single.unit].toLowerCase()}.` : "Read as a date."} />
          )}
          {rows.length > 1 && <EpochResultsTable rows={rows} now={now} />}
        </ConverterOutputPanel>
      </div>

      {rows.length > 0 && (
        <ConverterStats
          stats={[
            { label: "Current Unix Time", value: now === null ? "—" : String(now) },
            { label: "Your Time Zone", value: now === null ? "—" : Intl.DateTimeFormat().resolvedOptions().timeZone },
            { label: "UTC Offset", value: now === null ? "—" : utcOffset() },
            { label: "Converted", value: `${converted.toLocaleString()} of ${rows.length.toLocaleString()}` },
            converted === rows.length ? { label: "Status", value: "Successful", tone: "success" } : { label: "Status", value: `${rows.length - converted} not understood`, tone: "danger" },
            { label: "Processing", value: "Local (Client)", tone: "brand" },
          ]}
        />
      )}
    </div>
  );
}
