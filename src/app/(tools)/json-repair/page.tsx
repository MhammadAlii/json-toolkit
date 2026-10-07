import { repairTool } from "@/features/tools/repair/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(repairTool);

export default function Page() {
  return <ToolPage tool={repairTool} related={relatedTools(repairTool)} />;
}
