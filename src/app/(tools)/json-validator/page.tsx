import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { validatorTool } from "@/features/tools/validator/meta";
import { ValidatorToolPage } from "@/features/tools/validator/validator-tool-page";

export const metadata = toolMetadata(validatorTool);

export default function Page() {
  return <ValidatorToolPage tool={validatorTool} related={relatedTools(validatorTool)} />;
}
