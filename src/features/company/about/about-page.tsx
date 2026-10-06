import { pageMetadata } from "@/components/seo/page-metadata";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BulletList } from "@/components/ui/bullet-list";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { FeatureCard } from "@/components/ui/feature-card";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { BoltIcon } from "@/components/icons/bolt";
import { CodeBracketsIcon } from "@/components/icons/code-brackets";
import { EnvelopeIcon } from "@/components/icons/envelope";
import { GithubIcon } from "@/components/icons/github";
import { HandHeartIcon } from "@/components/icons/hand-heart";
import { ShieldHalfIcon } from "@/components/icons/shield-half";
import { SimpleIcon } from "@/components/icons/simple";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, site } from "@/config/site";
import { CodeWindow } from "./code-window";
import { InfoPanel } from "./info-panel";
import { WorkflowSteps } from "./workflow-steps";
import { Lead } from "@/components/ui/lead";
import { Overline } from "@/components/ui/overline";
import { PageTitle } from "@/components/ui/page-title";
import { SectionTitle } from "@/components/ui/section-title";
import { Text } from "@/components/ui/text";
import { SectionHeader } from "@/components/ui/section-header";

export const aboutMetadata = pageMetadata({
  title: "About",
  description: `About ${site.name}: fast, private JSON tools for developers that run entirely in your browser.`,
  path: "/about",
});

const principles = [
  { title: "Fast", icon: BoltIcon, body: "Optimized algorithms for processing large JSON datasets instantly." },
  { title: "Simple", icon: SimpleIcon, body: "Minimalist UI that focuses on the data, not the decorations." },
  { title: "Dev-First", icon: CodeBracketsIcon, body: "Built with features like JSONPath, Type Generation, and CLI-like speed." },
  { title: "Private", icon: ShieldHalfIcon, body: "Your data never leaves your browser. Processing is strictly local." },
];

const workflow = ["Paste", "Configure", "Process", "Inspect", "Copy"];

const inside: { title: string; items: { label: string; href?: string }[] }[] = [
  {
    title: "JSON Core",
    items: [
      { label: "Formatter & Beautifier", href: "/json-formatter" },
      { label: "Minifier / Compressor", href: "/json-minifier" },
      { label: "Validator (RFC 8259)", href: "/json-validator" },
      { label: "Repair & Clean", href: "/json-repair" },
    ],
  },
  {
    title: "Explore JSON",
    items: [
      { label: "Interactive Tree View", href: "/json-formatter" },
      { label: "Table Data Explorer", href: "/json-formatter" },
      { label: "JSON Deep Search", href: "/json-deep-search" },
      { label: "Type Inference", href: "/json-to-typescript" },
    ],
  },
  {
    title: "Compare & Query",
    items: [
      { label: "Visual Diff Checker", href: "/json-diff" },
      { label: "JSONPath Tester", href: "/json-query" },
      { label: "JQ Query Online" },
      { label: "Schema Validation", href: "/json-schema-validator" },
    ],
  },
  {
    title: "Converters",
    items: [
      { label: "JSON to YAML / CSV", href: "/json-to-yaml" },
      { label: "JSON to TypeScript", href: "/json-to-typescript" },
      { label: "JSON to SQL Inserts", href: "/json-to-sql" },
      { label: "JSON to XML / Excel", href: "/json-to-xml" },
    ],
  },
];

