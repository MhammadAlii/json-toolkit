import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { fixJsonErrorsGuide } from "./meta";

const mistakes: { id: string; title: string; bad: string; good: string; error: string; text: React.ReactNode }[] = [
  {
    id: "trailing-comma",
    title: "1. A trailing comma",
    bad: '{\n  "name": "Ann",\n  "age": 30,\n}',
    good: '{\n  "name": "Ann",\n  "age": 30\n}',
    error: "Expected double-quoted property name in JSON at position 32 (line 4 column 1)",
    text: (
      <>
        JavaScript allows a comma after the last item, JSON doesn&apos;t. After a comma the parser expects another key, finds{" "}
        <InlineCode>{"}"}</InlineCode> instead and stops. The same applies to arrays: <InlineCode>[1, 2, 3,]</InlineCode> is invalid.
      </>
    ),
  },
  {
    id: "unquoted-keys",
    title: "2. Keys without double quotes",
    bad: '{ name: "Ann" }',
    good: '{ "name": "Ann" }',
    error: "Expected property name or '}' in JSON at position 2 (line 1 column 3)",
    text: <>Every key in JSON is a string in double quotes. Object literals in JavaScript don&apos;t need them, which is why this one is so common when JSON is written by hand.</>,
  },
  {
    id: "single-quotes",
    title: "3. Single quotes",
    bad: "{ \"name\": 'Ann' }",
    good: '{ "name": "Ann" }',
    error: "Unexpected token ''', \"{ \"name\": 'Ann' }\" is not valid JSON",
    text: (
      <>
        JSON strings use double quotes only. Single-quoted text usually comes from Python&apos;s <InlineCode>str()</InlineCode> of a
        dictionary or from copying JavaScript; use <InlineCode>json.dumps()</InlineCode> or <InlineCode>JSON.stringify()</InlineCode> to
        produce real JSON instead.
      </>
    ),
  },
  {
    id: "comments",
    title: "4. Comments",
    bad: '{\n  "port": 8080 // default\n}',
    good: '{\n  "port": 8080\n}',
    error: "Expected ',' or '}' after property value in JSON at position 17 (line 2 column 16)",
    text: <>JSON has no comment syntax. Config files that allow comments (such as VS Code&apos;s settings) use JSONC, a looser variant that standard parsers reject.</>,
  },
  {
    id: "missing-comma",
    title: "5. A missing comma",
    bad: '{\n  "a": 1\n  "b": 2\n}',
    good: '{\n  "a": 1,\n  "b": 2\n}',
    error: "Expected ',' or '}' after property value in JSON at position 13 (line 3 column 3)",
    text: <>Easy to miss when lines are added or reordered. The position in the error points just after the value that needs a comma.</>,
  },
  {
    id: "unclosed",
    title: "6. An unclosed bracket or brace",
    bad: '{ "tags": ["a", "b" }',
    good: '{ "tags": ["a", "b"] }',
    error: "Expected ',' or ']' after array element in JSON at position 20 (line 1 column 21)",
    text: (
      <>
        Every <InlineCode>[</InlineCode> needs a <InlineCode>]</InlineCode> and every <InlineCode>{"{"}</InlineCode> a{" "}
        <InlineCode>{"}"}</InlineCode>, closed in the right order. If the text simply stops (a cut-off download or log line), the
        error is <InlineCode>Unexpected end of JSON input</InlineCode>.
      </>
    ),
  },
  {
    id: "non-json-values",
    title: "7. Values JSON doesn't have",
    bad: '{ "total": NaN, "next": undefined }',
    good: '{ "total": null, "next": null }',
    error: "Unexpected token 'N', ...\" \"total\": NaN, \"next\"... is not valid JSON",
    text: (
      <>
        JSON values are strings, numbers, <InlineCode>true</InlineCode>, <InlineCode>false</InlineCode>, <InlineCode>null</InlineCode>,
        objects and arrays. <InlineCode>NaN</InlineCode>, <InlineCode>Infinity</InlineCode>, <InlineCode>undefined</InlineCode>, dates
        and functions aren&apos;t. Python&apos;s <InlineCode>json.dumps</InlineCode> writes <InlineCode>NaN</InlineCode> by default, so
        JSON from Python can fail in JavaScript; pass <InlineCode>allow_nan=False</InlineCode> to catch it early.
      </>
    ),
  },
  {
    id: "line-breaks",
    title: "8. Raw line breaks or tabs inside a string",
    bad: '{ "note": "line one\nline two" }',
    good: '{ "note": "line one\\nline two" }',
    error: "Bad control character in string literal in JSON at position 19 (line 1 column 20)",
    text: (
      <>
        A string can&apos;t contain a real line break or tab; they must be escaped as <InlineCode>\n</InlineCode> and{" "}
        <InlineCode>\t</InlineCode>. This happens when JSON is built by joining strings by hand instead of with a JSON library.
      </>
    ),
  },
];

