import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { jsonPathCheatSheetGuide } from "./meta";

const sample = `{
  "store": {
    "book": [
      { "category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95 },
      { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 },
      { "category": "fiction", "author": "Herman Melville", "title": "Moby Dick", "isbn": "0-553-21311-3", "price": 8.99 },
      { "category": "fiction", "author": "J. R. R. Tolkien", "title": "The Lord of the Rings", "isbn": "0-395-19395-8", "price": 22.99 }
    ],
    "bicycle": { "color": "red", "price": 399 }
  }
}`;

type Row = [expression: string, meaning: string, result: string];

const sections: { id: string; title: string; rows: Row[] }[] = [
  {
    id: "basics",
    title: "Basic selectors",
    rows: [
      ["$", "The root of the document", "the whole document"],
      ["$.store.bicycle.color", "A child by name (dot notation)", '"red"'],
      ["$['store']['bicycle']", "A child by name (bracket notation, for keys with spaces or symbols)", '{ "color": "red", "price": 399 }'],
      ["$.store.*", "Wildcard: every child", "the book array and the bicycle object"],
      ["$..author", "Recursive descent: author at any depth", '"Nigel Rees", "Evelyn Waugh", "Herman Melville", "J. R. R. Tolkien"'],
      ["$..price", "Every price anywhere", "8.95, 12.99, 8.99, 22.99, 399"],
    ],
  },
  {
    id: "arrays",
    title: "Arrays: indexes and slices",
    rows: [
      ["$.store.book[0].title", "The first item (indexes start at 0)", '"Sayings of the Century"'],
      ["$.store.book[-1].title", "The last item", '"The Lord of the Rings"'],
      ["$.store.book[0,2].title", "Several indexes", '"Sayings of the Century", "Moby Dick"'],
      ["$.store.book[0:2].title", "A slice: from index 0 up to (not including) 2", '"Sayings of the Century", "Sword of Honour"'],
      ["$.store.book[*].author", "Every item", "all four authors"],
    ],
  },
  {
    id: "filters",
    title: "Filters",
    rows: [
      ["$.store.book[?@.price < 10].title", "Items where a comparison is true (@ is the current item)", '"Sayings of the Century", "Moby Dick"'],
      ["$.store.book[?@.isbn].title", "Items that have a key", '"Moby Dick", "The Lord of the Rings"'],
      ["$.store.book[?@.category == 'fiction' && @.price > 10].title", "Combine conditions with && and ||", '"Sword of Honour", "The Lord of the Rings"'],
      ["$..book[?length(@.title) > 15].title", "length() of a string, array or object", '"Sayings of the Century", "The Lord of the Rings"'],
      ["$.store.book[?count(@.*) > 4].title", "count(): the number of matches of a query (here, keys per book)", '"Moby Dick", "The Lord of the Rings"'],
      ["$.store.book[?value(@.price) > 20].title", "value(): the single value a query matches", '"The Lord of the Rings"'],
      ["$.store.book[?match(@.author, '.*Tolkien')].title", "match(): the whole value matches a regular expression", '"The Lord of the Rings"'],
      ["$.store.book[?search(@.author, 'Mel')].title", "search(): the value contains a match", '"Moby Dick"'],
    ],
  },
];

export function JsonPathCheatSheetGuidePage() {
  return (
    <GuideLayout guide={jsonPathCheatSheetGuide}>
      <p>
        JSONPath is a query language for picking values out of a JSON document, the way XPath does for XML. It&apos;s used in API testing
        tools, Kubernetes (<InlineCode>kubectl -o jsonpath</InlineCode>), databases and many libraries, and since 2024 it&apos;s standardised as
        RFC 9535. Every example below uses this document and was checked in the{" "}
        <GuideLink href="/json-query">JSON Query Selector</GuideLink>, where you can paste it and try them yourself.
      </p>
      <GuideCode lang="json" code={sample} caption="The sample document (the classic bookstore example)" />

      {sections.map((s) => (
        <GuideSection key={s.id} id={s.id} title={s.title}>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-sm leading-6">
              <thead>
                <tr className="bg-surface text-left text-heading">
                  <th scope="col" className="px-4 py-3 font-bold">
                    Expression
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Meaning
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.rows.map(([expr, meaning, result]) => (
                  <tr key={expr} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-mono text-xs leading-5 break-all text-json-key">{expr}</td>
                    <td className="px-4 py-3">{meaning}</td>
                    <td className="px-4 py-3 font-mono text-xs leading-5 text-json-string">{result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GuideSection>
      ))}

      <GuideSection id="operators" title="Filter operators">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            Comparison: <InlineCode>==</InlineCode> <InlineCode>!=</InlineCode> <InlineCode>&lt;</InlineCode> <InlineCode>&lt;=</InlineCode>{" "}
            <InlineCode>&gt;</InlineCode> <InlineCode>&gt;=</InlineCode>
          </li>
          <li>
            Logic: <InlineCode>&amp;&amp;</InlineCode> (and), <InlineCode>||</InlineCode> (or), <InlineCode>!</InlineCode> (not), and
            parentheses for grouping
          </li>
          <li>
            Strings use single or double quotes: <InlineCode>@.category == &apos;fiction&apos;</InlineCode>
          </li>
          <li>
            <InlineCode>$</InlineCode> inside a filter refers to the document root, so values can be compared with other parts of the
            document
          </li>
          <li>
            Functions from RFC 9535: <InlineCode>length()</InlineCode>, <InlineCode>count()</InlineCode>, <InlineCode>match()</InlineCode>,{" "}
            <InlineCode>search()</InlineCode> and <InlineCode>value()</InlineCode>
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="tips" title="Tips">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            A query always returns a <em>list</em> of matches, even when only one value matches, and an empty list when none do.
          </li>
          <li>
            Use bracket notation for keys that aren&apos;t simple names: <InlineCode>$[&apos;first name&apos;]</InlineCode>,{" "}
            <InlineCode>$[&apos;user-id&apos;]</InlineCode>.
          </li>
          <li>
            Don&apos;t know the path to a value? Search for it with <GuideLink href="/json-deep-search">JSON Deep Search</GuideLink>, which
            shows the full path of every match, or click it in the <GuideLink href="/json-tree-viewer">Tree Viewer</GuideLink>.
          </li>
        </ul>
      </GuideSection>
    </GuideLayout>
  );
}
