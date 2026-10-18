import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { compareJsonGuide } from "./meta";

export function CompareJsonGuidePage() {
  return (
    <GuideLayout guide={compareJsonGuide}>
      <p>
        Comparing two JSON files sounds like a job for a normal diff, but JSON isn&apos;t plain text. Two files can hold exactly the same data
        and still look completely different, because keys are in another order or the indentation changed. Take these two:
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <GuideCode lang="json" code={'{"name":"Ann","age":30,"tags":["a","b"]}'} caption="a.json" />
        <GuideCode lang="json" code={'{\n  "age": 31,\n  "name": "Ann",\n  "tags": ["a", "b"],\n  "active": true\n}'} caption="b.json" />
      </div>
      <p>
        A line-by-line <InlineCode>diff</InlineCode> marks every line as changed. In reality there are only two changes:{" "}
        <InlineCode>age</InlineCode> went from 30 to 31, and <InlineCode>active</InlineCode> was added.
      </p>

      <GuideSection id="online" title="Compare JSON online">
        <p>
          Paste the two documents into <GuideLink href="/json-diff">JSON Diff</GuideLink>. It compares the data, not the text, so key order and
          whitespace never show up as changes. You get each addition, removal and change with its path, a unified or side-by-side view, and
          the differences as a JSON Patch you can copy. Both documents stay in your browser, which matters when you&apos;re comparing API
          responses or production config.
        </p>
      </GuideSection>

      <GuideSection id="jq" title="On the command line with jq">
        <p>
          Normalise both files with <InlineCode>jq -S</InlineCode> (sort keys, consistent formatting) and diff the results:
        </p>
        <GuideCode lang="shell" code={"diff <(jq -S . a.json) <(jq -S . b.json)"} />
        <GuideCode lang="text" code={'2c2,3\n<   "age": 30,\n---\n>   "active": true,\n>   "age": 31,'} caption="Only the real changes remain." />
      </GuideSection>

      <GuideSection id="python" title="In Python">
        <p>Parsed JSON objects become dictionaries, and dictionary equality ignores key order:</p>
        <GuideCode
          lang="python"
          code={`import json

with open("a.json") as f: a = json.load(f)
with open("b.json") as f: b = json.load(f)

print(a == b)                                  # False: the data differs
print({"x": 1, "y": 2} == {"y": 2, "x": 1})    # True: key order doesn't matter
print([1, 2] == [2, 1])                        # False: array order does`}
        />
        <p>
          That tells you <em>whether</em> they differ, not <em>where</em>. For a list of differences, libraries such as DeepDiff report each
          changed path.
        </p>
      </GuideSection>

      <GuideSection id="javascript" title="In JavaScript">
        <p>
          Don&apos;t compare <InlineCode>JSON.stringify</InlineCode> output: it depends on key order, so equal objects can produce different
          strings. In Node.js, use the built-in deep comparison:
        </p>
        <GuideCode
          lang="js"
          code={`import { isDeepStrictEqual } from "node:util";

isDeepStrictEqual({ x: 1, y: 2 }, { y: 2, x: 1 });                  // true
JSON.stringify({ x: 1, y: 2 }) === JSON.stringify({ y: 2, x: 1 });  // false`}
        />
      </GuideSection>

      <GuideSection id="json-patch" title="Describing the differences as JSON Patch">
        <p>
          JSON Patch (RFC 6902) is the standard way to write differences down: a list of operations that turn the first document into the
          second. For the example above:
        </p>
        <GuideCode lang="json" code={'[\n  { "op": "replace", "path": "/age", "value": 31 },\n  { "op": "add", "path": "/active", "value": true }\n]'} />
        <p>
          Patches are useful for audit logs, syncing data and HTTP <InlineCode>PATCH</InlineCode> requests. JSON Diff generates one for any two
          documents.
        </p>
      </GuideSection>

      <GuideSection id="tips" title="Tips for cleaner comparisons">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            <strong className="text-heading">Arrays are ordered.</strong> If order doesn&apos;t matter in your data (like a list of tags), sort
            both arrays first, or use JSON Diff&apos;s option to ignore array order.
          </li>
          <li>
            <strong className="text-heading">Ignore noise.</strong> Timestamps and generated IDs change on every response; remove them before
            comparing so the real differences stand out.
          </li>
          <li>
            <strong className="text-heading">Format first when reading by eye.</strong> The <GuideLink href="/json-formatter">JSON Formatter</GuideLink>{" "}
            makes minified responses readable, and <GuideLink href="/json-deep-search">Deep Search</GuideLink> finds a key&apos;s path in a big
            document.
          </li>
        </ul>
      </GuideSection>
    </GuideLayout>
  );
}
