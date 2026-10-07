export type EpochUnit = "seconds" | "milliseconds";

export type EpochResult =
  | { ok: true; date: Date; seconds: number; milliseconds: number; iso: string; utc: string; unit: EpochUnit }
  | { ok: false; error: string };

function result(date: Date, unit: EpochUnit): EpochResult {
  if (Number.isNaN(date.getTime())) return { ok: false, error: "That isn't a valid date or timestamp." };
  return {
    ok: true,
    date,
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    unit,
  };
}

// 13+ digit timestamps are treated as milliseconds unless a unit is given.
export function fromTimestamp(input: string, unit?: EpochUnit): EpochResult {
  const trimmed = input.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return { ok: false, error: "Enter a number of seconds or milliseconds." };
  const resolved: EpochUnit = unit ?? (trimmed.replace("-", "").split(".")[0].length >= 13 ? "milliseconds" : "seconds");
  const value = Number(trimmed);
  return result(new Date(resolved === "seconds" ? value * 1000 : value), resolved);
}

export function fromDate(input: string): EpochResult {
  if (input.trim() === "") return { ok: false, error: "Enter a date, for example 2026-10-08 14:30 or an ISO 8601 string." };
  return result(new Date(input.trim()), "seconds");
}
