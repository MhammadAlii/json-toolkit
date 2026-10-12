import type { ToolMeta } from "@/core/tool/types";

export const base64ConverterTool: ToolMeta = {
  slug: "base64-converter",
  name: "Base64 Converter",
  h1: "Base64 Encoder & Decoder",
  title: "Base64 Encode / Decode – Convert Text and Files Online",
  description:
    "Encode text or files to Base64, or decode Base64 back to text. Supports UTF-8 and URL-safe Base64. Free and runs entirely in your browser.",
  keywords: ["base64 encode", "base64 decode", "base64 converter", "base64 online", "base64 to text"],
  category: "utilities",
  tagline: "Encode and decode Base64",
  summary: "Quickly transform strings or images to and from Base64 encoding.",
  icon: "barcode",
  tint: "pink",
  intro:
    "Convert text to Base64 and back, with full UTF-8 support so emoji and non-Latin characters survive the round trip. URL-safe Base64 is handled too.",
  steps: ["Choose Encode or Decode.", "Paste text, Base64, or pick a file.", "Copy or download the result."],
  faqs: [
    {
      q: "Is Base64 encryption?",
      a: "No. Base64 is an encoding, not encryption. Anyone can decode it, so never use it to protect secrets.",
    },
    {
      q: "What is URL-safe Base64?",
      a: "A variant that uses - and _ instead of + and /, and often drops = padding, so it can be used in URLs. Both forms can be decoded here.",
    },
  ],
  related: ["url-encoder", "jwt-decoder", "json-formatter"],
};
