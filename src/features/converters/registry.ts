import type { ToolMeta } from "@/core/tool/types";
import { jsonToCsvTool } from "./json-to-csv/meta";
import { jsonToExcelTool } from "./json-to-excel/meta";
import { jsonToSqlTool } from "./json-to-sql/meta";
import { jsonToStringTool } from "./json-to-string/meta";
import { jsonToTypeScriptTool } from "./json-to-typescript/meta";
import { jsonToXmlTool } from "./json-to-xml/meta";
import { jsonToYamlTool } from "./json-to-yaml/meta";

export const converters: ToolMeta[] = [
  jsonToYamlTool,
  jsonToCsvTool,
  jsonToTypeScriptTool,
  jsonToExcelTool,
  jsonToXmlTool,
  jsonToSqlTool,
  jsonToStringTool,
];
