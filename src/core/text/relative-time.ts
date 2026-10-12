const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "in 3 hours", "2 days ago", "now": the gap between `seconds` and `nowSeconds` in its largest unit, rounded. */
export function relativeTime(seconds: number, nowSeconds: number): string {
  const diff = seconds - nowSeconds;
  for (const [unit, size] of units) {
    if (Math.abs(diff) >= size || unit === "second") return format.format(Math.round(diff / size), unit);
  }
  return "";
}
