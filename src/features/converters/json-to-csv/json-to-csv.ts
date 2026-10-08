import { toCsv, type Delimiter } from "@/core/json/csv";
import { fromParse, type TransformResult } from "@/core/json/parse";

export type { Delimiter };

export function jsonToCsv(input: string, delimiter: Delimiter = ","): TransformResult {
  return fromParse(input, (value) => {
    const items = Array.isArray(value) ? value : [value];
    if (items.length === 0) return { ok: false, error: "The JSON array is empty, so there are no rows to convert." };
    const { csv, rows, columns } = toCsv(items, delimiter);
    return { ok: true, output: csv, note: `${rows} row(s), ${columns} column(s).` };
  });
}
