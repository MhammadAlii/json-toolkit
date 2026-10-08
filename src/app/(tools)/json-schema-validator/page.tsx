import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { schemaValidatorTool } from "@/features/tools/schema-validator/meta";
import { SchemaToolPage } from "@/features/tools/schema-validator/schema-tool-page";

export const metadata = toolMetadata(schemaValidatorTool);

export default function Page() {
  return <SchemaToolPage tool={schemaValidatorTool} related={relatedTools(schemaValidatorTool)} />;
}
