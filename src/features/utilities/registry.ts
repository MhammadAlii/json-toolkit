import type { ToolMeta } from "@/core/tool/types";
import { base64ConverterTool } from "./base64-converter/meta";
import { epochConverterTool } from "./epoch-converter/meta";
import { jwtDecoderTool } from "./jwt-decoder/meta";
import { urlEncoderTool } from "./url-encoder/meta";

export const utilities: ToolMeta[] = [jwtDecoderTool, urlEncoderTool, base64ConverterTool, epochConverterTool];
