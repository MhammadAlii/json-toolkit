"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Reply<O> = { id: number; output: O };

/**
 * Runs a task in a Web Worker so heavy work never blocks the page. Starting a new run cancels the
 * previous one. `fallback` runs the task on the main thread where workers are unavailable.
 */
export function useWorkerTask<I, O>(create: () => Worker, fallback: (input: I) => O) {
  const worker = useRef<Worker | null>(null);
  const runId = useRef(0);
  const [state, setState] = useState<{ pending: boolean; output: O | null }>({ pending: false, output: null });

  useEffect(() => () => worker.current?.terminate(), []);

  const run = useCallback(
    (input: I) => {
      const id = ++runId.current;
      const finish = (output: O) => id === runId.current && setState({ pending: false, output });
      if (typeof Worker === "undefined") {
        finish(fallback(input));
        return;
      }
      // A busy worker can't be interrupted, so it's replaced.
      if (state.pending) {
        worker.current?.terminate();
        worker.current = null;
      }
      try {
        worker.current ??= create();
      } catch {
        finish(fallback(input));
        return;
      }
      worker.current.onmessage = (e: MessageEvent<Reply<O>>) => finish(e.data.output);
      worker.current.onerror = () => finish(fallback(input));
      setState((s) => ({ ...s, pending: true }));
      worker.current.postMessage({ id, input });
    },
    [create, fallback, state.pending],
  );

  return { run, pending: state.pending, output: state.output };
}
