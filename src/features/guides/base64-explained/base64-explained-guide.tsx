import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { base64ExplainedGuide } from "./meta";

export function Base64ExplainedGuidePage() {
  return (
    <GuideLayout guide={base64ExplainedGuide}>
      <p>
        Base64 turns any data (text, an image, a file) into a string made of 64 safe characters: <InlineCode>A–Z</InlineCode>,{" "}
        <InlineCode>a–z</InlineCode>, <InlineCode>0–9</InlineCode>, <InlineCode>+</InlineCode> and <InlineCode>/</InlineCode>. It exists
        because many systems were built for text only. Email, JSON, URLs and HTML attributes can&apos;t carry raw bytes safely, but they can
        carry Base64. You&apos;ll find it in data URIs (<InlineCode>data:image/png;base64,…</InlineCode>), email attachments, HTTP Basic
        authentication, JSON Web Tokens and API payloads that include files.
      </p>

      <GuideSection id="how-it-works" title="How it works">
        <p>
          Base64 takes the input 3 bytes (24 bits) at a time and splits them into four groups of 6 bits. Each 6-bit number (0–63) picks one
          character from the alphabet. The word <InlineCode>Man</InlineCode> shows it clearly:
        </p>
        <GuideCode
          lang="text"
          code={`Text      M        a        n
Bytes     77       97       110
Bits      01001101 01100001 01101110
6-bit     010011 010110 000101 101110
Index     19     22     5      46
Base64    T      W      F      u        →  "TWFu"`}
        />
        <p>
          Because 3 bytes always become 4 characters, Base64 output is about <strong className="text-heading">33% larger</strong> than the
          input: 300 bytes encode to 400 characters.
        </p>
      </GuideSection>

      <GuideSection id="padding" title="What the = padding means">
        <p>When the input length isn&apos;t a multiple of 3, the last group is short and is filled out with <InlineCode>=</InlineCode>:</p>
        <GuideCode lang="text" code={`"Man"  →  TWFu     (3 bytes, no padding)
"Ma"   →  TWE=     (2 bytes, one =)
"M"    →  TQ==     (1 byte, two =)`} />
        <p>Many decoders, including the one on this site, also accept Base64 with the padding left off.</p>
      </GuideSection>

      <GuideSection id="url-safe" title="URL-safe Base64">
        <p>
          <InlineCode>+</InlineCode> and <InlineCode>/</InlineCode> have special meanings in URLs and file names, so a variant called
          Base64URL replaces them with <InlineCode>-</InlineCode> and <InlineCode>_</InlineCode> and usually drops the padding. The same three
          bytes encode as <InlineCode>+/+/</InlineCode> in standard Base64 and <InlineCode>-_-_</InlineCode> in Base64URL. JWTs use Base64URL,
          which is why you can read a token&apos;s contents with the <GuideLink href="/jwt-decoder">JWT Decoder</GuideLink>.
        </p>
      </GuideSection>

      <GuideSection id="javascript" title="Encoding and decoding in JavaScript">
        <p>
          Browsers have <InlineCode>btoa</InlineCode> and <InlineCode>atob</InlineCode>, but they only handle characters up to code 255. An
          emoji throws an <InlineCode>InvalidCharacterError</InlineCode>, and <InlineCode>é</InlineCode> is silently encoded as Latin-1 (
          <InlineCode>6Q==</InlineCode>) instead of UTF-8 (<InlineCode>w6k=</InlineCode>). Convert to UTF-8 bytes first:
        </p>
        <GuideCode
          lang="js"
          code={`// Text → Base64, safe for any Unicode text
const encode = (text) => btoa(String.fromCharCode(...new TextEncoder().encode(text)));

// Base64 → text
const decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

encode("Hello 😀"); // "SGVsbG8g8J+YgA=="

// Node.js
Buffer.from("Hello 😀").toString("base64");          // standard
Buffer.from("Hello 😀").toString("base64url");       // URL-safe
Buffer.from("SGVsbG8=", "base64").toString("utf8");  // "Hello"`}
        />
      </GuideSection>

      <GuideSection id="python" title="Encoding and decoding in Python">
        <GuideCode
          lang="python"
          code={`import base64

base64.b64encode("Hello 😀".encode()).decode()   # "SGVsbG8g8J+YgA=="
base64.b64decode("SGVsbG8=").decode()            # "Hello"
base64.urlsafe_b64encode(data)                   # URL-safe variant`}
        />
      </GuideSection>

      <GuideSection id="online" title="Encoding and decoding online">
        <p>
          The <GuideLink href="/base64-converter">Base64 Converter</GuideLink> encodes text or any file and decodes Base64 back, as you type.
          It handles UTF-8 and emoji correctly, accepts standard and URL-safe Base64 with or without padding, strips{" "}
          <InlineCode>data:</InlineCode> prefixes, and shows decoded data as formatted JSON, text, an image preview or a hex dump. Nothing is
          uploaded: encoding and decoding happen in your browser.
        </p>
        <p>
          Remember that Base64 is not encryption. Anyone can decode it, so it only makes data <em>transportable</em>, never secret. For
          special characters in URLs, use <GuideLink href="/url-encoder">URL encoding</GuideLink> instead.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
