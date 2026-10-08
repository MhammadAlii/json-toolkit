import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { QueryToolPage } from "@/features/tools/query-selector/query-tool-page";
import { querySelectorTool } from "@/features/tools/query-selector/meta";

export const metadata = toolMetadata(querySelectorTool);

export default function Page() {
  return <QueryToolPage tool={querySelectorTool} related={relatedTools(querySelectorTool)} />;
}
