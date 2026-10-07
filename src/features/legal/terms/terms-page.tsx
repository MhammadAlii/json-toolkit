import { pageMetadata } from "@/components/seo/page-metadata";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { EnvelopeIcon } from "@/components/icons/envelope";
import { BulletList } from "@/components/ui/bullet-list";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { HeroBand } from "@/components/ui/hero-band";
import { IconTile } from "@/components/ui/icon-tile";
import { SectionNav, type NavSection } from "@/components/ui/section-nav";
import Link from "next/link";
import { LegalParagraph } from "../components/legal-paragraph";
import { LegalSection } from "../components/legal-section";
import { formatLegalDate, legal } from "@/config/legal";
import { site } from "@/config/site";
import { Lead } from "@/components/ui/lead";
import { PageTitle } from "@/components/ui/page-title";

export const termsMetadata = pageMetadata({
  title: "Terms of Service",
  description: `The terms that govern your use of ${site.name} and its free online JSON tools.`,
  path: "/terms",
});

// TODO: fill the placeholders in src/config/legal.ts and have this copy legally reviewed.

const nav: NavSection[] = [
  { id: "acceptance", label: "1. Acceptance" },
  { id: "service", label: "2. Service Description" },
  { id: "free-service", label: "3. Free Service Tier" },
  { id: "responsibilities", label: "4. User Responsibilities" },
  { id: "user-content", label: "5. User Content" },
  { id: "privacy", label: "6. Privacy & Data" },
  { id: "advertising", label: "7. Advertising" },
  { id: "third-parties", label: "8. Third Parties" },
  { id: "ip", label: "9. Intellectual Property" },
  { id: "open-source", label: "10. Open Source" },
  { id: "disclaimer", label: "11. Disclaimer" },
  { id: "liability", label: "12. Liability" },
  { id: "changes", label: "13. Changes" },
  { id: "contact", label: "14. Contact" },
];

const entity = <span className="font-medium text-emphasis">{legal.entityName}</span>;

