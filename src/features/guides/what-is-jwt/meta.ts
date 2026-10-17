import type { GuideMeta } from "../guide";

export const whatIsJwtGuide: GuideMeta = {
  slug: "what-is-jwt",
  title: "What Is a JWT? JSON Web Tokens Explained, With a Decoding Example",
  h1: "What is a JWT? How JSON Web Tokens work",
  description:
    "What a JSON Web Token is, what its header, payload and signature contain, what claims like exp and iat mean, how to decode one, and the security mistakes to avoid.",
  keywords: ["what is jwt", "json web token", "jwt explained", "how jwt works", "decode jwt", "jwt claims", "jwt exp iat", "is jwt encrypted"],
  summary: "The three parts of a JSON Web Token, what the claims inside mean, how to decode and verify one, and the mistakes that make JWTs insecure.",
  published: "2026-10-17",
  updated: "2026-10-17",
  readingMinutes: 6,
  tools: ["jwt-decoder", "base64-converter", "epoch-converter"],
  faqs: [
    {
      q: "Is a JWT encrypted?",
      a: "Usually not. A normal (signed) JWT is only Base64URL-encoded, so anyone with the token can read the payload. The signature proves it wasn't changed; it doesn't hide anything. Encrypted tokens (JWE) exist but are much less common.",
    },
    {
      q: "Is it safe to paste a JWT into an online decoder?",
      a: "Only into one that decodes in your browser without sending the token anywhere, like the JSON Toolkit JWT Decoder. A valid token can be used to act as you until it expires, so treat production tokens like passwords.",
    },
    {
      q: "What's the difference between HS256 and RS256?",
      a: "HS256 signs with one shared secret, so whoever verifies the token can also create tokens. RS256 signs with a private key and verifies with a public key, so services can check tokens without being able to issue them.",
    },
  ],
};
