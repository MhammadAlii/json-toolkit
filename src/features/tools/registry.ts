import type { ToolMeta } from "@/core/tool/types";
import { deepSearchTool } from "./deep-search/meta";
import { diffTool } from "./diff/meta";
import { formatterTool } from "./formatter/meta";
import { minifierTool } from "./minifier/meta";
import { querySelectorTool } from "./query-selector/meta";
import { repairTool } from "./repair/meta";
import { schemaValidatorTool } from "./schema-validator/meta";
import { tableViewerTool } from "./table-viewer/meta";
import { treeViewerTool } from "./tree-viewer/meta";
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
];
