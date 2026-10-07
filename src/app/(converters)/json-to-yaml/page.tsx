import { jsonToYamlTool } from "@/features/converters/json-to-yaml/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(jsonToYamlTool);

export default function Page() {
  return <ToolPage tool={jsonToYamlTool} related={relatedTools(jsonToYamlTool)} />;
}
