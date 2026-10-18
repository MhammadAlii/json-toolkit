import type { GuideMeta } from "../guide";

export const unixTimestampGuide: GuideMeta = {
  slug: "unix-timestamp",
  title: "What Is a Unix Timestamp (Epoch Time)? How to Convert It",
  h1: "What is a Unix timestamp and how do you convert it?",
  description:
    "What Unix (epoch) time is, seconds vs milliseconds, the year 2038 problem, and how to get and convert timestamps in JavaScript, Python, the shell and online.",
  keywords: ["unix timestamp", "epoch time", "what is epoch time", "unix time converter", "timestamp to date", "seconds vs milliseconds timestamp", "year 2038 problem"],
  summary: "What a Unix timestamp counts, how to tell seconds from milliseconds, why 2038 matters, and how to convert timestamps to dates in any language.",
  published: "2026-10-18",
  updated: "2026-10-18",
  readingMinutes: 5,
  tools: ["epoch-converter", "jwt-decoder", "json-formatter"],
  faqs: [
    {
      q: "Are Unix timestamps in UTC?",
      a: "Yes. A timestamp is the number of seconds since 1 January 1970 00:00:00 UTC, so it's the same everywhere in the world. Time zones only come in when you display it as a date.",
    },
    {
      q: "How do I know if a timestamp is in seconds or milliseconds?",
      a: "Count the digits. Current dates are 10 digits in seconds (like 1760000000) and 13 in milliseconds (1760000000000). Microseconds have 16 digits and nanoseconds 19.",
    },
    {
      q: "Can a Unix timestamp be negative?",
      a: "Yes. Negative values are dates before 1970; for example -86400 is 31 December 1969 00:00:00 UTC.",
    },
  ],
};
