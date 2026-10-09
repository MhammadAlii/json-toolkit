import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { minifierTool } from "@/features/tools/minifier/meta";
import { MinifierToolPage } from "@/features/tools/minifier/minifier-tool-page";

export const metadata = toolMetadata(minifierTool);

export default function Page() {
  return <MinifierToolPage tool={minifierTool} related={relatedTools(minifierTool)} />;
}
