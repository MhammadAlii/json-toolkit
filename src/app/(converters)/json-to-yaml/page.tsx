import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { jsonToYamlTool } from "@/features/converters/json-to-yaml/meta";
import { JsonToYamlToolPage } from "@/features/converters/json-to-yaml/json-to-yaml-tool-page";

export const metadata = toolMetadata(jsonToYamlTool);

export default function Page() {
  return <JsonToYamlToolPage tool={jsonToYamlTool} related={relatedTools(jsonToYamlTool)} />;
}
