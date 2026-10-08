import { toolMetadata } from "@/components/tool/tool-metadata";
import { relatedTools } from "@/features/catalog";
import { FormatterToolPage } from "@/features/tools/formatter/formatter-tool-page";
import { formatterTool } from "@/features/tools/formatter/meta";

export const metadata = toolMetadata(formatterTool);

export default function Page() {
  return <FormatterToolPage tool={formatterTool} related={relatedTools(formatterTool)} />;
}
