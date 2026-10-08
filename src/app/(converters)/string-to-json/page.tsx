import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";
import { stringToJsonTool } from "@/features/converters/string-to-json/meta";

export const metadata = toolMetadata(stringToJsonTool);

export default function Page() {
  return <ToolPage tool={stringToJsonTool} related={relatedTools(stringToJsonTool)} />;
}
