import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { jsonToCsvTool } from "@/features/converters/json-to-csv/meta";
import { JsonToCsvToolPage } from "@/features/converters/json-to-csv/json-to-csv-tool-page";

export const metadata = toolMetadata(jsonToCsvTool);

export default function Page() {
  return <JsonToCsvToolPage tool={jsonToCsvTool} related={relatedTools(jsonToCsvTool)} />;
}