export function TermsPage() {
  return (
    <>
      <HeroBand>
        <div className="flex max-w-3xl flex-col gap-4">
          <Eyebrow>Last Updated: {formatLegalDate(legal.lastUpdated)}</Eyebrow>
          <PageTitle weight="extrabold">Terms of Service</PageTitle>
          <Lead size="md" className="pt-2">
            Please read these terms carefully. They constitute a binding agreement between you and {entity} regarding your use of
            JSON TOOLKIT and its associated services.
          </Lead>
        </div>
      </HeroBand>

      <div className="container-page flex items-start gap-12 py-8 sm:py-12">
        <aside className="sticky top-24 hidden w-72 shrink-0 lg:block">
          <SectionNav sections={nav} />
        </aside>

        <article className="flex max-w-3xl min-w-0 flex-1 flex-col gap-12 pb-24 lg:pt-12">
          <LegalSection id="acceptance" title="1. Acceptance of Terms">
            <LegalParagraph>
              By accessing or using JSON TOOLKIT, you agree to be bound by these Terms of Service and all applicable laws and
              regulations in <span className="text-emphasis">{legal.jurisdiction}</span>. If you do not agree with any of these
              terms, you are prohibited from using or accessing this site.
            </LegalParagraph>
            <LegalParagraph>
              These terms apply to all visitors, users, and others who access or use the Service. Your access to and use of the
              Service is conditioned on your acceptance of and compliance with these Terms.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="service" title="2. Service Description">
            <LegalParagraph>
              JSON TOOLKIT provides a comprehensive suite of developer tools for JSON manipulation, including but not limited to
              formatting, validation, conversion, and schema generation.
            </LegalParagraph>
            <pre className="overflow-x-auto rounded-lg border border-border bg-surface px-6 pt-7 pb-6 font-mono text-sm leading-5 text-emphasis">
              <span className="font-bold text-brand">const</span>
              {` toolkitServices = [
  "JSON Formatting & Linting",
  "JSON Validation",
  "TypeScript Interface Generation",
  "CSV / YAML Conversion" ];`}
            </pre>
          </LegalSection>

          <LegalSection id="free-service" title="3. Free Service Tier">
            <LegalParagraph>
              The Free Tier of JSON TOOLKIT is provided &ldquo;as is&rdquo; and without warranty. We reserve the right to limit the
              number of operations per minute or total data processed for users on the free plan.
            </LegalParagraph>
            <BulletList
              marker="arrow"
              className="gap-[11px] pt-[3px]"
              itemClassName="text-base leading-[25.6px] text-secondary"
              items={[
                "Rate limiting may be applied per IP address.",
                "No guaranteed uptime.",
                "Data you enter is processed in your browser and is not stored by us.",
              ]}
            />
          </LegalSection>

          <LegalSection id="responsibilities" title="4. User Responsibilities">
            <LegalParagraph>As a user of our developer tools, you agree not to:</LegalParagraph>
            <BulletList
              marker="arrow"
              className="gap-[11px] pt-[3px]"
              itemClassName="text-base leading-[25.6px] text-secondary"
              items={[
                "Attempt to reverse engineer the core serialization engine.",
                "Use the Service to build a competing JSON processing product.",
                "Submit data containing malware or malicious scripts.",
                "Use the toolkit to process PII (Personally Identifiable Information) without proper safeguards.",
              ]}
            />
          </LegalSection>

          <LegalSection id="user-content" title="5. User Content">
            <LegalParagraph>
              JSON TOOLKIT does not claim ownership of the JSON data, schemas, or code snippets you process through our tools. By
              using the service, you grant us a temporary license to process and display this content solely for the purpose of
              providing the requested service.
            </LegalParagraph>
            <LegalParagraph>You are solely responsible for ensuring you have the necessary rights to any data you input into the toolkit.</LegalParagraph>
          </LegalSection>

          <LegalSection id="privacy" title="6. Privacy & Data Handling">
            <LegalParagraph>
              Your privacy is critical to us. Please refer to our{" "}
              <Link href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>{" "}
              for detailed information on how we collect and use your data. In short, we do not sell your JSON inputs to third
              parties.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="advertising" title="7. Advertising">
            <LegalParagraph>
              The Service may contain advertisements, which may be targeted to the content of information on the Service, queries
              made through the Service, or other information.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="third-parties" title="8. Third Party Services">
            <LegalParagraph>
              Our Service may contain links to third-party web sites or services that are not owned or controlled by {entity}. We
              strongly advise you to read the terms and conditions and privacy policies of any third-party web sites or services
              that you visit.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="ip" title="9. Intellectual Property">
            <LegalParagraph>
              The Service and its original content (excluding User Content), features, and functionality are and will remain the
              exclusive property of {entity} and its licensors. Our trademarks and trade dress may not be used in connection with
              any product or service without the prior written consent.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="open-source" title="10. Open Source Components">
            <LegalParagraph>
              Portions of the Service may use open-source software libraries. A list of these components and their respective
              licenses is available on our{" "}
              <Link href="/licenses" className="rounded bg-surface-2 px-1.5 font-mono text-brand hover:underline">
                Open Source Licenses
              </Link>{" "}
              page.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="disclaimer" title="11. Disclaimer">
            <blockquote className="border-l-4 border-brand bg-surface p-6 text-base leading-6 text-secondary italic">
              &ldquo;Your use of the service is at your sole risk. The service is provided on an &lsquo;AS IS&rsquo; and &lsquo;AS
              AVAILABLE&rsquo; basis. The service is provided without warranties of any kind, whether express or implied.&rdquo;
            </blockquote>
          </LegalSection>

          <LegalSection id="liability" title="12. Limitation of Liability">
            <LegalParagraph>
              In no event shall {entity}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for
              any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits,
              data, use, goodwill, or other intangible losses.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="changes" title="13. Changes to Terms">
            <LegalParagraph>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material
              we will try to provide at least 30 days notice prior to any new terms taking effect.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="contact" title="14. Contact Us">
            <LegalParagraph>If you have any questions about these Terms, please contact the legal department:</LegalParagraph>
            <Card className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:px-8 sm:pt-9 sm:pb-8">
              <IconTile size="lg" round>
                <EnvelopeIcon className="size-5" />
              </IconTile>
              <div className="flex flex-col gap-1 sm:gap-6 sm:pb-6">
                <p className="text-base leading-7 font-bold text-secondary">Legal Support Team</p>
                <p className="font-mono text-base leading-7 break-all text-secondary">{legal.legalEmail}</p>
              </div>
              <div className="sm:ml-auto">
                <ButtonLink href="/contact" variant="secondary" size="sm">
                  Submit Inquiry
                </ButtonLink>
              </div>
            </Card>
          </LegalSection>
        </article>
      </div>

      <BreadcrumbJsonLd items={[{ name: "Terms of Service", href: "/terms" }]} />
    </>
  );
}
