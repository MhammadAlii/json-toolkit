import { pageMetadata } from "@/components/seo/page-metadata";
import { ToolCard } from "@/components/tool/tool-card";
import { site } from "@/config/site";
import { toolsInCategory } from "@/features/catalog";
import { DirectoryLayout } from "@/features/tools/shared/directory-layout";

export const convertersDirectoryMetadata = pageMetadata({
  title: "JSON Converters – JSON ⇄ YAML, CSV, TypeScript, Excel, XML & SQL",
  description: `Convert JSON to YAML, CSV, TypeScript interfaces, Excel, XML, SQL inserts and escaped strings, and every one of them back into JSON. Free ${site.name} converters that run in your browser.`,
  path: "/converters",
  absoluteTitle: true,
});

export function ConvertersDirectoryPage() {
  const converters = toolsInCategory("converters");
  return (
    <DirectoryLayout
      title="JSON Converters"
      intro="Turn JSON into the format your next tool expects: YAML for configs, CSV and Excel for spreadsheets, TypeScript for code, SQL for databases. Everything runs locally in your browser."
      path="/converters"
      listName={`${site.name} converters`}
      tools={converters}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {converters.map((t) => (
          <li key={t.slug}>
            <ToolCard tool={t} />
          </li>
        ))}
      </ul>
    </DirectoryLayout>
  );
}
