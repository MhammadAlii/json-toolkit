import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { base64ConverterTool } from "@/features/utilities/base64-converter/meta";
import { Base64ConverterToolPage } from "@/features/utilities/base64-converter/base64-converter-tool-page";

export const metadata = toolMetadata(base64ConverterTool);

export default function Page() {
  return <Base64ConverterToolPage tool={base64ConverterTool} related={relatedTools(base64ConverterTool)} />;
}
