import type { ToolMeta } from "@/core/tool/types";

export const jwtDecoderTool: ToolMeta = {
  slug: "jwt-decoder",
  name: "JWT Encoder & Decoder",
  h1: "JWT Encoder & Decoder",
  title: "JWT Decoder & Encoder – Decode, Verify and Sign JSON Web Tokens Online",
  description:
    "Decode JSON Web Tokens to inspect the header, payload, claims and expiry and verify the signature, or sign a JSON payload into a new token with HS, RS, PS or ES algorithms. Runs entirely in your browser.",
  keywords: ["jwt decoder", "jwt encoder", "decode jwt", "create jwt", "sign jwt", "jwt generator", "jwt parser", "json web token decoder", "jwt viewer"],
  category: "utilities",
  tagline: "Decode, verify and sign JWTs",
  summary: "Decode and verify JSON Web Tokens, or sign a JSON payload into a new token.",
  icon: "key",
  tint: "pink",
  intro:
    "Paste a JWT to see its header and payload as formatted JSON, with issued-at and expiry times shown as readable dates, or swap direction to sign a JSON payload into a new token. Decoding and signing happen locally, so tokens and keys stay private.",
  steps: [
    "Paste a JSON Web Token to decode it (a leading \"Bearer \" is ignored), or press Swap and paste a JSON payload to create one.",
    "Read the decoded payload and header with every claim explained, or open Sign to choose the algorithm, secret or private key, expiry and key ID.",
    "Use Verify with the secret or public key to check a signature; after signing, Swap carries the token and key across so it shows as verified.",
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
    {
      q: "How do I create a signed JWT?",
      a: "Press Swap, paste the claims as a JSON object, then open Sign. HS algorithms use a shared secret; RS, PS and ES algorithms use a private key in PEM (PKCS#8) or JWK form, or a key pair generated on the spot. Options add iat, an expiry and a kid header. Keys are never stored or sent anywhere.",
    },
  ],
  related: ["base64-converter", "json-formatter", "epoch-converter"],
};
