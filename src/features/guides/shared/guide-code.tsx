import { jsonTokenClasses } from "@/components/json/json-token-classes";
import { tokenizeJson } from "@/core/json/tokenize";

// A code sample in an article. JSON is coloured like the tools' output; other languages are shown plain.
export function GuideCode({ code, lang, caption }: { code: string; lang: "json" | "yaml" | "js" | "python" | "shell" | "text"; caption?: string }) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <pre className="overflow-x-auto rounded-xl border border-border bg-code-bg p-4 font-mono text-sm leading-6 text-heading">
        <code>
          {lang === "json"
            ? tokenizeJson(code).map((t, i) => (
                <span key={i} className={jsonTokenClasses[t.type]}>
                  {t.value}
                </span>
              ))
            : code}
        </code>
      </pre>
      {caption && <figcaption className="text-xs leading-5 text-muted">{caption}</figcaption>}
    </figure>
  );
}
