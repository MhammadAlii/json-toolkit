import { diffTool } from "@/features/tools/diff/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(diffTool);

export default function Page() {
  return <ToolPage tool={diffTool} related={relatedTools(diffTool)} />;
}
