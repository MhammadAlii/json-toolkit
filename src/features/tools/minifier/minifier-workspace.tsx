"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { DownloadIcon } from "@/components/icons/download";
import { JsonInputPanel, toolPanelHeight } from "@/components/tool/json-input-panel";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { CopyIconButton } from "@/components/ui/copy-icon-button";
import { Panel } from "@/components/ui/panel";
import { PanelTitle } from "@/components/ui/panel-title";
import type { LintError } from "@/core/json/lint";
import { formatBytes } from "@/core/text/format-bytes";
import { explain } from "@/features/tools/validator/validator";
import { useDownload } from "@/hooks/use-download";
import { gzipSize, minify } from "./minifier";
import { MinifierDistributionChart } from "./minifier-distribution-chart";
import { MinifierReductionCard } from "./minifier-reduction-card";
import { MinifierStatCard } from "./minifier-stat-card";

const headline = (error: LintError) => {
  const e = explain(error);
  return `${e.lead}${e.token ?? ""}${e.trail}`;
};

const split = (bytes: number) => formatBytes(bytes).split(" ");

export function MinifierWorkspace() {
  const [input, setInput] = useState("");
  const [gzip, setGzip] = useState<{ output: string; bytes: number | null }>();
  const download = useDownload();

  const text = useDeferredValue(input);
  const result = useMemo(() => minify(text), [text]);
  const done = result.status === "minified" ? result : null;

  useEffect(() => {
    if (!done) return;
    let cancelled = false;
    gzipSize(done.output).then((bytes) => !cancelled && setGzip({ output: done.output, bytes }));
    return () => {
      cancelled = true;
    };
  }, [done]);
  const gzipBytes = done && gzip?.output === done.output ? gzip.bytes : null;

  const [originalValue, originalUnit] = done ? split(done.originalBytes) : [];
  const [minifiedValue, minifiedUnit] = done ? split(done.minifiedBytes) : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="relative grid gap-4 lg:grid-cols-[minmax(0,9fr)_minmax(0,11fr)]">
        <JsonInputPanel title="Source JSON" label="Source JSON" value={input} onChange={setInput} />
        {done && (
          <span
            aria-hidden
            className="absolute top-1/2 left-[45%] z-10 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-success/40 bg-surface px-3 py-1.5 text-xs font-bold text-success shadow-lg lg:flex"
          >
            −{done.savedPercent.toFixed(1)}% <ArrowRightIcon className="h-3 w-auto" />
          </span>
        )}
        <Panel
          className={toolPanelHeight}
          header={<PanelTitle>Minified Output</PanelTitle>}
          actions={
            <>
              {done && <span className="text-[11px] font-semibold text-success">−{done.savedPercent.toFixed(1)}%</span>}
              <span aria-hidden className="mx-1 h-4 w-px bg-border" />
              <CopyIconButton text={done?.output ?? ""} label="Copy minified JSON" />
              <Button variant="soft" size="tiny" onClick={() => done && download(done.output, "minified.json")} disabled={!done} aria-label="Download minified JSON">
                <DownloadIcon className="size-[11px]" />
              </Button>
            </>
          }
        >
          {result.status === "empty" ? null : result.status === "invalid" ? (
            <div role="alert" className="flex flex-col items-start gap-3 p-4">
              <p className="text-sm leading-5 text-danger">{headline(result.error)}</p>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href="/json-validator" variant="secondary" size="xs">
                  Explain in Validator
                </ButtonLink>
                <ButtonLink href="/json-repair" variant="secondary" size="xs">
                  Fix in Repair
                </ButtonLink>
              </div>
            </div>
          ) : (
            <pre className="p-4 font-mono text-sm leading-5 break-all whitespace-pre-wrap text-muted/90">{result.output}</pre>
          )}
        </Panel>
      </div>

      {done && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MinifierStatCard label="Original Size" value={originalValue} unit={originalUnit} />
            <MinifierStatCard
              label="Minified Size"
              value={minifiedValue}
              unit={minifiedUnit}
              note={gzipBytes && gzipBytes < done.minifiedBytes ? `≈ ${formatBytes(gzipBytes)} when gzipped` : undefined}
            />
            <div className="md:col-span-2">
              <MinifierReductionCard percent={done.savedPercent} />
            </div>
          </div>

          <MinifierDistributionChart bins={done.bins} totalBytes={done.originalBytes} />
        </>
      )}
    </div>
  );
}
