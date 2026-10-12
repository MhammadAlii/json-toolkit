import { pageMetadata } from "@/components/seo/page-metadata";
import { site } from "@/config/site";
import { categoryLabels, categoryOrder, toolsInCategory } from "@/features/catalog";
import { DirectoryLayout } from "@/features/tools/shared/directory-layout";
import { ToolSection } from "./tool-section";

// Converters and utilities have their own pages at /converters and /utilities.
const categories = categoryOrder.filter((c) => c !== "converters" && c !== "utilities");

export const toolsDirectoryMetadata = pageMetadata({
  title: "All JSON Tools – Formatter, Validator, Diff, Query & More",
  description: `Every ${site.name} JSON tool in one place: format, validate, repair, minify, explore, search, compare and query JSON in your browser.`,
  path: "/tools",
  absoluteTitle: true,
});

export function ToolsDirectoryPage() {
  return (
    <DirectoryLayout
      title="Developer Tools"
      intro="Everything you need to inspect, transform and work with structured data. Performance-first utilities that respect your privacy."
      path="/tools"
      listName={`${site.name} tools`}
      tools={categories.flatMap(toolsInCategory)}
    >
      {categories.map((category) => (
        <ToolSection key={category} category={category} label={categoryLabels[category]} tools={toolsInCategory(category)} />
      ))}
    </DirectoryLayout>
  );
}
