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
  steps: ["Paste a timestamp or a date.", "See it in UTC, local time and ISO 8601.", "Copy the format you need."],
  faqs: [
    {
      q: "Seconds or milliseconds?",
      a: "Timestamps with 13 or more digits are treated as milliseconds, shorter ones as seconds. You can switch manually if needed.",
    },
    {
      q: "What is the Unix epoch?",
      a: "The number of seconds since 1 January 1970 00:00:00 UTC, the standard way computers store points in time.",
    },
  ],
  related: ["jwt-decoder", "json-formatter", "base64-converter"],
};
