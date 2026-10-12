import type { ToolMeta } from "@/core/tool/types";

export const epochConverterTool: ToolMeta = {
  slug: "epoch-converter",
  name: "Epoch Time Converter",
  h1: "Epoch & Unix Timestamp Converter",
  title: "Epoch Converter – Unix Timestamp to Date and Back",
  description:
    "Convert Unix timestamps (seconds or milliseconds) to human-readable dates in UTC and your local time, or turn a date into a timestamp. Free and instant.",
  keywords: ["epoch converter", "unix timestamp converter", "timestamp to date", "epoch to date", "date to timestamp"],
  category: "utilities",
  tagline: "Unix timestamps to dates and back",
  summary: "Convert Unix timestamps to human-readable dates and vice versa.",
  icon: "clock",
  tint: "pink",
  intro:
    "Paste a Unix timestamp to see the exact date in UTC, your local time zone and ISO 8601, or enter a date to get its timestamp. Seconds and milliseconds are detected automatically.",
  steps: [
    "Paste a Unix timestamp or a date, or press Now; paste several, one per line, to convert them all at once.",
    "One value is shown in every format (UTC, your time zone, ISO 8601, HTTP date, relative, ISO week); several are shown as a table.",
    "Use Options to force the timestamp unit or read zone-less dates as UTC, then copy a single format or the whole result.",
  ],
  faqs: [
    {
      q: "Seconds or milliseconds?",
      a: "Up to 11 digits is read as seconds, 12 to 14 as milliseconds, 15 to 17 as microseconds and longer as nanoseconds. You can pick the unit in Options instead.",
    },
    {
      q: "What is the Unix epoch?",
      a: "The number of seconds since 1 January 1970 00:00:00 UTC, the standard way computers store points in time.",
    },
  ],
  related: ["jwt-decoder", "json-formatter", "base64-converter"],
};
