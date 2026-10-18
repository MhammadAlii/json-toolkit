import type { GuideMeta } from "../guide";

export const urlEncodingGuide: GuideMeta = {
  slug: "url-encoding",
  title: "URL Encoding (Percent-Encoding) Explained, With Examples",
  h1: "URL encoding explained: what %20 means and how to encode URLs",
  description:
    "What URL (percent) encoding is, which characters need it, %20 vs +, encodeURIComponent vs encodeURI, and how to encode query strings in JavaScript and Python.",
  keywords: ["url encoding", "percent encoding", "what is %20", "encodeuricomponent vs encodeuri", "url encode space", "urlencode python", "query string encoding"],
  summary: "Why URLs turn spaces into %20, which characters must be encoded, the difference between %20 and +, and the right function to use in JavaScript and Python.",
  published: "2026-10-18",
  updated: "2026-10-18",
  readingMinutes: 5,
  tools: ["url-encoder", "base64-converter", "jwt-decoder"],
  faqs: [
    {
      q: "What does %20 mean in a URL?",
      a: "It's an encoded space. % followed by two hex digits is one byte; 20 in hex is 32, the code for a space character.",
    },
    {
      q: "Should a space be %20 or +?",
      a: "%20 works everywhere in a URL. + means a space only in query strings sent as HTML form data (application/x-www-form-urlencoded); in a path, + is a literal plus sign.",
    },
    {
      q: "Is URL encoding the same as Base64?",
      a: "No. URL encoding escapes only the characters that aren't allowed in a URL and leaves the rest readable. Base64 rewrites all of the data into a different alphabet.",
    },
  ],
};
