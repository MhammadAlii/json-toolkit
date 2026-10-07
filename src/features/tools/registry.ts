import type { ToolMeta } from "@/core/tool/types";
import { base64ConverterTool } from "./base64-converter/meta";
import { deepSearchTool } from "./deep-search/meta";
import { diffTool } from "./diff/meta";
import { epochConverterTool } from "./epoch-converter/meta";
import { formatterTool } from "./formatter/meta";
import { jwtDecoderTool } from "./jwt-decoder/meta";
import { minifierTool } from "./minifier/meta";
import { querySelectorTool } from "./query-selector/meta";
import { repairTool } from "./repair/meta";
import { schemaValidatorTool } from "./schema-validator/meta";
import { tableViewerTool } from "./table-viewer/meta";
import { treeViewerTool } from "./tree-viewer/meta";
import { urlEncoderTool } from "./url-encoder/meta";
import { validatorTool } from "./validator/meta";

export const tools: ToolMeta[] = [
  formatterTool,
  validatorTool,
  repairTool,
  minifierTool,
  treeViewerTool,
  tableViewerTool,
  deepSearchTool,
  diffTool,
  schemaValidatorTool,
  querySelectorTool,
  jwtDecoderTool,
  urlEncoderTool,
  base64ConverterTool,
  epochConverterTool,
];
