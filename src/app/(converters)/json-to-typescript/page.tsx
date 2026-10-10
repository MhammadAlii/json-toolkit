import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { jsonToTypeScriptTool } from "@/features/converters/json-to-typescript/meta";
import { JsonToTypeScriptToolPage } from "@/features/converters/json-to-typescript/json-to-typescript-tool-page";

export const metadata = toolMetadata(jsonToTypeScriptTool);

export default function Page() {
  return <JsonToTypeScriptToolPage tool={jsonToTypeScriptTool} related={relatedTools(jsonToTypeScriptTool)} />;
}
