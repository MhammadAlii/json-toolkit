import type { ToolMeta } from "@/core/tool/types";

export const urlEncoderTool: ToolMeta = {
  slug: "url-encoder",
  name: "URL Encoder/Decoder",
  h1: "URL Encoder & Decoder",
  title: "URL Encoder / Decoder – Encode URL Parameters Online",
  description:
    "Encode or decode text for safe use in URLs and query parameters (percent-encoding). Free, instant and runs in your browser.",
  keywords: ["url encoder", "url decoder", "url encode online", "percent encoding", "encode query string"],
  category: "utilities",
  tagline: "Percent-encode text for URLs",
  summary: "Safely encode or decode strings for use in URL query parameters.",
  icon: "link",
  tint: "pink",
  intro:
    "Convert text to and from URL percent-encoding, so spaces, symbols and non-ASCII characters can be used safely in links and query strings.",
  steps: [
    "Paste text to encode it, or press Swap and paste an encoded string to decode it.",
    "The result appears as you type; full URLs are broken down into their parts and query parameters.",
    "Use Options for query-value, full-URL or form encoding and line-by-line conversion, then copy the result.",
  ],
  faqs: [
    {
      q: "Which characters get encoded?",
      a: "By default everything except letters, digits and - _ . ! ~ * ' ( ) is percent-encoded, matching JavaScript's encodeURIComponent. Full URL mode also keeps : / ? # & = so the link still works, and form mode writes spaces as +.",
    },
    {
      q: "Why does my decoded text show an error?",
      a: "A % must be followed by two hex digits, and the bytes must form valid UTF-8. The error names the character position of the first problem.",
    },
  ],
  related: ["base64-converter", "jwt-decoder", "json-formatter"],
};
