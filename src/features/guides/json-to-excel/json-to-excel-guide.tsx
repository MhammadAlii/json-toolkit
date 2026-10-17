import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { jsonToExcelGuide } from "./meta";

export function JsonToExcelGuidePage() {
  return (
    <GuideLayout guide={jsonToExcelGuide}>
      <p>
        A spreadsheet is a table, so JSON converts best when it&apos;s a list of similar records: an <strong className="text-heading">array
        of objects</strong>. Each object becomes a row and each key a column. Nested objects are flattened into columns like{" "}
        <InlineCode>address.city</InlineCode>.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <GuideCode
          lang="json"
          code={'[\n  { "id": 1, "name": "Ann", "address": { "city": "Paris" } },\n  { "id": 2, "name": "Bob", "address": { "city": "Rome" } }\n]'}
          caption="JSON"
        />
        <GuideCode lang="text" code={"id | name | address.city\n1  | Ann  | Paris\n2  | Bob  | Rome"} caption="Resulting sheet" />
      </div>

      <GuideSection id="online" title="1. With an online converter (fastest)">
        <p>
          Paste your JSON into the <GuideLink href="/json-to-excel">JSON to Excel converter</GuideLink>, check the preview and download the{" "}
          <InlineCode>.xlsx</InlineCode> file. It creates a real Excel workbook rather than a CSV, so:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>numbers, true/false and ISO dates (like <InlineCode>2024-01-05</InlineCode>) stay real numbers, booleans and dates;</li>
          <li>the header row is bold, frozen and has filters, and columns are sized to fit;</li>
          <li>nested objects become dot-path columns, and arrays can be kept as JSON, joined, or split into one column each;</li>
          <li>an object holding several arrays can become one sheet per array;</li>
          <li>text is never run as a formula, so a value like <InlineCode>=SUM(A1)</InlineCode> is safe.</li>
        </ul>
        <p>The file is built in your browser, so the data isn&apos;t uploaded anywhere.</p>
      </GuideSection>

      <GuideSection id="power-query" title="2. In Excel with Power Query">
        <p>Desktop Excel (Microsoft 365 and recent versions) can import JSON itself:</p>
        <ol className="flex list-decimal flex-col gap-2 pl-5 marker:text-brand">
          <li>
            Go to <strong className="text-heading">Data → Get Data → From File → From JSON</strong> and pick your file.
          </li>
          <li>
            In the Power Query editor you&apos;ll see a <em>List</em>. Click <strong className="text-heading">To Table</strong>, then OK.
          </li>
          <li>
            Click the expand icon (two arrows) in the column header, choose the fields you want, and repeat for nested columns.
          </li>
          <li>
            Click <strong className="text-heading">Close &amp; Load</strong>.
          </li>
        </ol>
        <p>
          It&apos;s worth it when the same JSON file is refreshed regularly, because Power Query remembers the steps. For a one-off
          conversion, the online converter is quicker.
        </p>
      </GuideSection>

      <GuideSection id="csv" title="3. Via CSV (for Google Sheets and other tools)">
        <p>
          Google Sheets can&apos;t import JSON directly, but it imports CSV. Convert with the{" "}
          <GuideLink href="/json-to-csv">JSON to CSV converter</GuideLink>, then use <strong className="text-heading">File → Import</strong> in
          Sheets. If you open a CSV in Excel instead, watch out for three things:
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            <strong className="text-heading">Accented characters look wrong:</strong> enable “BOM for Excel” in the converter&apos;s options,
            which tells Excel the file is UTF-8.
          </li>
          <li>
            <strong className="text-heading">Leading zeros disappear</strong> from IDs and ZIP codes, because Excel reads them as numbers.
          </li>
          <li>
            <strong className="text-heading">Long numbers</strong> such as card or order numbers turn into scientific notation and lose digits
            after 15.
          </li>
        </ul>
        <p>Converting straight to XLSX avoids all three.</p>
      </GuideSection>

      <GuideSection id="python" title="4. With Python and pandas">
        <p>For scripts and automation, pandas flattens nested JSON and writes Excel in a few lines (it needs the openpyxl package):</p>
        <GuideCode
          lang="python"
          code={`import json
import pandas as pd

with open("data.json") as f:
    data = json.load(f)

df = pd.json_normalize(data)          # nested keys become address.city
df.to_excel("data.xlsx", index=False)  # pip install pandas openpyxl`}
        />
      </GuideSection>

      <GuideSection id="nested" title="Handling nested data and arrays">
        <p>Tables are flat, so nested JSON needs a decision:</p>
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            <strong className="text-heading">Nested objects</strong> are flattened into columns:{" "}
            <InlineCode>{'{"address": {"city": "Paris"}}'}</InlineCode> becomes an <InlineCode>address.city</InlineCode> column.
          </li>
          <li>
            <strong className="text-heading">Arrays of values</strong> such as tags can be joined into one cell (<InlineCode>a, b</InlineCode>
            ), split into <InlineCode>tags.0</InlineCode>, <InlineCode>tags.1</InlineCode> columns, or kept as JSON text.
          </li>
          <li>
            <strong className="text-heading">Arrays of objects</strong> (like orders inside each customer) are usually better as their own
            sheet.
          </li>
        </ul>
        <p>
          Not sure what your data looks like? Open it in the <GuideLink href="/json-table-viewer">Table Viewer</GuideLink> first to see the
          rows and columns before you convert.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
