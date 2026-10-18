import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { jsonVsXmlGuide } from "./meta";

const rows: [string, string, string][] = [
  ["Data model", "Objects, arrays and values", "A tree of elements with attributes and text"],
  ["Types", "String, number, boolean, null, object, array", "Everything is text unless a schema says otherwise"],
  ["Lists", "Arrays: [\"a\", \"b\"]", "Repeated elements: <role>a</role><role>b</role>"],
  ["Metadata", "No separate concept", "Attributes, e.g. <user id=\"7\">"],
  ["Comments", "Not allowed", "Yes: <!-- … -->"],
  ["Namespaces", "No", "Yes, to mix vocabularies in one document"],
  ["Validation", "JSON Schema", "XSD, DTD, RELAX NG"],
  ["In the browser", "JSON.parse, built into JavaScript", "DOMParser, then walk the DOM"],
];

export function JsonVsXmlGuidePage() {
  return (
    <GuideLayout guide={jsonVsXmlGuide}>
      <p>
        JSON and XML are both text formats for structured data, readable by people and programs. XML came first and was the default for
        web services in the 2000s; JSON took over for web APIs because it&apos;s smaller and maps directly onto the objects and arrays of
        programming languages. Here is the same record in both:
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <GuideCode lang="json" code={'{\n  "user": {\n    "id": 7,\n    "name": "Ann Lee",\n    "active": true,\n    "roles": ["admin", "dev"]\n  }\n}'} caption="JSON" />
        <GuideCode
          lang="text"
          code={"<user>\n  <id>7</id>\n  <name>Ann Lee</name>\n  <active>true</active>\n  <roles>\n    <role>admin</role>\n    <role>dev</role>\n  </roles>\n</user>"}
          caption="XML"
        />
      </div>
      <p>
        Minified, the JSON version is 72 bytes and the XML version 113, about 57% larger, mostly because every XML element name is written
        twice. In JSON, <InlineCode>7</InlineCode> is a number and <InlineCode>true</InlineCode> a boolean; in XML both are just text
        until something interprets them.
      </p>

      <GuideSection id="differences" title="The main differences">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm leading-6">
            <thead>
              <tr className="bg-surface text-left text-heading">
                <th scope="col" className="px-4 py-3 font-bold"></th>
                <th scope="col" className="px-4 py-3 font-bold">
                  JSON
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  XML
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, json, xml]) => (
                <tr key={label} className="border-t border-border">
                  <th scope="row" className="px-4 py-3 text-left font-semibold whitespace-nowrap text-heading">
                    {label}
                  </th>
                  <td className="px-4 py-3">{json}</td>
                  <td className="px-4 py-3">{xml}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GuideSection>

      <GuideSection id="when-json" title="When to use JSON">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>REST and GraphQL APIs, and anything a browser or mobile app consumes.</li>
          <li>Configuration and data files read by code, such as package.json or tsconfig.json.</li>
          <li>Storing documents in databases like MongoDB, PostgreSQL&apos;s jsonb or Elasticsearch.</li>
          <li>Logs and events, where small size and fast parsing matter.</li>
        </ul>
      </GuideSection>

      <GuideSection id="when-xml" title="When XML is still the better choice">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>Documents with mixed text and markup, like books, legal texts or XHTML, which JSON represents awkwardly.</li>
          <li>Formats that are XML by definition: SVG, RSS and Atom, Office files, Android layouts, Maven&apos;s pom.xml.</li>
          <li>SOAP services and enterprise or government integrations that require XML and XSD validation.</li>
          <li>When you need namespaces to combine several vocabularies in one document.</li>
        </ul>
      </GuideSection>

      <GuideSection id="convert" title="Converting JSON to XML">
        <p>
          Because XML has no arrays and no types, converting means making choices: what to call the root element, how to write lists, whether
          some values become attributes, and how to handle keys that aren&apos;t valid XML names (like <InlineCode>123name</InlineCode> or{" "}
          <InlineCode>first name</InlineCode>). The <GuideLink href="/json-to-xml">JSON to XML converter</GuideLink> does this as you
          type, escapes special characters, renames invalid keys and lists every rename, and lets you choose the root, attributes and
          array style. It runs in your browser, so the data stays on your device. Check the JSON with the{" "}
          <GuideLink href="/json-validator">JSON Validator</GuideLink> first if the converter reports an error.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
