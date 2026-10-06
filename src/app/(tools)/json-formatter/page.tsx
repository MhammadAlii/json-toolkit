import { formatterTool } from "@/features/tools/formatter/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(formatterTool);

export default function Page() {
  return <ToolPage tool={formatterTool} related={relatedTools(formatterTool)} />;
}
