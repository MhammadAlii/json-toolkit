import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { jsonSchemaTutorialGuide } from "./meta";

const schema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "name": { "type": "string", "minLength": 1 },
    "email": { "type": "string", "format": "email" },
    "role": { "enum": ["admin", "editor", "viewer"] },
    "tags": { "type": "array", "items": { "type": "string" }, "uniqueItems": true }
  },
  "required": ["id", "name", "email"],
  "additionalProperties": false
}`;

const keywords: [string, string][] = [
  ["type", "The JSON type: string, number, integer, boolean, null, object or array."],
  ["properties", "A schema for each key of an object."],
  ["required", "Keys that must be present. Properties are optional unless listed here."],
  ["additionalProperties", "false rejects any key not listed in properties; catches typos and unexpected fields."],
  ["enum", "The value must be one of a fixed list."],
  ["minLength / maxLength", "Limits on string length."],
  ["minimum / maximum", "Limits on numbers."],
  ["pattern", "A regular expression the string must match."],
  ["format", "Common string formats such as email, date, date-time, uri and uuid."],
  ["items", "A schema that every array item must match."],
  ["uniqueItems", "true rejects arrays with duplicate items."],
];

export function JsonSchemaTutorialGuidePage() {
  return (
    <GuideLayout guide={jsonSchemaTutorialGuide}>
      <p>
        JSON Schema is a JSON document that describes what other JSON should look like: which fields exist, which are required, what type
        each one has and which values are allowed. Validating data against a schema catches bad API requests, broken config and integration
        mistakes before they cause bugs, and the schema doubles as documentation. Here&apos;s a user record and a schema for it:
      </p>
      <GuideCode lang="json" code={'{\n  "id": 7,\n  "name": "Ann",\n  "email": "ann@example.com",\n  "role": "admin",\n  "tags": ["a", "b"]\n}'} caption="The data" />
      <GuideCode lang="json" code={schema} caption="The schema" />

      <GuideSection id="keywords" title="The keywords you'll use most">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm leading-6">
            <tbody>
              {keywords.map(([k, meaning]) => (
                <tr key={k} className="border-t border-border first:border-t-0">
                  <th scope="row" className="px-4 py-3 text-left align-top font-mono text-xs font-semibold whitespace-nowrap text-json-key">
                    {k}
                  </th>
                  <td className="px-4 py-3">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Note that <InlineCode>integer</InlineCode> is stricter than <InlineCode>number</InlineCode>: <InlineCode>7</InlineCode> passes
          both, <InlineCode>7.5</InlineCode> only passes <InlineCode>number</InlineCode>.
        </p>
      </GuideSection>

      <GuideSection id="errors" title="What validation errors look like">
        <p>Now validate some bad data against the same schema:</p>
        <GuideCode lang="json" code={'{ "id": "7", "name": "", "role": "owner", "nickname": "A" }'} />
        <p>Every validator reports the same five problems, worded slightly differently:</p>
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            <InlineCode>email</InlineCode> is required but missing.
          </li>
          <li>
            <InlineCode>id</InlineCode> is the string <InlineCode>&quot;7&quot;</InlineCode>, not an integer.
          </li>
          <li>
            <InlineCode>name</InlineCode> is shorter than <InlineCode>minLength</InlineCode>.
          </li>
          <li>
            <InlineCode>role</InlineCode> isn&apos;t one of the allowed values.
          </li>
          <li>
            <InlineCode>nickname</InlineCode> isn&apos;t allowed, because <InlineCode>additionalProperties</InlineCode> is false.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="online" title="Validate online">
        <p>
          Paste the data and the schema into the <GuideLink href="/json-schema-validator">JSON Schema Validator</GuideLink>. Each violation is
          listed with its path, the rule that failed and the line in your data. It supports drafts 2020-12, 2019-09 and 07, and can infer a
          starting schema from your data so you don&apos;t have to write one from scratch. Everything runs in your browser.
        </p>
      </GuideSection>

      <GuideSection id="javascript" title="Validate in JavaScript with Ajv">
        <GuideCode
          lang="js"
          code={`import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats"; // needed for "format": "email" and friends

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(data)) {
  console.log(validate.errors); // e.g. "/id must be integer"
}`}
          caption="npm install ajv ajv-formats. allErrors reports every problem instead of stopping at the first."
        />
      </GuideSection>

      <GuideSection id="python" title="Validate in Python with jsonschema">
        <GuideCode
          lang="python"
          code={`from jsonschema import Draft202012Validator

validator = Draft202012Validator(schema)
for error in validator.iter_errors(data):
    print(list(error.path), error.message)  # ['id'] '7' is not of type 'integer'`}
          caption="pip install jsonschema"
        />
      </GuideSection>

      <GuideSection id="tips" title="Tips">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            Check that the data is valid JSON first with the <GuideLink href="/json-validator">JSON Validator</GuideLink>; schema validation
            only works on data that parses.
          </li>
          <li>
            Use <InlineCode>additionalProperties: false</InlineCode> on API input to catch misspelt field names, which otherwise pass silently.
          </li>
          <li>
            In TypeScript projects, you can also generate types from sample JSON with{" "}
            <GuideLink href="/json-to-typescript">JSON to TypeScript</GuideLink> to keep code and schema in step.
          </li>
        </ul>
      </GuideSection>
    </GuideLayout>
  );
}
