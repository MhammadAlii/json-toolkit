import type { GuideMeta } from "./guide";
import { fixJsonErrorsGuide } from "./fix-json-errors/meta";
import { formatJsonGuide } from "./format-json/meta";
import { jsonPathCheatSheetGuide } from "./jsonpath-cheat-sheet/meta";
import { jsonToExcelGuide } from "./json-to-excel/meta";
import { jsonVsYamlGuide } from "./json-vs-yaml/meta";
import { whatIsJwtGuide } from "./what-is-jwt/meta";

export const guides: GuideMeta[] = [fixJsonErrorsGuide, formatJsonGuide, jsonVsYamlGuide, jsonToExcelGuide, whatIsJwtGuide, jsonPathCheatSheetGuide];
