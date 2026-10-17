import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { whatIsJwtGuide } from "./meta";

const token = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJBbm4gTGVlIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYwMDAwMDAwLCJleHAiOjE3NjAwMDM2MDB9",
  "qQsxyuXRpZqDyVjyHZfuOMFhCtWzMwkSa1HGQhbSCvs",
];

const claims: [string, string, string][] = [
  ["iss", "Issuer", "Who created the token, e.g. your auth server's URL."],
  ["sub", "Subject", "Who the token is about, usually a user ID."],
  ["aud", "Audience", "Which service the token is meant for."],
  ["exp", "Expiration time", "When the token stops being valid."],
  ["nbf", "Not before", "When the token starts being valid."],
  ["iat", "Issued at", "When the token was created."],
  ["jti", "JWT ID", "A unique ID, used to detect reuse or revoke a token."],
];

export function WhatIsJwtGuidePage() {
  return (
    <GuideLayout guide={whatIsJwtGuide}>
      <p>
        A JSON Web Token (JWT, pronounced “jot”) is a compact, signed piece of JSON that a server gives a client to prove who they are.
        After you log in, the server issues a token; your browser or app sends it with every request, usually in an{" "}
        <InlineCode>Authorization: Bearer &lt;token&gt;</InlineCode> header, and the server checks the signature instead of looking up a
        session. JWTs are defined in RFC 7519.
      </p>

      <GuideSection id="structure" title="The three parts of a JWT">
        <p>A JWT is three Base64URL-encoded strings joined by dots: header, payload and signature.</p>
        <p className="rounded-xl border border-border bg-code-bg p-4 font-mono text-sm leading-6 break-all">
          <span className="text-json-key">{token[0]}</span>
          <span className="text-muted">.</span>
          <span className="text-json-string">{token[1]}</span>
          <span className="text-muted">.</span>
          <span className="text-json-number">{token[2]}</span>
        </p>
        <h3 className="pt-2 text-xl leading-7 font-bold text-heading">Header</h3>
        <p>Says how the token is signed:</p>
        <GuideCode lang="json" code={'{\n  "alg": "HS256",\n  "typ": "JWT"\n}'} />
        <h3 className="pt-2 text-xl leading-7 font-bold text-heading">Payload</h3>
        <p>The claims: statements about the user and the token itself.</p>
        <GuideCode
          lang="json"
          code={'{\n  "sub": "user_123",\n  "name": "Ann Lee",\n  "role": "admin",\n  "iat": 1760000000,\n  "exp": 1760003600\n}'}
        />
        <h3 className="pt-2 text-xl leading-7 font-bold text-heading">Signature</h3>
        <p>
          A cryptographic signature of the first two parts, made with the server&apos;s secret or private key. If anyone changes a single
          character of the header or payload, the signature no longer matches and the server rejects the token.
        </p>
      </GuideSection>

      <GuideSection id="not-encrypted" title="A JWT is signed, not encrypted">
        <p>
          This is the most important thing to understand: Base64URL is an encoding, not encryption. Anyone who has the token can read the
          payload; you can paste the example above into the <GuideLink href="/jwt-decoder">JWT Decoder</GuideLink> or decode each part with
          the <GuideLink href="/base64-converter">Base64 Converter</GuideLink>. The signature only guarantees the data wasn&apos;t changed.
          So never put passwords, card numbers or other secrets in a JWT.
        </p>
      </GuideSection>

      <GuideSection id="claims" title="Registered claims">
        <p>RFC 7519 defines a few standard claim names. All are optional, but most tokens use several:</p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm leading-6">
            <tbody>
              {claims.map(([key, name, meaning]) => (
                <tr key={key} className="border-t border-border first:border-t-0">
                  <th scope="row" className="px-4 py-3 text-left align-top font-mono font-semibold text-json-key">
                    {key}
                  </th>
                  <td className="px-4 py-3 align-top font-semibold whitespace-nowrap text-heading">{name}</td>
                  <td className="px-4 py-3">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Times such as <InlineCode>exp</InlineCode> and <InlineCode>iat</InlineCode> are Unix timestamps in <em>seconds</em>. In the example,{" "}
          <InlineCode>1760000000</InlineCode> is 9 Oct 2025, 08:53:20 UTC, and the token expires one hour later. The{" "}
          <GuideLink href="/epoch-converter">Epoch Converter</GuideLink> turns any of these into a readable date; the JWT Decoder does it
          for you and shows whether the token has expired.
        </p>
      </GuideSection>

      <GuideSection id="algorithms" title="Signing algorithms: HS256, RS256 and ES256">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            <strong className="text-heading">HS256</strong> (HMAC with SHA-256) uses one shared secret to sign and verify. Simple, but every
            service that verifies tokens can also create them.
          </li>
          <li>
            <strong className="text-heading">RS256</strong> (RSA) signs with a private key and verifies with a public key, so other services
            can check tokens without being able to issue them. Common with identity providers.
          </li>
          <li>
            <strong className="text-heading">ES256</strong> (ECDSA) works like RS256 with much smaller keys and signatures.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="decode" title="How to decode and verify a JWT">
        <p>
          Paste a token into the <GuideLink href="/jwt-decoder">JWT Decoder</GuideLink> to see the header and payload as formatted JSON, every
          claim explained and the expiry as a date. Open <strong className="text-heading">Verify</strong> and enter the secret (HS256) or
          public key (RS256, ES256) to check the signature. Decoding and verifying both happen in your browser, so the token is never sent
          anywhere. In code, decoding is just Base64URL plus <InlineCode>JSON.parse</InlineCode>:
        </p>
        <GuideCode
          lang="js"
          code={`const [header, payload] = token.split(".").slice(0, 2).map((part) =>
  JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")))
);
// For real authentication, verify the signature with a library such as jose.`}
          caption="Fine for reading a token; never trust its contents without verifying the signature."
        />
      </GuideSection>

      <GuideSection id="security" title="Common JWT security mistakes">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            <strong className="text-heading">Trusting a token without verifying it.</strong> Always check the signature on the server, with
            the algorithm you expect.
          </li>
          <li>
            <strong className="text-heading">Accepting <InlineCode>alg: none</InlineCode>.</strong> Unsigned tokens must be rejected; pin the
            allowed algorithms in your library&apos;s settings.
          </li>
          <li>
            <strong className="text-heading">Ignoring <InlineCode>exp</InlineCode>.</strong> Keep access tokens short-lived (minutes, not
            months) and use refresh tokens for longer sessions.
          </li>
          <li>
            <strong className="text-heading">Weak HS256 secrets.</strong> A short or guessable secret can be brute-forced offline from a single
            token; use at least 256 random bits.
          </li>
          <li>
            <strong className="text-heading">Putting secrets in the payload.</strong> Remember that anyone can read it.
          </li>
        </ul>
      </GuideSection>
    </GuideLayout>
  );
}