export function AboutPage() {
  return (
    <div className="container-page flex flex-col gap-20 py-16">
      <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-2xl flex-col items-start gap-6 pt-0.5">
          <Badge>About JSON Toolkit</Badge>
          <PageTitle size="display" className="tracking-[-0.14px]">
            Better JSON tools for the <br className="hidden sm:block" />
            modern developer.
          </PageTitle>
          <Lead>
            JSON Toolkit is a collection of essential utilities designed to solve common data manipulation hurdles. Secure, fast,
            and entirely client-side.
          </Lead>
        </div>
        <CodeWindow flags={["fast", "simple", "developerFirst"]} />
      </section>

      <Card as="section" radius="2xl" className="p-6 sm:p-10">
        <div className="flex max-w-3xl flex-col gap-4">
          <SectionTitle>Why we built it</SectionTitle>
          <Text className="pt-2">
            In the age of API-first development, JSON is the lingua franca of the web. Yet, developers often find themselves
            jumping between bloated websites or running questionable CLI tools just to format a payload or convert a schema.
          </Text>
          <Text>
            We wanted a sanctuary: a clean, high-performance, and privacy-respecting toolkit that stays out of your way while
            providing the precision you need for debugging and data transformation.
          </Text>
        </div>
      </Card>

      <section className="flex flex-col gap-12">
        <h2 className="text-center text-sm leading-5 font-bold tracking-[2px] text-muted uppercase">Core Principles</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => (
            <FeatureCard key={p.title} icon={<p.icon className="h-4 w-auto" />} title={p.title}>
              <p className="text-sm leading-5 text-muted">{p.body}</p>
            </FeatureCard>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-10 pt-4">
        <SectionTitle className="text-center">Built around real developer workflows</SectionTitle>
        <WorkflowSteps steps={workflow} />
      </section>

      <section className="flex flex-col gap-12 pt-4">
        <SectionHeader title="What's inside JSON Toolkit?" description="A comprehensive suite for every JSON-related task." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {inside.map((group) => (
            <Card key={group.title} className="flex flex-col gap-4 p-6">
              <Overline>{group.title}</Overline>
              <BulletList
                className="gap-[11.5px]"
                itemClassName="text-sm leading-5 text-heading"
                items={group.items.map((item) =>
                  item.href ? (
                    <Link key={item.label} href={item.href} className="hover:text-brand">
                      {item.label}
                    </Link>
                  ) : (
                    item.label
                  ),
                )}
              />
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-8 pt-4 md:grid-cols-2">
        <InfoPanel icon={<ShieldHalfIcon className="size-5 text-success" />} title="Built with privacy in mind">
          <Text variant="small">
            We never see your data. All formatting, conversion, and validation happens locally in your browser&apos;s memory. We
            don&apos;t store JSON payloads on any server.
          </Text>
          <Link href="/privacy" className="flex items-center gap-2 text-sm leading-5 font-semibold text-brand hover:opacity-80">
            Read Privacy Policy <ArrowRightIcon className="h-2.5 w-auto" />
          </Link>
        </InfoPanel>
        <InfoPanel icon={<HandHeartIcon className="h-5 w-auto text-brand" />} title="Free for developers">
          {/* Differs from the design: "No trackers, no cookies" is false with AdSense. */}
          <Text variant="small">
            The toolkit is sustained by minimal, non-intrusive ads that never see the JSON you work with. Our goal is to keep these
            tools free forever.
          </Text>
          <div>
            <ButtonLink href="/contact" variant="outline" size="compact">
              Support Us
            </ButtonLink>
          </div>
        </InfoPanel>
      </div>

      <section className="flex flex-col gap-8 pt-4 lg:flex-row lg:gap-12">
        <div className="flex flex-col gap-[15px] lg:w-[567px] lg:shrink-0">
          <SectionTitle size="md">Who builds it?</SectionTitle>
          <Text variant="small">
            JSON Toolkit is an independent project maintained by a small team of developers who believe that essential tooling
            should be fast, elegant, and free. We prioritize community needs and real-world utility over profit.
          </Text>
        </div>
        <Card tone="inset" className="flex flex-1 flex-col gap-4 p-6">
          <h2 className="flex items-center gap-2 text-sm leading-5 font-bold text-heading">
            <GithubIcon className="size-3.5" /> Open Source &amp; Dependencies
          </h2>
          <p className="pb-2 text-xs leading-[19.5px] text-muted">
            We leverage industry-standard open-source libraries to ensure reliability and performance. We give back by contributing
            to the upstream projects we use.
          </p>
          <ButtonLink href="/licenses" variant="subtle" size="compact">
            View Licenses &amp; Credits
          </ButtonLink>
        </Card>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-brand/20 bg-[linear-gradient(165deg,rgba(124,92,255,0.1)_0%,rgba(124,92,255,0)_100%)] px-6 pt-16 pb-12 sm:px-16 sm:pt-20 sm:pb-16">
        <div aria-hidden className="absolute -top-20 -right-24 size-64 rounded-full bg-brand/5 blur-[32px]" />
        <div aria-hidden className="absolute -bottom-24 -left-24 size-64 rounded-full bg-brand/5 blur-[32px]" />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl leading-9 font-bold tracking-[-0.03px] text-heading sm:text-3xl">
            Have an idea for a better developer tool?
          </h2>
          <Text variant="caption" className="max-w-xl">
            Help us shape the future of JSON Toolkit. Whether it&apos;s a bug report or a brand new tool request, we&apos;d love to
            hear from you.
          </Text>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <ButtonLink href="/contact" size="lg" className="shadow-[0_10px_15px_-3px_rgba(124,92,255,0.2),0_4px_6px_-4px_rgba(124,92,255,0.2)]">
              <EnvelopeIcon className="size-4" /> Contact Us
            </ButtonLink>
            <ButtonLink href="/contact?type=feature" variant="secondary" size="lg">
              Suggest a Tool
            </ButtonLink>
            <ButtonLink href="/contact?type=bug" variant="secondary" size="lg">
              Report a Bug
            </ButtonLink>
          </div>
        </div>
      </section>

      <BreadcrumbJsonLd items={[{ name: "About", href: "/about" }]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `About ${site.name}`,
          url: absoluteUrl("/about"),
          about: { "@type": "Organization", name: site.name, url: absoluteUrl("/") },
        }}
      />
    </div>
  );
}
