// Percent-escapes are tinted so it's easy to see what was encoded; long URLs wrap instead of scrolling.
export function UrlCodeView({ text }: { text: string }) {
  const parts = text.split(/(%[0-9A-Fa-f]{2})/);
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
