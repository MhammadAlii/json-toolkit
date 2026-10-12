import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { epochConverterTool } from "@/features/utilities/epoch-converter/meta";
import { EpochConverterToolPage } from "@/features/utilities/epoch-converter/epoch-converter-tool-page";

export const metadata = toolMetadata(epochConverterTool);

export default function Page() {
  return <EpochConverterToolPage tool={epochConverterTool} related={relatedTools(epochConverterTool)} />;
}
