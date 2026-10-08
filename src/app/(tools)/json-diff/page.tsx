import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { DiffToolPage } from "@/features/tools/diff/diff-tool-page";
import { diffTool } from "@/features/tools/diff/meta";

export const metadata = toolMetadata(diffTool);

export default function Page() {
  return <DiffToolPage tool={diffTool} related={relatedTools(diffTool)} />;
}