export function FixJsonErrorsGuidePage() {
  return (
    <GuideLayout guide={fixJsonErrorsGuide}>
      <p>
        A JSON parse error means the text isn&apos;t valid JSON, so the parser stops at the first character it can&apos;t make sense of.
        The message tells you <em>what</em> it expected and <em>where</em>. Once you know the eight mistakes behind almost every one of
        them, most errors take seconds to fix. The quickest route is to paste your JSON into the{" "}
        <GuideLink href="/json-validator">JSON Validator</GuideLink>, which points to the exact line and column, or let{" "}
        <GuideLink href="/json-repair">JSON Repair</GuideLink> fix the common cases automatically.
      </p>

      <GuideSection id="reading-the-error" title="Reading the error message">
        <p>The same mistake is worded differently depending on where the JSON is parsed. For a trailing comma:</p>
        <GuideCode
          lang="text"
          code={`Chrome / Node.js:  Expected double-quoted property name in JSON at position 8 (line 1 column 9)
Firefox:           JSON.parse: expected double-quoted property name at line 1 column 9 of the JSON data
Python:            json.decoder.JSONDecodeError: Expecting property name enclosed in double quotes: line 1 column 9 (char 8)`}
        />
        <p>
          All three point to the same place. <strong className="text-heading">Position</strong> (or <em>char</em>) counts characters from 0;
          line and column count from 1. Go to that spot: the real mistake is usually right there or just before it.
        </p>
      </GuideSection>

      <GuideSection id="unexpected-token-less-than" title="“Unexpected token <”: you got HTML, not JSON">
        <p>
          If the error mentions <InlineCode>&lt;</InlineCode> at position 0, for example{" "}
          <InlineCode>Unexpected token &apos;&lt;&apos;, &quot;&lt;!DOCTYPE &quot;... is not valid JSON</InlineCode>, there is nothing wrong
          with your parsing code. The server sent back an HTML page, typically a 404, a 500 error page or a login redirect.
        </p>
        <GuideCode
          lang="js"
          code={`const res = await fetch("/api/users");
if (!res.ok) throw new Error(\`Request failed: \${res.status}\`);
if (!res.headers.get("content-type")?.includes("application/json")) {
  throw new Error("Expected JSON, got " + (await res.text()).slice(0, 80));
}
const users = await res.json();`}
          caption="Check the status and Content-Type before parsing, so the real problem shows up in the error."
        />
      </GuideSection>

      <GuideSection id="unexpected-end" title="“Unexpected end of JSON input”">
        <p>
          The parser reached the end of the text while it still expected more. Either the input is empty (an empty response body, an
          unset variable) or it was cut off partway, for instance a truncated file or a log line that hit a length limit. Log the raw text
          and its length before parsing to see which.
        </p>
      </GuideSection>

      <GuideSection id="common-mistakes" title="The 8 mistakes behind most JSON errors">
        {mistakes.map((m) => (
          <div key={m.id} id={m.id} className="flex scroll-mt-24 flex-col gap-3 pt-2">
            <h3 className="text-xl leading-7 font-bold text-heading">{m.title}</h3>
            <p>{m.text}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <GuideCode lang="text" code={m.bad} caption="Invalid" />
              <GuideCode lang="json" code={m.good} caption="Valid" />
            </div>
            <p className="text-sm text-muted/80">
              Error in Chrome and Node.js: <InlineCode>{m.error}</InlineCode>
            </p>
          </div>
        ))}
      </GuideSection>

      <GuideSection id="other-causes" title="Less obvious causes">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            <strong className="text-heading">A byte order mark (BOM).</strong> Some editors on Windows save files with an invisible{" "}
            <InlineCode>U+FEFF</InlineCode> character at the start, which <InlineCode>JSON.parse</InlineCode> rejects. Save the file as
            “UTF-8” rather than “UTF-8 with BOM”, or strip it with <InlineCode>text.replace(/^﻿/, &quot;&quot;)</InlineCode>.
          </li>
          <li>
            <strong className="text-heading">Parsing twice.</strong> Calling <InlineCode>JSON.parse</InlineCode> on something that is
            already an object turns it into the string <InlineCode>&quot;[object Object]&quot;</InlineCode> first, which fails with{" "}
            <InlineCode>Unexpected token &apos;o&apos;</InlineCode>. Libraries like axios already parse the response for you.
          </li>
          <li>
            <strong className="text-heading">JSON stored as a string.</strong> If the text is full of backslashes, like{" "}
            <InlineCode>&quot;{"{"}\&quot;id\&quot;:1{"}"}&quot;</InlineCode>, it was stringified twice. Unescape it with{" "}
            <GuideLink href="/json-to-string">JSON ⇄ String</GuideLink> first.
          </li>
          <li>
            <strong className="text-heading">Smart quotes.</strong> Text copied from a document or chat app may contain curly quotes{" "}
            <InlineCode>“ ”</InlineCode> instead of straight ones <InlineCode>&quot;</InlineCode>.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="fix-automatically" title="Fixing it automatically">
        <p>
          For hand-edited JSON, config snippets or data copied from JavaScript, <GuideLink href="/json-repair">JSON Repair</GuideLink>{" "}
          fixes trailing commas, missing commas, single quotes, unquoted keys, comments, unclosed brackets and Python-style{" "}
          <InlineCode>True</InlineCode>/<InlineCode>None</InlineCode> in one step, and lists every change it made so you can check them.
          Then use the <GuideLink href="/json-formatter">JSON Formatter</GuideLink> to make the result readable. Everything runs in your
          browser, so the data you paste never leaves your device.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
