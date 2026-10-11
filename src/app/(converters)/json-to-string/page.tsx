import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { jsonToStringTool } from "@/features/converters/json-to-string/meta";
import { JsonToStringToolPage } from "@/features/converters/json-to-string/json-to-string-tool-page";

export const metadata = toolMetadata(jsonToStringTool);

export default function Page() {
  return <JsonToStringToolPage tool={jsonToStringTool} related={relatedTools(jsonToStringTool)} />;
}
