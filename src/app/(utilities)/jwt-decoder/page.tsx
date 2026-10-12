import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { jwtDecoderTool } from "@/features/utilities/jwt-decoder/meta";
import { JwtDecoderToolPage } from "@/features/utilities/jwt-decoder/jwt-decoder-tool-page";

export const metadata = toolMetadata(jwtDecoderTool);

export default function Page() {
  return <JwtDecoderToolPage tool={jwtDecoderTool} related={relatedTools(jwtDecoderTool)} />;
}
