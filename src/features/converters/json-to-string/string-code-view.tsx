// Escape sequences are tinted so it's easy to see what was escaped; long strings wrap instead of scrolling.
export function StringCodeView({ text }: { text: string }) {
  const parts = text.split(/(\\u[0-9a-fA-F]{4}|\\.)/);
  return (
    <pre className="p-4 font-mono text-sm leading-5 break-all whitespace-pre-wrap text-json-string">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-json-number">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </pre>
  );
}
