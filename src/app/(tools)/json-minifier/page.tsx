import { minifierTool } from "@/features/tools/minifier/meta";
import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";

export const metadata = toolMetadata(minifierTool);

export default function Page() {
  return <ToolPage tool={minifierTool} related={relatedTools(minifierTool)} />;
}
