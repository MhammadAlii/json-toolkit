import { pageMetadata } from "@/components/seo/page-metadata";
import { Suspense } from "react";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { ContactForm } from "./contact-form";
import { ContactFormFromParams } from "./contact-form-from-params";
import { BulletList } from "@/components/ui/bullet-list";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { FaqList, type FaqItem } from "@/components/ui/faq-list";
import { FeatureCard } from "@/components/ui/feature-card";
import { BugIcon } from "@/components/icons/bug";
import { LightbulbIcon } from "@/components/icons/lightbulb";
import { PaperPlaneIcon } from "@/components/icons/paper-plane";
import { QuestionIcon } from "@/components/icons/question";
import { ShieldHalfIcon } from "@/components/icons/shield-half";
import { JsonLd } from "@/components/seo/json-ld";
import { legal } from "@/config/legal";
import { absoluteUrl, site } from "@/config/site";
import { Lead } from "@/components/ui/lead";
import { Overline } from "@/components/ui/overline";
import { PageTitle } from "@/components/ui/page-title";
import { SectionTitle } from "@/components/ui/section-title";
import { Text } from "@/components/ui/text";
import { SectionHeader } from "@/components/ui/section-header";

export const contactMetadata = pageMetadata({
  title: "Contact",
  description: `Contact ${site.name}: bug reports, feature requests, questions and privacy enquiries.`,
  path: "/contact",
});

const categories = [
  { title: "Bug Report", icon: BugIcon, tint: "bg-tint-red/10 text-tint-red", items: ["Input data sample", "Browser version", "Expected result"] },
  {
    title: "Feature Request",
    icon: LightbulbIcon,
    tint: "bg-tint-yellow/10 text-tint-yellow",
    items: ["Use case description", "Proposed workflow", "Comparison tools"],
  },
  { title: "General Question", icon: QuestionIcon, tint: "bg-brand/10 text-brand", items: ["Tool instructions", "Integration help", "General feedback"] },
  { title: "Privacy / Data", icon: ShieldHalfIcon, tint: "bg-success/10 text-success", items: ["Security audits", "Data processing", "Policy clarification"] },
];

const checklist: { key: string; value: string; tone: string }[] = [
  { key: "Tool:", value: '"JSON to CSV"', tone: "text-code-green" },
  { key: "Expected:", value: '"Comma separated headers"', tone: "text-code-green" },
  { key: "Actual:", value: '"Syntax error on line 4"', tone: "text-tint-red" },
  { key: "Browser:", value: '"Chrome 122.0.x"', tone: "text-code-green" },
  { key: "Example:", value: "[Attach JSON snippet]", tone: "text-brand" },
];

const faqs: FaqItem[] = [
  {
    q: "Do I need an account to use the tools?",
    a: "No. All tools are open and free to use without any registration or account requirements. We prioritize friction-less workflows.",
  },
  {
    q: "Can I request a custom tool?",
    a: 'Absolutely. Use the "Feature Request" category in the form above. Most of our tools were built based on community suggestions.',
  },
  {
    q: "How do I report a security vulnerability?",
    a: 'For security-related disclosures, please use the "Privacy / Data" category and mark the subject as [SECURITY]. We take these reports very seriously.',
  },
  {
    q: "Is my JSON data sent to your servers?",
    a: "Never. All processing is strictly local within your browser. The contact form opens your own email app, so even your message doesn't pass through our servers.",
  },
  {
    q: "What is the maximum file size supported?",
    a: "Generally up to 100MB depending on your browser's memory. For extremely large datasets, we recommend our specialized minification tools.",
  },
];

export function ContactPage() {
  return (
    <div className="container-page flex flex-col gap-16 py-16">
      <header className="flex flex-col gap-4">
        <PageTitle size="md">Contact JSON Toolkit</PageTitle>
        <Lead size="sm">Questions, bug reports, feature ideas, and feedback are welcome.</Lead>
      </header>

      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-10">
          <section aria-label="Request categories" className="flex flex-col gap-8">
            <Text>
              We aim to respond to all technical inquiries within 48 hours. Please choose the category that best fits your request to
              help us route your message to the right developer.
            </Text>
            <div className="grid gap-4 sm:grid-cols-2">
              {categories.map((c) => (
                <FeatureCard
                  key={c.title}
                  icon={<c.icon className="h-3.5 w-auto" />}
                  iconClassName={c.tint}
                  iconSize="sm"
                  title={c.title}
                  headingLevel="h2"
                  className="p-5"
                >
                  <BulletList marker="bullet" className="gap-1" itemClassName="text-xs leading-4 text-muted" items={c.items} />
                </FeatureCard>
              ))}
            </div>
          </section>

          <Card as="section" tone="inset" className="flex flex-col gap-4 p-6">
            <Overline as="h2">Bug Report Checklist</Overline>
            <dl className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 font-mono text-xs leading-4 text-muted">
              {checklist.map((row) => (
                <div key={row.key} className="flex flex-wrap">
                  <dt>{row.key}</dt>
                  <dd className={row.tone}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="flex items-center gap-3 text-sm leading-5 text-heading">
              <PaperPlaneIcon className="size-3.5 shrink-0 text-muted" />
              <span>
                Prefer email?{" "}
                <a href={`mailto:${legal.contactEmail}`} className="font-bold text-brand hover:underline">
                  {legal.contactEmail}
                </a>
              </span>
            </p>
            <CopyButton
              text={legal.contactEmail}
              className="flex items-center gap-2 rounded-md bg-border px-3 py-1.5 text-xs leading-4 tracking-[0.45px] text-muted transition-colors hover:text-foreground"
            />
          </Card>
        </div>

        <Card as="section" radius="2xl" className="flex flex-col gap-6 p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] sm:p-8">
          <SectionTitle size="md">Send us a message</SectionTitle>
          <Suspense fallback={<ContactForm to={legal.contactEmail} />}>
            <ContactFormFromParams to={legal.contactEmail} />
          </Suspense>
        </Card>
      </div>

      <section className="flex flex-col items-center gap-16 pt-16">
        <SectionHeader align="center" title="Frequently Asked Questions" description="Quick answers to common inquiries." />
        <FaqList items={faqs} className="w-full max-w-4xl" />
      </section>

      <BreadcrumbJsonLd items={[{ name: "Contact", href: "/contact" }]} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", name: `Contact ${site.name}`, url: absoluteUrl("/contact") }} />
    </div>
  );
}
