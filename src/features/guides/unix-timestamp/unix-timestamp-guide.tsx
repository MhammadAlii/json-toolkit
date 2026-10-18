import { GuideCode } from "../shared/guide-code";
import { GuideLayout } from "../shared/guide-layout";
import { GuideLink } from "../shared/guide-link";
import { GuideSection } from "../shared/guide-section";
import { InlineCode } from "../shared/inline-code";
import { unixTimestampGuide } from "./meta";

export function UnixTimestampGuidePage() {
  return (
    <GuideLayout guide={unixTimestampGuide}>
      <p>
        A Unix timestamp (also called epoch time or POSIX time) is the number of seconds that have passed since{" "}
        <strong className="text-heading">1 January 1970 at 00:00:00 UTC</strong>, a moment known as the Unix epoch. For example,{" "}
        <InlineCode>1700000000</InlineCode> is 14 November 2023, 22:13:20 UTC. Because it&apos;s a single number in UTC, it&apos;s easy to
        store, sort and compare, and it means the same moment in every time zone, which is why APIs, databases, logs and JWTs use it.
      </p>

      <GuideSection id="seconds-milliseconds" title="Seconds, milliseconds and more">
        <p>Not every system counts in seconds. The quickest way to tell is the number of digits for a current date:</p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm leading-6">
            <tbody>
              {[
                ["Seconds", "10 digits", "1700000000", "PHP time(), Python int(time.time()), JWT exp"],
                ["Milliseconds", "13 digits", "1700000000000", "JavaScript Date.now(), Java System.currentTimeMillis()"],
                ["Microseconds", "16 digits", "1700000000000000", "Some logging and analytics systems"],
                ["Nanoseconds", "19 digits", "1700000000000000000", "Go's UnixNano(), tracing systems"],
              ].map(([unit, digits, example, where]) => (
                <tr key={unit} className="border-t border-border first:border-t-0">
                  <th scope="row" className="px-4 py-3 text-left font-semibold whitespace-nowrap text-heading">
                    {unit}
                  </th>
                  <td className="px-4 py-3 whitespace-nowrap">{digits}</td>
                  <td className="px-4 py-3 font-mono text-xs text-json-number">{example}</td>
                  <td className="px-4 py-3">{where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Mixing them up is a classic bug: reading milliseconds as seconds lands you tens of thousands of years in the future, and reading
          seconds as milliseconds lands you in January 1970.
        </p>
      </GuideSection>

      <GuideSection id="javascript" title="In JavaScript">
        <GuideCode
          lang="js"
          code={`Date.now();                          // current time in milliseconds
Math.floor(Date.now() / 1000);       // current time in seconds

new Date(1700000000 * 1000).toISOString();  // "2023-11-14T22:13:20.000Z"
Math.floor(new Date("2024-01-05T09:30:00Z").getTime() / 1000);  // 1704447000`}
          caption="JavaScript dates work in milliseconds, so multiply or divide by 1000."
        />
      </GuideSection>

      <GuideSection id="python" title="In Python">
        <GuideCode
          lang="python"
          code={`import time
from datetime import datetime, timezone

int(time.time())                                         # current time in seconds
datetime.fromtimestamp(1700000000, tz=timezone.utc)      # 2023-11-14 22:13:20+00:00
int(datetime(2024, 1, 5, 9, 30, tzinfo=timezone.utc).timestamp())  # 1704447000`}
          caption="Always pass tz=timezone.utc; without it Python uses the computer's local time zone."
        />
      </GuideSection>

      <GuideSection id="shell" title="In the terminal">
        <GuideCode
          lang="shell"
          code={`date +%s                      # current timestamp
date -u -d @1700000000        # Linux (GNU date)
date -u -r 1700000000         # macOS (BSD date)`}
        />
      </GuideSection>

      <GuideSection id="year-2038" title="The year 2038 problem">
        <p>
          Many older systems stored timestamps as a signed 32-bit integer, whose largest value is <InlineCode>2147483647</InlineCode>: 19
          January 2038 at 03:14:07 UTC. One second later the number overflows and wraps around to 1901. Modern systems use 64-bit timestamps,
          which last for billions of years, but embedded devices, old databases and file formats can still be affected. If you store
          timestamps yourself, use a 64-bit column.
        </p>
      </GuideSection>

      <GuideSection id="online" title="Converting timestamps online">
        <p>
          The <GuideLink href="/epoch-converter">Epoch Converter</GuideLink> turns a timestamp into a date in UTC, your own time zone, ISO 8601
          and more, or a date back into a timestamp. It detects seconds, milliseconds, microseconds and nanoseconds by length, and converts a
          whole list at once if you paste one per line. Decoding a token? The <GuideLink href="/jwt-decoder">JWT Decoder</GuideLink> shows{" "}
          <InlineCode>exp</InlineCode> and <InlineCode>iat</InlineCode> as dates automatically.
        </p>
      </GuideSection>
    </GuideLayout>
  );
}
