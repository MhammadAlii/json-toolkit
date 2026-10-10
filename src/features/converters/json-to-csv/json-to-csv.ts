import { defaultCsvOptions, toCsv, type CsvOptions, type CsvResult } from "@/core/json/csv";
import { isPlainObject } from "@/core/json/path";

export type CsvConverterOptions = CsvOptions & {
  /** Start the file with a byte order mark so Excel opens UTF-8 text correctly. */
  bom: boolean;
};

export const defaultCsvConverterOptions: CsvConverterOptions = { ...defaultCsvOptions, bom: false };

export type CsvConversion = CsvResult & {
  /** Set when the input isn't an array of objects, which is what CSV represents best. */
  warning?: string;
  /** Top-level properties holding arrays of objects, which could be converted instead of the whole input. */
  suggestions: { key: string; rows: number }[];
};

const isRecords = (v: unknown): v is Record<string, unknown>[] => Array.isArray(v) && v.length > 0 && v.every(isPlainObject);

/** Converts JSON to CSV rows; `rootKey` picks a top-level array property to convert instead of the whole value. */
export function convertToCsv(value: unknown, options: CsvOptions, rootKey?: string): CsvConversion {
  const source = rootKey && isPlainObject(value) && Array.isArray(value[rootKey]) ? value[rootKey] : value;
  const items = Array.isArray(source) ? source : [source];
  const suggestions = isPlainObject(value)
    ? Object.entries(value)
        .filter(([, v]) => isRecords(v))
        .map(([key, v]) => ({ key, rows: (v as unknown[]).length }))
    : [];
  const warning = isRecords(source)
    ? undefined
    : Array.isArray(source)
      ? source.length === 0
        ? "The array is empty, so there are no rows."
        : "CSV works best with an array of objects; other items are written to a single value column."
      : "CSV works best with an array of objects; this object is written as a single row.";
  return { ...toCsv(items, options), warning, suggestions };
}

export const withBom = (csv: string, bom: boolean) => (bom ? `﻿${csv}` : csv);
