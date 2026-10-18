import type { GuideMeta } from "./guide";
import { base64ExplainedGuide } from "./base64-explained/meta";
import { compareJsonGuide } from "./compare-json/meta";
import { fixJsonErrorsGuide } from "./fix-json-errors/meta";
import { formatJsonGuide } from "./format-json/meta";
import { jsonPathCheatSheetGuide } from "./jsonpath-cheat-sheet/meta";
import { jsonSchemaTutorialGuide } from "./json-schema-tutorial/meta";
import { jsonToExcelGuide } from "./json-to-excel/meta";
import { jsonVsXmlGuide } from "./json-vs-xml/meta";
import { jsonVsYamlGuide } from "./json-vs-yaml/meta";
import { unixTimestampGuide } from "./unix-timestamp/meta";
import { urlEncodingGuide } from "./url-encoding/meta";
import { whatIsJwtGuide } from "./what-is-jwt/meta";

// Grouped by topic: working with JSON, converting and comparing it, then the developer utilities.
export const guides: GuideMeta[] = [
  fixJsonErrorsGuide,
  formatJsonGuide,
  jsonSchemaTutorialGuide,
  jsonPathCheatSheetGuide,
  jsonVsYamlGuide,
  jsonVsXmlGuide,
  jsonToExcelGuide,
  compareJsonGuide,
  whatIsJwtGuide,
  base64ExplainedGuide,
  urlEncodingGuide,
  unixTimestampGuide,
];
