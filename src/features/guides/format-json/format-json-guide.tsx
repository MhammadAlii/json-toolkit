import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { formatJsonGuide } from "./meta";

export function FormatJsonGuidePage() {
  return (
    <GuideLayout guide={formatJsonGuide}>
      <p>
        APIs and log files usually send JSON on a single line to save space. Formatting (also called pretty printing or beautifying)
        adds line breaks and indentation so you can actually read it. It only changes whitespace: the data stays exactly the same.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <GuideCode lang="json" code={'{"id":7,"name":"Ann","roles":["admin","dev"],"active":true}'} caption="Minified" />
        <GuideCode lang="json" code={'{\n  "id": 7,\n  "name": "Ann",\n  "roles": ["admin", "dev"],\n  "active": true\n}'} caption="Formatted" />
      </div>

      <GuideSection id="online" title="Format JSON online">
        <p>
          The fastest way is to paste it into the <GuideLink href="/json-formatter">JSON Formatter</GuideLink>. It formats as you type,
          with 2-space, 4-space or tab indentation and optional key sorting, highlights the syntax, and tells you the exact line if the JSON
          is invalid. It runs entirely in your browser, so API responses, tokens and customer data never leave your device. Large or deeply
          nested JSON is easier to read in the <GuideLink href="/json-tree-viewer">Tree Viewer</GuideLink>.
        </p>
      </GuideSection>

      <GuideSection id="javascript" title="In JavaScript and Node.js">
        <p>
          <InlineCode>JSON.stringify</InlineCode> takes the indentation as its third argument: a number of spaces or a string such as{" "}
          <InlineCode>&quot;\t&quot;</InlineCode>.
        </p>
        <GuideCode
          lang="js"
          code={`const data = JSON.parse(text);

JSON.stringify(data, null, 2);    // 2 spaces
JSON.stringify(data, null, "\\t"); // tabs
JSON.stringify(data);             // minified, no whitespace`}
        />
        <p>To pretty print a file from the terminal with Node:</p>
        <GuideCode lang="shell" code={`node -e 'console.log(JSON.stringify(JSON.parse(require("fs").readFileSync(0, "utf8")), null, 2))' < data.json`} />
      </GuideSection>

      <GuideSection id="python" title="In Python">
        <GuideCode
          lang="python"
          code={`import json

data = json.loads(text)
print(json.dumps(data, indent=2))                     # 2 spaces
print(json.dumps(data, indent=2, sort_keys=True))     # keys sorted
print(json.dumps(data, indent=2, ensure_ascii=False)) # keep é, ü, 中 as is`}
        />
        <p>Python also ships a command-line formatter, so no extra install is needed:</p>
        <GuideCode
          lang="shell"
          code={`python3 -m json.tool data.json                       # 4 spaces
python3 -m json.tool --indent 2 --sort-keys data.json
python3 -m json.tool --compact data.json             # minify`}
        />
        <p>
          By default <InlineCode>json.dumps</InlineCode> and <InlineCode>json.tool</InlineCode> escape non-ASCII characters, so{" "}
          <InlineCode>Zoë</InlineCode> becomes <InlineCode>Zoë</InlineCode>. Use <InlineCode>ensure_ascii=False</InlineCode> or{" "}
          <InlineCode>--no-ensure-ascii</InlineCode> to keep them readable.
        </p>
      </GuideSection>

      <GuideSection id="jq" title="On the command line with jq">
        <p>
          <InlineCode>jq</InlineCode> is the standard tool for JSON in a terminal. The filter <InlineCode>.</InlineCode> means “the
          whole input”, so it simply pretty prints it:
        </p>
        <GuideCode
          lang="shell"
          code={`jq . data.json                  # format
jq -S . data.json               # format with sorted keys
jq -c . data.json               # minify to one line
curl -s https://api.example.com/users | jq .`}
        />
      </GuideSection>

      <GuideSection id="editors" title="In VS Code and other editors">
        <p>
          In VS Code, open the file and run <strong className="text-heading">Format Document</strong>: <InlineCode>Shift</InlineCode>+
          <InlineCode>Alt</InlineCode>+<InlineCode>F</InlineCode> on Windows, <InlineCode>Shift</InlineCode>+<InlineCode>Option</InlineCode>+
          <InlineCode>F</InlineCode> on macOS and <InlineCode>Ctrl</InlineCode>+<InlineCode>Shift</InlineCode>+<InlineCode>I</InlineCode> on
          Linux. If the JSON isn&apos;t in a <InlineCode>.json</InlineCode> file, set the language to JSON first from the status bar.
          JetBrains IDEs use <strong className="text-heading">Reformat Code</strong> (<InlineCode>Ctrl</InlineCode>+
          <InlineCode>Alt</InlineCode>+<InlineCode>L</InlineCode>, or <InlineCode>⌥</InlineCode>+<InlineCode>⌘</InlineCode>+
          <InlineCode>L</InlineCode> on macOS).
        </p>
      </GuideSection>

      <GuideSection id="minify" title="Minifying JSON again">
        <p>
          Before sending JSON over the network or storing it, you can remove the whitespace again to make it smaller. The{" "}
          <GuideLink href="/json-minifier">JSON Minifier</GuideLink> does this without touching your numbers or escapes and shows how much
          space you saved; in code, <InlineCode>JSON.stringify(data)</InlineCode> with no indentation does the same.
        </p>
      </GuideSection>

      <GuideSection id="if-it-fails" title="If formatting fails">
        <p>
          A formatter can only format valid JSON. If you get an error instead, the JSON has a syntax problem such as a trailing comma or
          single quotes. The <GuideLink href="/json-validator">JSON Validator</GuideLink> shows exactly where, and our guide to{" "}
          <GuideLink href="/guides/fix-json-errors">fixing JSON errors</GuideLink> explains each message.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
