import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";
import { jsonToStringTool } from "@/features/converters/json-to-string/meta";

export const metadata = toolMetadata(jsonToStringTool);

export default function Page() {
  return <ToolPage tool={jsonToStringTool} related={relatedTools(jsonToStringTool)} />;
}
