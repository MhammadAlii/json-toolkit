import { validatorTool } from "@/features/tools/validator/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(validatorTool);

export default function Page() {
  return <ToolPage tool={validatorTool} related={relatedTools(validatorTool)} />;
}
