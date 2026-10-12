import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { urlEncoderTool } from "@/features/utilities/url-encoder/meta";
import { UrlEncoderToolPage } from "@/features/utilities/url-encoder/url-encoder-tool-page";

export const metadata = toolMetadata(urlEncoderTool);

export default function Page() {
  return <UrlEncoderToolPage tool={urlEncoderTool} related={relatedTools(urlEncoderTool)} />;
}
