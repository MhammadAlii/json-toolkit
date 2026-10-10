import { CircleCheckIcon } from "@/components/icons/circle-check";
import type { SearchOptions } from "./deep-search";

export function DeepSearchNoResults({ query, options }: { query: string; options: SearchOptions }) {
  const tips = [
    { title: "Check your spelling", detail: "Make sure the query has no typos." },
    ...(options.exact || options.caseSensitive ? [{ title: "Turn off Exact and Aa", detail: "This runs a broader partial, case-insensitive search." }] : []),
    ...(options.mode !== "keys-values" && options.mode !== "all" ? [{ title: "Search keys and values", detail: "Switch Search mode to Keys + Values to look in both." }] : []),
    ...(options.valueType !== "any" || options.maxDepth || options.maxResults ? [{ title: "Reset the filters", detail: "A value type or depth filter may be hiding matches." }] : []),
    { title: "Try a partial query", detail: "Search for part of the key or value instead." },
  ];
  return (
    <div role="status" className="flex flex-col gap-5 p-6">
      <div>
        <h3 className="text-lg leading-7 font-bold text-heading">No matches found</h3>
        <p className="text-sm text-muted">
          Nothing matches <code className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-heading">{query}</code>.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold tracking-[0.6px] text-muted uppercase">Suggestions to try</p>
        <ul className="flex flex-col gap-3">
          {tips.map((t) => (
            <li key={t.title} className="flex gap-3">
              <CircleCheckIcon className="mt-0.5 h-3.5 w-auto shrink-0 text-success" />
              <span>
                <span className="block text-sm text-heading">{t.title}</span>
                <span className="block text-xs text-muted">{t.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
