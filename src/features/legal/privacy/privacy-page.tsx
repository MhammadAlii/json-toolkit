import { pageMetadata } from "@/components/seo/page-metadata";
import { AdSlot } from "@/features/ads/ad-slot";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { AdBoxIcon } from "@/components/icons/ad-box";
import { DatabaseIcon } from "@/components/icons/database";
import { EnvelopeIcon } from "@/components/icons/envelope";
import { MicrochipIcon } from "@/components/icons/microchip";
import { NetworkIcon } from "@/components/icons/network";
import { UserSlashIcon } from "@/components/icons/user-slash";
import { legal } from "@/config/legal";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/button-link";
import { IconTile } from "@/components/ui/icon-tile";
import { Lead } from "@/components/ui/lead";
import { PageTitle } from "@/components/ui/page-title";
import { SectionTitle } from "@/components/ui/section-title";
import { Text } from "@/components/ui/text";

export const privacyMetadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${site.name} handles your data: JSON is processed locally in your browser and never uploaded. Details on advertising cookies and consent.`,
  path: "/privacy",
});

type PolicyPoint = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tint: string;
  body: React.ReactNode;
  extra?: React.ReactNode;
  highlight?: boolean;
};

const link = "font-medium text-brand underline-offset-2 hover:underline";

// Advertising copy differs from the design on purpose: "no cookies / no tracking" is false with AdSense
// and its policy requires disclosing third-party ad cookies.
const points: PolicyPoint[] = [
  {
    title: "Local JSON Processing",
    icon: MicrochipIcon,
    tint: "bg-brand/10 text-brand",
    highlight: true,
    body: (
      <>
        Unlike other online tools, we don&apos;t send your JSON to a server for formatting or validation. All processing logic
        happens in your browser&apos;s memory using client-side JavaScript.
      </>
    ),
    extra: (
      <div className="inline-flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background/50 px-3 pt-4 pb-3 font-mono text-xs leading-4">
        <span className="flex items-center gap-1 text-code-green">
          <NetworkIcon className="h-3 w-[15px]" /> Network Status:
        </span>
        <span className="text-muted">0 bytes transmitted to server during processing</span>
      </div>
    ),
  },
  {
    title: "No Account Required",
    icon: UserSlashIcon,
    tint: "bg-tint-amber/10 text-tint-amber",
    body: (
      <>
        We don&apos;t want your email address, your name, or your GitHub profile. All tools are available instantly without any
        login or registration process. We believe tools should be tools, not data-collection funnels.
      </>
    ),
  },
  {
    title: "Zero Data Persistence",
    icon: DatabaseIcon,
    tint: "bg-tint-blue/10 text-tint-blue",
    body: (
      <>
        When you close the tab, your data is gone. We never write the JSON you paste or upload to a database, local storage, or
        cookies. Your text area content lives and dies with your session. To know which tools are used, we count anonymous page
        views with Vercel Web Analytics, which sets no cookies, can&apos;t identify you and never sees what you enter.
      </>
    ),
  },
  {
    title: "Advertising & Cookies",
    icon: AdBoxIcon,
    tint: "bg-tint-violet/10 text-tint-violet",
    body: (
      <>
        Running this service costs money, so we show ads served by Google AdSense. Google and its partners use cookies to serve
        ads based on your prior visits to this and other websites. Visitors in the EEA, UK and Switzerland are asked for consent
        before personalised ads or non-essential cookies are used. Ads never have access to the JSON you enter into a tool.
      </>
    ),
    extra: (
      <p className="text-sm leading-6 text-muted">
        Opt out of personalised advertising in{" "}
        <a className={link} href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>
        , or learn{" "}
        <a className={link} href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          how Google uses data from partner sites
        </a>
        .
      </p>
    ),
  },
];

export function PrivacyPage() {
  return (
    <div className="container-page flex flex-col gap-16 py-8 sm:pb-16">
      <section className="flex flex-col items-start gap-4">
        <PageTitle>Privacy First.</PageTitle>
        <Lead className="max-w-3xl pt-2">
          Your JSON data is sensitive. That&apos;s why <span className="text-foreground">JSON TOOLKIT</span> processes everything
          locally in your browser. No servers, no uploads, no compromises.
        </Lead>
        <p className="text-xs text-subtle">Last updated: {legal.lastUpdated}</p>
      </section>

      <div className="flex flex-col gap-8">
        {points.map((c) => (
          <section
            key={c.title}
            className="relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(154deg,#12151c_0%,#0f1218_100%)] p-6 sm:p-8"
          >
            {c.highlight && (
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand via-brand/0 via-50% to-brand/0 opacity-30" />
            )}
            <div className="relative flex flex-col gap-6 sm:flex-row">
              <IconTile size="lg" className={c.tint}>
                <c.icon className="h-5 w-auto" />
              </IconTile>
              <div className="flex min-w-0 flex-col items-start gap-3">
                <SectionTitle size="md">{c.title}</SectionTitle>
                <Text className="max-w-3xl">{c.body}</Text>
                {c.extra}
              </div>
            </div>
          </section>
        ))}
      </div>

      <AdSlot placement="inContent" className="min-h-[160px]" />

      <section className="flex flex-col gap-6 border-t border-border pt-16">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-0.5 w-8 bg-brand" />
          <SectionTitle>Built for Developers</SectionTitle>
        </div>
        <div className="grid gap-6 text-base leading-[26px] text-muted md:grid-cols-2 md:gap-12">
          <p>
            We started JSON TOOLKIT because we were tired of &ldquo;free&rdquo; tools that sold user data or required logging in just
            to format a simple config file. Our philosophy is simple: tools should be fast, private, and open. We prioritize the
            developer experience and data security above all else.
          </p>
          <p>
            Transparency is key to trust. While the code is proprietary, the architecture is designed to be inspected. You can
            monitor your browser&apos;s network tab at any time while using our tools to verify that no JSON data is ever being
            transmitted to our servers.
          </p>
        </div>
      </section>

      <section className="flex flex-col items-center gap-2 rounded-2xl border border-brand/20 bg-brand/5 p-8 text-center">
        <SectionTitle size="md">Have a privacy concern?</SectionTitle>
        <Text variant="caption" className="pb-4">
          We take your data security seriously. If you have questions about how we handle data, reach out.
        </Text>
        <ButtonLink href={`mailto:${legal.privacyEmail}`}>
          <EnvelopeIcon className="size-4" /> Contact Privacy Officer
        </ButtonLink>
      </section>

      <BreadcrumbJsonLd items={[{ name: "Privacy Policy", href: "/privacy" }]} />
    </div>
  );
}
