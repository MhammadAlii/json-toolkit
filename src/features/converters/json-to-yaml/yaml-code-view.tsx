import { LineGutter } from "@/components/ui/line-gutter";

const tone = {
  key: "text-json-key",
  string: "text-json-string",
  number: "text-json-number",
  literal: "text-json-boolean",
  punct: "text-json-punct",
};

// Colours a YAML scalar the way the JSON views colour JSON values.
function Scalar({ text }: { text: string }) {
  if (/^"/.test(text) || /^[|>]/.test(text)) return <span className={tone.string}>{text}</span>;
  if (/^(true|false|null)$/.test(text)) return <span className={tone.literal}>{text}</span>;
  if (/^-?\d/.test(text)) return <span className={tone.number}>{text}</span>;
  if (/^[[{]/.test(text)) return <span className={tone.punct}>{text}</span>;
  return <span className={tone.string}>{text}</span>;
}

function Line({ line }: { line: string }) {
  const m = /^(\s*)(- )?(?:("(?:[^"\\]|\\.)*"|[^:"\s][^:]*?)(:)(?=\s|$))?(\s*)(.*)$/.exec(line);
  if (!m) return <>{line}</>;
  const [, indent, dash, key, colon, gap, rest] = m;
  return (
    <>
      {indent}
      {dash && <span className={tone.punct}>{dash}</span>}
      {key && <span className={tone.key}>{key}</span>}
      {colon && <span className={tone.punct}>{colon}</span>}
      {gap}
      {rest && (key || dash || !indent ? <Scalar text={rest} /> : <span className={tone.string}>{rest}</span>)}
    </>
  );
}

// Lines inside a literal block (after a `|` line) are plain text, so they're coloured as strings.
function classify(lines: string[]): { line: string; inBlock: boolean }[] {
  let blockIndent: number | null = null;
  return lines.map((line) => {
    const indent = line.length - line.trimStart().length;
    if (blockIndent !== null && (line === "" || indent >= blockIndent)) return { line, inBlock: true };
    blockIndent = /: [|][-+]?$|^\s*- [|][-+]?$/.test(line) ? indent + 1 : null;
    return { line, inBlock: false };
  });
}

export function YamlCodeView({ text }: { text: string }) {
  const lines = classify(text.split("\n"));
  return (
    <div className="flex min-h-full">
      <LineGutter count={lines.length} className="text-muted/40" />
      <pre className="min-w-0 flex-1 overflow-x-auto p-4 font-mono text-sm leading-5">
        {lines.map(({ line, inBlock }, i) =>
          inBlock ? (
            <div key={i} className={tone.string}>
              {line || " "}
            </div>
          ) : (
            <div key={i}>
              <Line line={line} />
            </div>
          ),
        )}
      </pre>
    </div>
  );
}
