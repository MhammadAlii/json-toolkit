"use client";

import { useDeferredValue, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClipboard } from "@/hooks/use-clipboard";
import { useDownload } from "@/hooks/use-download";
import { WorkbenchOptionControl } from "./workbench-option";
import type { WorkbenchConfig, WorkbenchOptions } from "./workbench-types";

export function ToolWorkbench({ config }: { config: WorkbenchConfig }) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [opts, setOpts] = useState<WorkbenchOptions>(() => Object.fromEntries(config.options.map((o) => [o.key, o.initial])));
  const { copy, copied } = useClipboard();
  const downloadText = useDownload();

  const deferredInput = useDeferredValue(input);
  const result = useMemo(
    () => (deferredInput.trim() === "" ? null : config.run(deferredInput, opts)),
    [config, deferredInput, opts],
  );
  const output = result?.ok ? result.output : "";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setInput(await file.text());
    e.target.value = "";
  }

  return (
    <Card className="p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        {config.options.map((o) => (
          <WorkbenchOptionControl
            key={o.key}
            option={o}
            value={opts[o.key]}
            id={`${id}-${o.key}`}
            onChange={(v) => setOpts((p) => ({ ...p, [o.key]: v }))}
          />
        ))}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            Upload file
          </Button>
          <input ref={fileRef} type="file" accept={config.accept} className="hidden" onChange={onFile} />
          <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <label htmlFor={`${id}-in`} className="mb-1.5 text-sm font-medium">
            {config.inputLabel}
          </label>
          <textarea
            id={`${id}-in`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="Paste here…"
            className="code-area"
          />
        </div>
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor={`${id}-out`} className="text-sm font-medium">
              {config.outputLabel}
            </label>
            <div className="flex gap-2">
              <Button variant="outline" size="xs" onClick={() => copy(output)} disabled={!output}>
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => downloadText(output, config.download.filename, config.download.mime)}
                disabled={!output}
              >
                Download
              </Button>
            </div>
          </div>
          <textarea id={`${id}-out`} value={output} readOnly spellCheck={false} className="code-area" placeholder="Result appears here" />
        </div>
      </div>

      <div role="status" aria-live="polite" className="mt-3 min-h-6 text-sm">
        {result && !result.ok && <p className="text-danger">✕ {result.error}</p>}
        {result?.ok && result.note && <p className="text-success">✓ {result.note}</p>}
      </div>
    </Card>
  );
}
