const pad = (n: number, size = 2) => String(n).padStart(size, "0");

/** "2024-01-05 09:30:00 UTC" for a Unix time in seconds (fractions are kept as milliseconds when present). */
export function formatUtc(seconds: number): string {
  const d = new Date(seconds * 1000);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  const ms = d.getUTCMilliseconds();
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}${ms ? `.${pad(ms, 3)}` : ""}`;
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${time} UTC`;
}
