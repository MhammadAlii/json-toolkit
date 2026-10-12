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
  steps: ["Choose Encode or Decode.", "Paste your text or encoded string.", "Copy the result."],
  faqs: [
    {
      q: "Which characters get encoded?",
      a: "Everything except letters, digits and - _ . ! ~ * ' ( ) is percent-encoded, matching JavaScript's encodeURIComponent.",
    },
    {
      q: "Why does my decoded text show an error?",
      a: "A % must be followed by two hex digits. Malformed sequences like %ZZ can't be decoded.",
    },
  ],
  related: ["base64-converter", "jwt-decoder", "json-formatter"],
};
