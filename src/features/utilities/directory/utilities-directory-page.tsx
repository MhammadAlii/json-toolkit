import { pageMetadata } from "@/components/seo/page-metadata";
import { ToolCard } from "@/components/tool/tool-card";
import { site } from "@/config/site";
import { toolsInCategory } from "@/features/catalog";
import { DirectoryLayout } from "@/features/tools/shared/directory-layout";

export const utilitiesDirectoryMetadata = pageMetadata({
  title: "Developer Utilities – JWT Decoder, URL, Base64 & Epoch Converter",
  description: `Decode JWTs, encode and decode URLs and Base64, and convert Unix timestamps to dates. Free ${site.name} utilities that run in your browser.`,
  path: "/utilities",
  absoluteTitle: true,
});

export function UtilitiesDirectoryPage() {
  const utilities = toolsInCategory("utilities");
  return (
    <DirectoryLayout
      title="Developer Utilities"
      intro="Small tools for the everyday jobs around JSON: inspect tokens, encode URLs and Base64, and turn timestamps into dates. Everything runs locally in your browser."
      path="/utilities"
      listName={`${site.name} utilities`}
      tools={utilities}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {utilities.map((t) => (
          <li key={t.slug}>
            <ToolCard tool={t} />
          </li>
        ))}
      </ul>
    </DirectoryLayout>
  );
}
