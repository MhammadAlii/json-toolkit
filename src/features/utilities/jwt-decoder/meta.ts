import type { ToolMeta } from "@/core/tool/types";

export const jwtDecoderTool: ToolMeta = {
  slug: "jwt-decoder",
  name: "JWT Decoder",
  h1: "JWT Decoder",
  title: "JWT Decoder – Decode JSON Web Tokens Online",
  description:
    "Decode JSON Web Tokens to inspect the header, payload, claims and expiry, and verify the signature. Runs entirely in your browser, so your tokens are never sent to a server.",
  keywords: ["jwt decoder", "decode jwt", "jwt parser", "json web token decoder", "jwt viewer"],
  category: "utilities",
  tagline: "Inspect JWT header and payload",
  summary: "Securely decode JSON Web Tokens and inspect header and payload data.",
  icon: "key",
  tint: "pink",
  intro:
    "Paste a JWT to see its header and payload as formatted JSON, with issued-at and expiry times shown as readable dates. Decoding happens locally, so tokens stay private.",
  steps: [
    "Paste a JSON Web Token; a leading \"Bearer \" is ignored.",
    "Read the decoded payload and header, with every claim explained and times shown as dates.",
    "Use Verify with the secret or public key to check the signature, then copy or download the JSON.",
  ],
  faqs: [
    {
      q: "Can it verify the signature?",
      a: "Yes. Open Verify and enter the shared secret (HS256, HS384, HS512) or a PEM or JWK public key (RS, PS and ES algorithms). The check runs in your browser with the Web Crypto API.",
    },
    {
      q: "Is it safe to paste a real token?",
      a: "The token is decoded in your browser and never sent anywhere. Still, treat production tokens like passwords and avoid sharing them.",
    },
  ],
  related: ["base64-converter", "json-formatter", "epoch-converter"],
};
