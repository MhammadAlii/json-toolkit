import type { GuideMeta } from "../guide";

export const base64ExplainedGuide: GuideMeta = {
  slug: "base64-explained",
  title: "What Is Base64 Encoding? How It Works and How to Encode or Decode",
  h1: "What is Base64 encoding and how does it work?",
  description:
    "What Base64 is for, how it turns bytes into text, why it adds 33% and = padding, URL-safe Base64, and how to encode and decode it in JavaScript, Python and online.",
  keywords: ["what is base64", "base64 encoding", "base64 explained", "base64 encode decode", "base64 url safe", "btoa unicode", "base64 padding"],
  summary: "Why Base64 exists, how three bytes become four characters, what the = padding means, and how to encode and decode it correctly, emoji included.",
  published: "2026-10-18",
  updated: "2026-10-18",
  readingMinutes: 5,
  tools: ["base64-converter", "jwt-decoder", "url-encoder"],
  faqs: [
    {
      q: "Is Base64 encryption?",
      a: "No. Base64 is an encoding: anyone can decode it without a key. Never use it to hide passwords or secrets.",
    },
    {
      q: "Why does Base64 end with = or ==?",
      a: "Base64 works on groups of 3 bytes. When the input length isn't a multiple of 3, the last group is padded: one = means one byte was missing, == means two.",
    },
    {
      q: "Why is my Base64 bigger than the original?",
      a: "Every 3 bytes become 4 characters, so Base64 is about 33% larger than the data it encodes, plus a little padding.",
    },
  ],
};
