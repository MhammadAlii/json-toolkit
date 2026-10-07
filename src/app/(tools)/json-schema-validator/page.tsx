import { schemaValidatorTool } from "@/features/tools/schema-validator/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(schemaValidatorTool);

export default function Page() {
  return <ToolPage tool={schemaValidatorTool} related={relatedTools(schemaValidatorTool)} />;
}
