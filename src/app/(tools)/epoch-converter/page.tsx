import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";
import { epochConverterTool } from "@/features/tools/epoch-converter/meta";

export const metadata = toolMetadata(epochConverterTool);

export default function Page() {
  return <ToolPage tool={epochConverterTool} related={relatedTools(epochConverterTool)} />;
}
