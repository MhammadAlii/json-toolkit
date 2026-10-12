import { formatUtc } from "@/core/text/format-date";
import { relativeTime } from "@/core/text/relative-time";

export type TimeUnit = "s" | "ms" | "us" | "ns";

export type EpochOptions = {
  /** `auto` picks the unit from the number of digits. */
  unit: "auto" | TimeUnit;
  /** How dates without a time zone are read. */
  zone: "local" | "utc";
};

export const defaultEpochOptions: EpochOptions = { unit: "auto", zone: "local" };

export type ParsedTime = { ok: true; ms: number; source: "timestamp" | "date"; unit?: TimeUnit } | { ok: false; error: string };

export type TimeFormat = { label: string; value: string };

export const unitLabels: Record<TimeUnit, string> = { s: "Seconds", ms: "Milliseconds", us: "Microseconds", ns: "Nanoseconds" };

// Dates beyond ±100,000,000 days from 1970 can't be represented.
const maxMs = 8.64e15;

// Up to 11 digits covers seconds until the year 5138; each extra three digits is the next smaller unit.
function guessUnit(integerDigits: number): TimeUnit {
  if (integerDigits <= 11) return "s";
  if (integerDigits <= 14) return "ms";
  if (integerDigits <= 17) return "us";
  return "ns";
}

const perMs: Record<TimeUnit, number> = { s: 1e-3, ms: 1, us: 1e3, ns: 1e6 };

// Splits the digits by place instead of dividing, so 19-digit nanosecond values keep their precision.
function toMs(sign: number, integer: string, fraction: string, unit: TimeUnit): number {
  if (unit === "s") return sign * Number(`${integer}.${fraction || "0"}`) * 1000;
  if (unit === "ms") return sign * Number(`${integer}.${fraction || "0"}`);
  const shift = Math.log10(perMs[unit]);
  const whole = integer.length > shift ? integer.slice(0, integer.length - shift) : "0";
  const rest = integer.slice(-shift).padStart(shift, "0") + fraction;
  return sign * Number(`${whole}.${rest}`);
}

const isoLocal = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?)?$/;

function parseDate(text: string, zone: EpochOptions["zone"]): number {
  // ISO dates without an offset are read in the chosen zone; anything else goes to the built-in parser.
  const m = isoLocal.exec(text);
  if (m) {
    const [, y, mo, d, h = "0", mi = "0", s = "0", frac = ""] = m;
    const parts = [+y, +mo - 1, +d, +h, +mi, +s, Number(`0.${frac || "0"}`) * 1000] as const;
    const ms = zone === "utc" ? Date.UTC(...parts) : new Date(...parts).getTime();
    const check = new Date(ms);
    const month = zone === "utc" ? check.getUTCMonth() : check.getMonth();
    return month === +mo - 1 && +h < 24 && +mi < 60 && +s < 60 ? ms : NaN;
  }
  return Date.parse(text);
}

/** Reads a Unix timestamp (seconds, milliseconds, microseconds or nanoseconds) or a date string. */
export function parseTime(input: string, options: EpochOptions): ParsedTime {
  const text = input.trim();
  if (!text) return { ok: false, error: "Empty line." };
  const num = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(text);
  if (num) {
    const [, signText, integer, fraction = ""] = num;
    const unit = options.unit === "auto" ? guessUnit(integer.replace(/^0+(?=\d)/, "").length) : options.unit;
    const ms = toMs(signText === "-" ? -1 : 1, integer, fraction, unit);
    if (!Number.isFinite(ms) || Math.abs(ms) > maxMs) return { ok: false, error: "That timestamp is outside the range of dates that can be shown." };
    return { ok: true, ms, source: "timestamp", unit };
  }
  const ms = parseDate(text, options.zone);
  if (Number.isNaN(ms)) return { ok: false, error: "Not a timestamp or a date this tool understands. Try ISO 8601, e.g. 2024-01-05T09:30:00Z." };
  if (Math.abs(ms) > maxMs) return { ok: false, error: "That date is outside the range that can be shown." };
  return { ok: true, ms, source: "date" };
}

// ISO 8601 week number: weeks start on Monday and week 1 contains the year's first Thursday.
function isoWeek(d: Date): string {
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - weekday);
  const yearStart = Date.UTC(day.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((day.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${day.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const dayOfYear = (d: Date) => Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000) + 1;

/** "Sat, 5 Oct 2024, 13:00:00 GMT+3" in the given IANA time zone (the system's when omitted). */
export function formatZoned(ms: number, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(ms);
}

/** Every format the tool shows for one point in time; `now` is in seconds and drives the relative time. */
export function timeFormats(ms: number, now: number | null, timeZone?: string): TimeFormat[] {
  const d = new Date(ms);
  const seconds = ms / 1000;
  return [
    { label: "Unix seconds", value: String(Math.floor(seconds)) },
    { label: "Unix milliseconds", value: String(Math.floor(ms)) },
    { label: "ISO 8601 (UTC)", value: d.toISOString() },
    { label: "UTC", value: formatUtc(Math.floor(ms) / 1000) },
    { label: "Your time zone", value: formatZoned(ms, timeZone) },
    { label: "HTTP date (RFC 7231)", value: d.toUTCString() },
    ...(now === null ? [] : [{ label: "Relative", value: relativeTime(Math.floor(seconds), now) }]),
    { label: "Day of year", value: String(dayOfYear(d)) },
    { label: "ISO week", value: isoWeek(d) },
  ];
}
