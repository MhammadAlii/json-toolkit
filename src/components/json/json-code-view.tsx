import { useMemo } from "react";
import { LineGutter } from "@/components/ui/line-gutter";
import { tokenizeJson } from "@/core/json/tokenize";
import { jsonTokenClasses } from "./json-token-classes";

export function JsonCodeView({ text, lineNumbers = true }: { text: string; lineNumbers?: boolean }) {
  const tokens = useMemo(() => tokenizeJson(text), [text]);
  return (
    <div className="flex min-h-full w-max min-w-full">
      {lineNumbers && <LineGutter count={text.split("\n").length} className="sticky left-0 bg-code-bg" />}
      <pre className="flex-1 p-4 font-mono text-sm leading-5 whitespace-pre">
        <code>
          {tokens.map((t, i) => (
            <span key={i} className={jsonTokenClasses[t.type]}>
              {t.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
