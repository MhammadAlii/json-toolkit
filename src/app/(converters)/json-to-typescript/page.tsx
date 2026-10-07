import { jsonToTypeScriptTool } from "@/features/converters/json-to-typescript/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(jsonToTypeScriptTool);

export default function Page() {
  return <ToolPage tool={jsonToTypeScriptTool} related={relatedTools(jsonToTypeScriptTool)} />;
}
