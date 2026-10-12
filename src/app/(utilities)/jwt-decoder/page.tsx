import { toolMetadata } from "@/components/tool/tool-metadata";
import { ToolPage } from "@/components/tool/tool-page";
import { relatedTools } from "@/features/catalog";
import { jwtDecoderTool } from "@/features/utilities/jwt-decoder/meta";

export const metadata = toolMetadata(jwtDecoderTool);

export default function Page() {
  return <ToolPage tool={jwtDecoderTool} related={relatedTools(jwtDecoderTool)} />;
}
