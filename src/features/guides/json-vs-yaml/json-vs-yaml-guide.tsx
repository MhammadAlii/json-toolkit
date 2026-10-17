import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { jsonVsYamlGuide } from "./meta";

const rows: [string, string, string][] = [
  ["Structure", "Braces, brackets and commas", "Indentation and dashes"],
  ["Comments", "Not allowed", "Yes, with #"],
  ["Strings", "Always in double quotes", "Quotes usually optional"],
  ["Multi-line text", "Escaped as \\n", "Block scalars (| and >)"],
  ["Reuse (anchors)", "No", "Yes, with & and *"],
  ["Spec size", "A few pages (RFC 8259)", "A long specification with several versions"],
  ["Parsing", "Built into every language, fast and strict", "Needs a library; behaviour differs between versions"],
  ["Typical use", "APIs, data exchange, storage", "Config files: Kubernetes, Docker Compose, CI"],
];

export function JsonVsYamlGuidePage() {
  return (
    <GuideLayout guide={jsonVsYamlGuide}>
      <p>
        JSON and YAML describe the same kind of data: objects (maps), arrays (lists), strings, numbers, booleans and null. The difference is
        who they&apos;re written for. JSON is strict and easy for programs to produce and parse; YAML is lighter to read and write by hand,
        which is why config files favour it. Here&apos;s the same data in both:
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <GuideCode
          lang="json"
          code={'{\n  "service": "api",\n  "replicas": 3,\n  "ports": [80, 443],\n  "env": {\n    "DEBUG": false\n  }\n}'}
          caption="JSON"
        />
        <GuideCode lang="yaml" code={"# Production settings\nservice: api\nreplicas: 3\nports:\n  - 80\n  - 443\nenv:\n  DEBUG: false"} caption="YAML" />
      </div>

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
                  YAML
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, json, yaml]) => (
                <tr key={label} className="border-t border-border">
                  <th scope="row" className="px-4 py-3 text-left font-semibold whitespace-nowrap text-heading">
                    {label}
                  </th>
                  <td className="px-4 py-3">{json}</td>
                  <td className="px-4 py-3">{yaml}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GuideSection>

      <GuideSection id="yaml-pitfalls" title="YAML pitfalls to watch for">
        <p>
          YAML&apos;s flexibility comes from guessing types for unquoted values, and that&apos;s where most YAML bugs come from. Many
          widely used parsers still follow YAML 1.1 rules. Python&apos;s PyYAML, for example, reads this file:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <GuideCode lang="yaml" code={"country: no\nversion: 1.10\nzip: 012\non: yes"} caption="YAML input" />
          <GuideCode lang="text" code={"{'country': False,\n 'version': 1.1,\n 'zip': 10,\n True: True}"} caption="What PyYAML 6 returns" />
        </div>
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            <strong className="text-heading">The “Norway problem”:</strong> the country code <InlineCode>no</InlineCode> becomes{" "}
            <InlineCode>false</InlineCode>, and the key <InlineCode>on</InlineCode> becomes <InlineCode>true</InlineCode>. YAML 1.1 treats
            yes/no/on/off as booleans; YAML 1.2 parsers (such as js-yaml) don&apos;t.
          </li>
          <li>
            <strong className="text-heading">Version numbers:</strong> <InlineCode>1.10</InlineCode> is read as the number 1.1.
          </li>
          <li>
            <strong className="text-heading">Leading zeros:</strong> <InlineCode>012</InlineCode> is read as octal and becomes 10 in YAML
            1.1 (12 in YAML 1.2), so ZIP codes and IDs change silently.
          </li>
          <li>
            <strong className="text-heading">Indentation:</strong> one wrong space changes the structure or breaks the file, and tabs
            aren&apos;t allowed for indentation at all.
          </li>
        </ul>
        <p>
          The fix is the same in every case: <strong className="text-heading">quote strings that could be misread</strong>, such as{" "}
          <InlineCode>&quot;no&quot;</InlineCode>, <InlineCode>&quot;1.10&quot;</InlineCode> and <InlineCode>&quot;012&quot;</InlineCode>. JSON
          avoids the whole problem because every string is quoted and there are only six value types.
        </p>
      </GuideSection>

      <GuideSection id="when-json" title="When to use JSON">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>APIs and anything sent between programs: every language parses it natively and identically.</li>
          <li>Data that machines write, such as logs, caches, exports and database documents.</li>
          <li>When strictness matters more than convenience; a typo fails loudly instead of changing a value.</li>
          <li>Browser code, where JSON is built in and YAML would need an extra library.</li>
        </ul>
      </GuideSection>

      <GuideSection id="when-yaml" title="When to use YAML">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>Config files that people edit by hand and want to comment, like Kubernetes manifests, Docker Compose and CI pipelines.</li>
          <li>Long, nested settings where braces and quotes add a lot of noise.</li>
          <li>When a tool you use expects it; most of the DevOps ecosystem does.</li>
        </ul>
      </GuideSection>

      <GuideSection id="convert" title="Converting JSON to YAML">
        <p>
          If you have JSON and a tool wants YAML, the <GuideLink href="/json-to-yaml">JSON to YAML converter</GuideLink> does it as you type.
          It quotes anything a YAML parser could misread (like <InlineCode>no</InlineCode>, <InlineCode>1.10</InlineCode> or dates), so the
          result means exactly what your JSON meant, and it runs in your browser so config secrets stay on your machine. Make sure the JSON
          is valid first with the <GuideLink href="/json-validator">JSON Validator</GuideLink>.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
