import type { ToolMeta } from "@/core/tool/types";

export const jwtDecoderTool: ToolMeta = {
  slug: "jwt-decoder",
  name: "JWT Decoder",
  h1: "JWT Decoder",
  title: "JWT Decoder – Decode JSON Web Tokens Online",
  description:
    "Decode JSON Web Tokens to inspect the header, payload and expiry. Runs entirely in your browser, so your tokens are never sent to a server.",
  keywords: ["jwt decoder", "decode jwt", "jwt parser", "json web token decoder", "jwt viewer"],
  category: "utilities",
  tagline: "Inspect JWT header and payload",
  summary: "Securely decode JSON Web Tokens and inspect header and payload data.",
  icon: "key",
  tint: "pink",
  intro:
    "Paste a JWT to see its header and payload as formatted JSON, with issued-at and expiry times shown as readable dates. Decoding happens locally, so tokens stay private.",
  steps: ["Paste a JSON Web Token.", "Read the decoded header and payload.", "Check the expiry and claims."],
  faqs: [
    {
      q: "Does this verify the signature?",
      a: "No. Decoding only reads the token's contents. Verifying the signature requires the secret or public key and should be done by your server.",
    },
    {
      q: "Is it safe to paste a real token?",
      a: "The token is decoded in your browser and never sent anywhere. Still, treat production tokens like passwords and avoid sharing them.",
    },
  ],
  related: ["base64-converter", "json-formatter", "epoch-converter"],
};
