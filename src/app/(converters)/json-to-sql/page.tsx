import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { jsonToSqlTool } from "@/features/converters/json-to-sql/meta";
import { JsonToSqlToolPage } from "@/features/converters/json-to-sql/json-to-sql-tool-page";

export const metadata = toolMetadata(jsonToSqlTool);

export default function Page() {
  return <JsonToSqlToolPage tool={jsonToSqlTool} related={relatedTools(jsonToSqlTool)} />;
}
