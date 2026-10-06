import { jsonToSqlTool } from "@/features/converters/json-to-sql/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(jsonToSqlTool);

export default function Page() {
  return <ToolPage tool={jsonToSqlTool} related={relatedTools(jsonToSqlTool)} />;
}
