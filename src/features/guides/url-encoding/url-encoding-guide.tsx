import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { urlEncodingGuide } from "./meta";

export function UrlEncodingGuidePage() {
  return (
    <GuideLayout guide={urlEncodingGuide}>
      <p>
        URLs can only contain a limited set of characters. Everything else, including spaces, accented letters, emoji and characters with a
        special meaning like <InlineCode>&amp;</InlineCode> or <InlineCode>?</InlineCode> inside a value, has to be{" "}
        <strong className="text-heading">percent-encoded</strong>: written as <InlineCode>%</InlineCode> followed by the byte&apos;s value in
        hex. A space becomes <InlineCode>%20</InlineCode>, and <InlineCode>é</InlineCode>, which is two bytes in UTF-8, becomes{" "}
        <InlineCode>%C3%A9</InlineCode>.
      </p>
      <GuideCode lang="text" code={`Original   red shoes & more?
Encoded    red%20shoes%20%26%20more%3F`} />

      <GuideSection id="which-characters" title="Which characters need encoding">
        <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand">
          <li>
            <strong className="text-heading">Never encoded:</strong> letters, digits and <InlineCode>- _ . ~</InlineCode>.
          </li>
          <li>
            <strong className="text-heading">Reserved, with a meaning in URLs:</strong> <InlineCode>: / ? # [ ] @ ! $ &amp; &apos; ( ) * + , ; =</InlineCode>.
            Leave them as they are when they structure the URL, and encode them when they&apos;re part of a value. A search for{" "}
            <InlineCode>R&amp;D</InlineCode> must be sent as <InlineCode>q=R%26D</InlineCode>, or the server sees a new parameter.
          </li>
          <li>
            <strong className="text-heading">Everything else</strong>, such as spaces, quotes, <InlineCode>%</InlineCode> itself and any
            non-ASCII character, is always encoded.
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="space" title="%20 or +?">
        <p>
          Both mean “space”, but in different places. <InlineCode>%20</InlineCode> is valid everywhere in a URL. <InlineCode>+</InlineCode>{" "}
          means a space only in query strings encoded the way HTML forms send them (<InlineCode>application/x-www-form-urlencoded</InlineCode>);
          in a path, <InlineCode>+</InlineCode> is just a plus sign. When decoding a query string, check which convention the sender used,
          or <InlineCode>a+b</InlineCode> won&apos;t turn back into <InlineCode>a b</InlineCode>.
        </p>
      </GuideSection>

      <GuideSection id="javascript" title="In JavaScript">
        <p>
          JavaScript has two built-in functions, and picking the wrong one is the most common URL bug:
        </p>
        <GuideCode
          lang="js"
          code={`encodeURIComponent("a b&c=d/é?");   // "a%20b%26c%3Dd%2F%C3%A9%3F" (for a single value)
encodeURI("https://ex.com/a b?q=é&x=1#top");
// "https://ex.com/a%20b?q=%C3%A9&x=1#top" (for a whole URL; keeps : / ? & = #)

// Building a query string: let URLSearchParams do the encoding
new URLSearchParams({ q: "red shoes & more", lang: "fr" }).toString();
// "q=red+shoes+%26+more&lang=fr"

decodeURIComponent("a+b%20c");                 // "a+b c": + is not decoded
new URLSearchParams("q=a+b%20c").get("q");     // "a b c": form convention`}
        />
        <p>
          Use <InlineCode>encodeURIComponent</InlineCode> for anything you insert into a URL (a parameter value or a path segment), and{" "}
          <InlineCode>encodeURI</InlineCode> only to clean up a complete URL that may contain spaces or non-ASCII characters.
        </p>
      </GuideSection>

      <GuideSection id="python" title="In Python">
        <GuideCode
          lang="python"
          code={`from urllib.parse import quote, quote_plus, urlencode, unquote_plus

quote("a b&c=d/é?")          # "a%20b%26c%3Dd/%C3%A9%3F" (keeps / by default)
quote("a b/c", safe="")      # "a%20b%2Fc" (encode / too)
quote_plus("a b&c")          # "a+b%26c" (spaces as +, for form data)
urlencode({"q": "red shoes & more", "lang": "fr"})  # "q=red+shoes+%26+more&lang=fr"
unquote_plus("a+b%20c")      # "a b c"`}
        />
      </GuideSection>

      <GuideSection id="online" title="Encode and decode online">
        <p>
          The <GuideLink href="/url-encoder">URL Encoder/Decoder</GuideLink> encodes and decodes as you type. Choose query-value, full-URL or
          form encoding, convert many lines at once, and paste a full URL to see its parts and every query parameter decoded. If decoding
          fails, it tells you the position of the bad <InlineCode>%</InlineCode> sequence. It runs entirely in your browser.
        </p>
        <p>
          URL encoding only makes text safe <em>inside a URL</em>. To embed binary data or a whole file as text, use{" "}
          <GuideLink href="/base64-converter">Base64</GuideLink> instead.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
