import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { repairTool } from "@/features/tools/repair/meta";
import { RepairToolPage } from "@/features/tools/repair/repair-tool-page";

export const metadata = toolMetadata(repairTool);

export default function Page() {
  return <RepairToolPage tool={repairTool} related={relatedTools(repairTool)} />;
}
