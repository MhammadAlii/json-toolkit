import Link from "next/link";
import { BoltIcon } from "@/components/icons/bolt";
import { HandHeartIcon } from "@/components/icons/hand-heart";
import { ShieldHalfIcon } from "@/components/icons/shield-half";
import { FaqJsonLd } from "@/components/seo/faq-json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { FaqList } from "@/components/ui/faq-list";
import { Lead } from "@/components/ui/lead";
import { PageTitle } from "@/components/ui/page-title";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionTitle } from "@/components/ui/section-title";
import { absoluteUrl, site } from "@/config/site";
import { AdSlot } from "@/features/ads/ad-slot";
import { toolsInCategory } from "@/features/catalog";
import { guides } from "@/features/guides/registry";
import { GuideCard } from "@/features/guides/shared/guide-card";
import { FormatterWorkspace } from "@/features/tools/formatter/formatter-workspace";
import { homeFaqs } from "./home-faqs";
import { HomeHighlight } from "./home-highlight";
import { HomeToolGroup } from "./home-tool-group";

export function HomePage() {
  return (
    <div className="container-page flex flex-col gap-8 py-12">
      {/* The hero text is centred on the whole page; the ad is pinned top-right outside the flow so it can't shift the
          title, and the intro is kept narrow enough on wide screens to stay clear of it. */}
      <section className="relative flex flex-col items-center gap-4 pt-0.5 text-center">
        <Badge>Free developer toolkit</Badge>
        <PageTitle>JSON tools for developers.</PageTitle>
        <Lead size="sm" className="max-w-2xl pb-2 text-balance xl:max-w-[560px]">
          Format, validate, repair, explore and convert JSON — directly in your browser.
        </Lead>
        <Badge tone="success" size="note" icon={<ShieldHalfIcon className="size-3" />}>
          Runs in your browser — your data never leaves your device.
        </Badge>
        <AdSlot placement="hero" className="absolute top-0 right-0 hidden w-[300px] xl:block" />
      </section>

      <section aria-label="JSON formatter" className="pt-6">
        <FormatterWorkspace />
      </section>

      <AdSlot placement="toolBelow" />

      <section aria-labelledby="all-tools" className="flex flex-col gap-6 pt-8">
        <div className="flex flex-col gap-2">
          <SectionTitle id="all-tools">Everything you need to work with JSON</SectionTitle>
          <p className="max-w-3xl text-base leading-[26px] text-muted">
            {site.name} brings the JSON tools developers reach for every day into one place: check and fix JSON, explore and compare it,
            convert it to the format your next tool expects, and handle the tokens, encodings and timestamps that come with it.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <HomeToolGroup
            title="JSON tools"
            description="Format, validate, repair, minify, explore, search, compare and query JSON."
            href="/tools"
            more="See all JSON tools"
            tools={[...toolsInCategory("core"), ...toolsInCategory("explore"), ...toolsInCategory("query")]}
          />
          <HomeToolGroup
            title="Converters"
            description="Turn JSON into YAML, CSV, Excel, XML, SQL or TypeScript, or escape it as a string."
            href="/converters"
            more="See all converters"
            tools={toolsInCategory("converters")}
          />
          <HomeToolGroup
            title="Utilities"
            description="Decode JWTs, encode URLs and Base64, and convert Unix timestamps."
            href="/utilities"
            more="See all utilities"
            tools={toolsInCategory("utilities")}
          />
        </div>
      </section>

      <section aria-labelledby="why" className="flex flex-col gap-6 pt-8">
        <SectionTitle id="why">Why developers use {site.name}</SectionTitle>
        <div className="grid gap-4 md:grid-cols-3">
          <HomeHighlight icon={<ShieldHalfIcon className="h-4 w-auto text-success" />} title="Your data stays on your device">
            Every tool runs in your browser. Nothing you paste or drop in is uploaded, logged or stored, so it&apos;s safe for API
            responses, tokens and production data.
          </HomeHighlight>
          <HomeHighlight icon={<BoltIcon className="h-4 w-auto text-tint-amber" />} title="Instant results">
            Output updates as you type, with no upload and no waiting. Errors point to the exact line and column, and large files stay
            responsive.
          </HomeHighlight>
          <HomeHighlight icon={<HandHeartIcon className="h-4 w-auto text-tint-violet" />} title="Free, with no sign-up">
            Every tool is free to use without an account, a trial or a daily limit. Open a page and start working.
          </HomeHighlight>
        </div>
      </section>

      <section aria-labelledby="guides" className="flex flex-col gap-6 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeader title="JSON guides" description="Practical answers to common JSON questions, each with a tool to try it." />
          <Link href="/guides" className="text-sm font-semibold text-brand hover:underline">
            All guides →
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.slice(0, 3).map((g) => (
            <li key={g.slug}>
              <GuideCard guide={g} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="home-faq" className="flex flex-col gap-6 pt-8">
        <SectionTitle id="home-faq">Frequently asked questions</SectionTitle>
        <FaqList items={homeFaqs} className="max-w-4xl" />
      </section>

      <FaqJsonLd items={homeFaqs} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: absoluteUrl("/"),
          description: site.description,
        }}
      />
    </div>
  );
}
