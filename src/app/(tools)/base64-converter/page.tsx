import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";
import { base64ConverterTool } from "@/features/tools/base64-converter/meta";

export const metadata = toolMetadata(base64ConverterTool);

export default function Page() {
  return <ToolPage tool={base64ConverterTool} related={relatedTools(base64ConverterTool)} />;
}
