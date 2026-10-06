import { querySelectorTool } from "@/features/tools/query-selector/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(querySelectorTool);

export default function Page() {
  return <ToolPage tool={querySelectorTool} related={relatedTools(querySelectorTool)} />;
}
