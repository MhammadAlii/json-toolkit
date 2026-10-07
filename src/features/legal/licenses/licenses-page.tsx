import { pageMetadata } from "@/components/seo/page-metadata";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { HeartIcon } from "@/components/icons/heart";
import { Eyebrow } from "@/components/ui/eyebrow";
import { HeroBand } from "@/components/ui/hero-band";
import { StatCard } from "@/components/ui/stat-card";
import { LicenseExplorer } from "@/features/legal/licenses/license-explorer";
import { credits } from "@/features/legal/licenses/licenses";
import { site } from "@/config/site";
import { Lead } from "@/components/ui/lead";
import { PageTitle } from "@/components/ui/page-title";

export const licensesMetadata = pageMetadata({
  title: "Open Source Licenses",
  description: `Open source software, fonts and icons used by ${site.name}, with their licenses and attributions.`,
  path: "/licenses",
});

const primaryLicense = "MIT";

export function LicensesPage() {
  return (
    <>
      <HeroBand className="py-12" innerClassName="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-4">
          <Eyebrow icon={<HeartIcon className="size-2.5" />}>Built with Open Source</Eyebrow>
          <PageTitle size="md" weight="extrabold" className="tracking-[-0.25px]">Open Source Licenses</PageTitle>
          <Lead size="md">
            JSON TOOLKIT is built upon incredible work from the community. We believe in transparency and honoring the licenses of
            the tools that make our platform possible.
          </Lead>
        </div>
        <dl className="flex gap-4">
          <StatCard label="Total Dependencies" value={credits.length} />
          <StatCard label="Primary License" value={primaryLicense} highlight />
        </dl>
      </HeroBand>

      <div className="container-page py-10">
        <LicenseExplorer credits={credits} />
      </div>

      <BreadcrumbJsonLd items={[{ name: "Open Source Licenses", href: "/licenses" }]} />
    </>
  );
}
