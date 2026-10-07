import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";
import { urlEncoderTool } from "@/features/tools/url-encoder/meta";

export const metadata = toolMetadata(urlEncoderTool);

export default function Page() {
  return <ToolPage tool={urlEncoderTool} related={relatedTools(urlEncoderTool)} />;
}
