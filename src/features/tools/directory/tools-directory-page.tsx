import { pageMetadata } from "@/components/seo/page-metadata";
import { site } from "@/config/site";
import { categoryLabels, categoryOrder, toolsInCategory } from "@/features/catalog";
import { DirectoryLayout } from "@/features/tools/shared/directory-layout";
import { ToolSection } from "./tool-section";

// Converters have their own page at /converters.
const categories = categoryOrder.filter((c) => c !== "converters");

export const toolsDirectoryMetadata = pageMetadata({
  title: "All JSON Tools – Formatter, Validator, Diff, Query & More",
  description: `Every ${site.name} tool in one place: format, validate, repair, explore, compare and query JSON, plus JWT, Base64, URL and timestamp utilities.`,
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
